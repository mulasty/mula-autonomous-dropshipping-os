import { DomainEvent } from "../contracts/domain-event";
import { ExceptionReference } from "../exceptions/exception-service";
import { RuntimeResultStatus } from "../types/status-types";

export interface ResultMeta {
  reasonCodes?: string[];
  riskFlags?: string[];
  recommendedNextStep?: string;
  domainEvents?: DomainEvent[];
  exception?: ExceptionReference;
}

export interface SuccessResult<TData> {
  status: "ok";
  data: TData;
  meta?: ResultMeta;
}

export interface ReviewResult<TData> {
  status: "review_required";
  data: TData;
  meta?: ResultMeta;
}

export interface EscalatedResult<TData> {
  status: "escalated";
  data: TData;
  meta?: ResultMeta;
}

export interface FailureResult {
  status: "failed";
  error: {
    code: string;
    message: string;
    retriable?: boolean;
  };
  meta?: ResultMeta;
}

export type OperationResult<TData> =
  | SuccessResult<TData>
  | ReviewResult<TData>
  | EscalatedResult<TData>
  | FailureResult;

export function ok<TData>(data: TData, meta?: ResultMeta): SuccessResult<TData> {
  return { status: "ok", data, meta };
}

export function review<TData>(data: TData, meta?: ResultMeta): ReviewResult<TData> {
  return { status: "review_required", data, meta };
}

export function escalate<TData>(data: TData, meta?: ResultMeta): EscalatedResult<TData> {
  return { status: "escalated", data, meta };
}

export function fail(code: string, message: string, meta?: ResultMeta, retriable?: boolean): FailureResult {
  return {
    status: "failed",
    error: {
      code,
      message,
      retriable
    },
    meta
  };
}

export function isTerminalResultStatus(status: RuntimeResultStatus): boolean {
  return status === "ok" || status === "review_required" || status === "escalated" || status === "failed";
}
