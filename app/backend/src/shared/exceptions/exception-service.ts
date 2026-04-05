import { ExceptionSeverity, ExceptionStatus } from "../types/status-types";
import { ExceptionRepository, NoopExceptionRepository } from "./exception-repository";

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
  private readonly repository: ExceptionRepository;

  constructor(repository: ExceptionRepository = new NoopExceptionRepository()) {
    this.repository = repository;
  }

  async createException(input: ExceptionCreateInput): Promise<ExceptionReference> {
    return this.repository.saveException(input);
  }
}

export class PersistentExceptionService implements ExceptionService {
  constructor(private readonly repository: ExceptionRepository) {}

  createException(input: ExceptionCreateInput): Promise<ExceptionReference> {
    return this.repository.saveException(input);
  }
}
