import { randomUUID } from "node:crypto";
import { ExceptionSeverity, ExceptionStatus } from "../types/status-types";

export interface ExceptionCreateInput {
  entityType: string;
  entityId: string;
  domain: string;
  severity: ExceptionSeverity;
  reasonCode: string;
  summary: string;
  details?: Record<string, unknown>;
}

export interface ExceptionReference {
  exceptionId: string;
  severity: ExceptionSeverity;
  status: ExceptionStatus;
  reasonCode: string;
  createdAt: string;
}

export interface ExceptionService {
  createException(input: ExceptionCreateInput): Promise<ExceptionReference>;
}

export class NoopExceptionService implements ExceptionService {
  async createException(input: ExceptionCreateInput): Promise<ExceptionReference> {
    return {
      exceptionId: randomUUID(),
      severity: input.severity,
      status: "new",
      reasonCode: input.reasonCode,
      createdAt: new Date().toISOString()
    };
  }
}
