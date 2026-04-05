import { randomUUID } from "node:crypto";
import {
  createDomainEvent,
  DomainEvent,
  escalate,
  ExceptionService,
  fail,
  NoopExceptionService,
  NoopLogger,
  ok,
  OperationResult,
  review,
  RuntimeLogger
} from "../../../shared";
import {
  RawImportRecord,
  SupplierImportSummary,
  SupplierIntakeOutput
} from "../contracts/raw-import-record.contract";
import {
  ParsedSupplierPayload,
  SupplierImportTrigger,
  SupplierSourceClient,
  SupplierSourceConfig
} from "../contracts/supplier-source.contract";
import {
  NoopSupplierImportRepository,
  SupplierImportRepository
} from "../repositories/supplier-import.repository";
import { NoopRawPayloadPersisterService, RawPayloadPersisterService } from "./raw-payload-persister.service";

function createSummary(records: RawImportRecord[], parseWarnings: string[]): SupplierImportSummary {
  return {
    recordsReceived: records.length,
    recordsParsed: records.length,
    recordsAccepted: records.filter((record) => record.prevalidationStatus === "accepted_for_normalization").length,
    recordsRejected: records.filter((record) => record.prevalidationStatus === "rejected_invalid_row").length,
    recordsReviewRequired: records.filter((record) => record.prevalidationStatus === "review_required_row").length,
    parseErrorCount: parseWarnings.length
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function resolveSourceProductReference(record: Record<string, unknown>): string | null {
  const candidateKeys = ["source_product_reference", "sourceProductReference", "supplier_sku", "supplierSku", "sku", "id"];

  for (const key of candidateKeys) {
    const value = record[key];
    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }
  }

  return null;
}

function prevalidateRecords(rawRecords: unknown[]): RawImportRecord[] {
  return rawRecords.map((rawRecord, index) => {
    const rowNumber = index + 1;

    if (!isRecord(rawRecord)) {
      return {
        rowNumber,
        rawPayload: rawRecord,
        prevalidationStatus: "rejected_invalid_row",
        warningCodes: [],
        errorCodes: ["INVALID_ROW_STRUCTURE"]
      };
    }

    const sourceProductReference = resolveSourceProductReference(rawRecord);
    const hasAnyContent = Object.values(rawRecord).some((value) => value !== null && value !== "");

    if (!hasAnyContent) {
      return {
        rowNumber,
        sourceProductReference,
        rawPayload: rawRecord,
        prevalidationStatus: "rejected_invalid_row",
        warningCodes: [],
        errorCodes: ["EMPTY_ROW"]
      };
    }

    if (!sourceProductReference) {
      return {
        rowNumber,
        sourceProductReference,
        rawPayload: rawRecord,
        prevalidationStatus: "rejected_invalid_row",
        warningCodes: [],
        errorCodes: ["MISSING_SOURCE_PRODUCT_REFERENCE"]
      };
    }

    return {
      rowNumber,
      sourceProductReference,
      rawPayload: rawRecord,
      prevalidationStatus: "accepted_for_normalization",
      warningCodes: [],
      errorCodes: []
    };
  });
}

export interface SupplierIntakeRunInput {
  sourceConfig: SupplierSourceConfig;
  trigger: SupplierImportTrigger;
}

export class SupplierIntakeService {
  constructor(
    private readonly sourceClient: SupplierSourceClient,
    private readonly payloadPersister: RawPayloadPersisterService = new NoopRawPayloadPersisterService(),
    private readonly supplierImportRepository: SupplierImportRepository = new NoopSupplierImportRepository(),
    private readonly logger: RuntimeLogger = new NoopLogger(),
    private readonly exceptionService: ExceptionService = new NoopExceptionService()
  ) {}

  async runImport(input: SupplierIntakeRunInput): Promise<OperationResult<SupplierIntakeOutput>> {
    const importId = randomUUID();
    const domainEvents: DomainEvent[] = [
      createDomainEvent({
        eventType: "supplier_import_started",
        entityType: "supplier_import",
        entityId: importId,
        eventSource: "supplier_intake_service",
        payload: {
          supplierId: input.sourceConfig.supplierId,
          trigger: input.trigger
        }
      })
    ];

    this.logger.info("Supplier intake started", {
      importId,
      supplierId: input.sourceConfig.supplierId,
      trigger: input.trigger
    });

    await this.supplierImportRepository.recordImportStarted({
      importId,
      supplierId: input.sourceConfig.supplierId,
      sourceReference: null
    });

    let fetchedPayload;
    try {
      fetchedPayload = await this.sourceClient.fetchSource(input.sourceConfig);
    } catch (error) {
      await this.supplierImportRepository.recordImportCompleted({
        importId,
        finalStatus: "failed",
        recordsReceived: 0,
        recordsValid: 0,
        recordsInvalid: 0,
        errorSummary: "Supplier source fetch failed."
      });
      const exception = await this.exceptionService.createException({
        entityType: "supplier_import",
        entityId: importId,
        domain: "supplier_intake",
        severity: "high",
        reasonCode: "SOURCE_UNREACHABLE",
        summary: "Supplier source could not be fetched.",
        details: {
          supplierId: input.sourceConfig.supplierId,
          error: error instanceof Error ? error.message : "Unknown error"
        }
      });

      return fail(
        "source_fetch_failed",
        "Supplier source fetch failed.",
        {
          domainEvents,
          exception,
          recommendedNextStep: "check_supplier_source_and_retry"
        },
        true
      );
    }

    domainEvents.push(
      createDomainEvent({
        eventType: "supplier_payload_fetched",
        entityType: "supplier_import",
        entityId: importId,
        eventSource: "supplier_intake_service",
        payload: {
          sourceReference: fetchedPayload.sourceReference ?? null
        }
      })
    );

    let parsedPayload: ParsedSupplierPayload;
    try {
      parsedPayload = await this.sourceClient.parsePayload(fetchedPayload, input.sourceConfig);
    } catch (error) {
      await this.supplierImportRepository.recordImportCompleted({
        importId,
        finalStatus: "failed",
        recordsReceived: 0,
        recordsValid: 0,
        recordsInvalid: 0,
        errorSummary: "Supplier payload parsing failed."
      });
      const exception = await this.exceptionService.createException({
        entityType: "supplier_import",
        entityId: importId,
        domain: "supplier_intake",
        severity: "high",
        reasonCode: "PARSE_FAILURE",
        summary: "Supplier payload parsing failed.",
        details: {
          supplierId: input.sourceConfig.supplierId,
          error: error instanceof Error ? error.message : "Unknown error"
        }
      });

      return escalate(
        {
          importId,
          supplierId: input.sourceConfig.supplierId,
          finalStatus: "failed",
          rawPayloadReference: null,
          records: [],
          summary: {
            recordsReceived: 0,
            recordsParsed: 0,
            recordsAccepted: 0,
            recordsRejected: 0,
            recordsReviewRequired: 0,
            parseErrorCount: 1
          },
          parseWarnings: [],
          normalizationDispatchReady: false,
          recommendedNextStep: "review_payload_format_and_parser",
          domainEvents
        },
        {
          domainEvents,
          exception,
          recommendedNextStep: "review_payload_format_and_parser"
        }
      );
    }

    domainEvents.push(
      createDomainEvent({
        eventType: "supplier_payload_parsed",
        entityType: "supplier_import",
        entityId: importId,
        eventSource: "supplier_intake_service",
        payload: {
          recordsParsed: parsedPayload.rawRecords.length,
          warningCount: parsedPayload.warnings.length
        }
      })
    );

    const rawPayloadReference = (await this.payloadPersister.persistImportPayload({
      importId,
      supplierId: input.sourceConfig.supplierId,
      payload: fetchedPayload.payload,
      checksum: fetchedPayload.checksum
    })).rawPayloadReference;

    const records = prevalidateRecords(parsedPayload.rawRecords);
    const persistedRawRows = await this.supplierImportRepository.persistRawProducts({
      importId,
      supplierId: input.sourceConfig.supplierId,
      records
    });
    const rawProductIdByRowNumber = new Map(
      persistedRawRows.map((row) => [row.rowNumber, row.rawProductId])
    );
    for (const record of records) {
      record.rawProductId = rawProductIdByRowNumber.get(record.rowNumber) ?? null;
    }

    domainEvents.push(
      createDomainEvent({
        eventType: "raw_record_persist_completed",
        entityType: "supplier_import",
        entityId: importId,
        eventSource: "supplier_intake_service",
        payload: {
          persistedCount: persistedRawRows.length
        }
      })
    );

    const summary = createSummary(records, parsedPayload.warnings);
    const normalizationDispatchReady = summary.recordsAccepted > 0;
    const finalStatus =
      summary.recordsAccepted === 0 ? "failed" : summary.recordsRejected > 0 || parsedPayload.warnings.length > 0 ? "partial" : "completed";
    const output: SupplierIntakeOutput = {
      importId,
      supplierId: input.sourceConfig.supplierId,
      finalStatus,
      rawPayloadReference,
      records,
      summary,
      parseWarnings: parsedPayload.warnings,
      normalizationDispatchReady,
      recommendedNextStep:
        finalStatus === "completed"
          ? "dispatch_to_normalization"
          : finalStatus === "partial"
            ? "review_warnings_and_dispatch_accepted_rows"
            : "create_exception_and_stop",
      domainEvents
    };

    if (!normalizationDispatchReady) {
      await this.supplierImportRepository.recordImportCompleted({
        importId,
        finalStatus,
        recordsReceived: summary.recordsReceived,
        recordsValid: summary.recordsAccepted,
        recordsInvalid: summary.recordsRejected + summary.recordsReviewRequired,
        errorSummary: "No records accepted for normalization."
      });
      const exception = await this.exceptionService.createException({
        entityType: "supplier_import",
        entityId: importId,
        domain: "supplier_intake",
        severity: "high",
        reasonCode: "ZERO_VALID_RECORDS",
        summary: "Import finished without any records accepted for normalization.",
        details: {
          supplierId: input.sourceConfig.supplierId,
          summary
        }
      });

      return escalate(output, {
        domainEvents,
        exception,
        recommendedNextStep: output.recommendedNextStep
      });
    }

    if (finalStatus === "partial") {
      await this.supplierImportRepository.recordImportCompleted({
        importId,
        finalStatus,
        recordsReceived: summary.recordsReceived,
        recordsValid: summary.recordsAccepted,
        recordsInvalid: summary.recordsRejected + summary.recordsReviewRequired,
        errorSummary: parsedPayload.warnings.join("; ") || null
      });
      return review(output, {
        domainEvents,
        reasonCodes: ["IMPORT_COMPLETED_WITH_WARNINGS"],
        recommendedNextStep: output.recommendedNextStep
      });
    }

    await this.supplierImportRepository.recordImportCompleted({
      importId,
      finalStatus,
      recordsReceived: summary.recordsReceived,
      recordsValid: summary.recordsAccepted,
      recordsInvalid: summary.recordsRejected + summary.recordsReviewRequired,
      errorSummary: null
    });

    return ok(output, {
      domainEvents,
      recommendedNextStep: output.recommendedNextStep
    });
  }
}
