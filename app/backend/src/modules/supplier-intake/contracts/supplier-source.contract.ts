export const SUPPLIER_SOURCE_TYPES = [
  "xml",
  "csv",
  "rest_api",
  "email_attachment",
  "ftp",
  "sftp"
] as const;

export type SupplierSourceType = (typeof SUPPLIER_SOURCE_TYPES)[number];

export const SUPPLIER_IMPORT_TRIGGERS = ["scheduled", "manual", "delta"] as const;
export type SupplierImportTrigger = (typeof SUPPLIER_IMPORT_TRIGGERS)[number];

export interface SupplierSourceConfig {
  supplierId: string;
  sourceType: SupplierSourceType;
  sourceLocation: string;
  authReference?: string | null;
  expectedFormatVersion?: string | null;
  importSchedule?: string | null;
  fileEncoding?: string | null;
}

export interface SupplierFetchResult {
  payload: unknown;
  sourceReference?: string | null;
  contentType?: string | null;
  checksum?: string | null;
}

export interface ParsedSupplierPayload {
  rawRecords: unknown[];
  warnings: string[];
}

export interface SupplierSourceClient {
  fetchSource(config: SupplierSourceConfig): Promise<SupplierFetchResult>;
  parsePayload(fetchResult: SupplierFetchResult, config: SupplierSourceConfig): Promise<ParsedSupplierPayload>;
}
