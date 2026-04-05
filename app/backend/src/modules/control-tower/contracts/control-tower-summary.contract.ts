import { ExceptionSeverity, ExceptionStatus } from "../../../shared";

export interface ControlTowerExceptionItem {
  exceptionId: string;
  entityType: string;
  entityId: string | null;
  exceptionCategory: string;
  severity: ExceptionSeverity;
  status: ExceptionStatus;
  summary: string;
  createdAt: string;
}

export interface ControlTowerExceptionSummary {
  totalOpen: number;
  bySeverity: Record<ExceptionSeverity, number>;
  byStatus: Record<ExceptionStatus, number>;
  items: ControlTowerExceptionItem[];
  warnings: string[];
}

export interface ControlTowerRuntimeModuleHealth {
  moduleName: string;
  implementationStatus: "implemented" | "skeleton";
  description: string;
}

export interface ControlTowerRuntimeHealth {
  databaseConfigured: boolean;
  databaseReachable: boolean;
  databaseError?: string;
  runtimeModules: ControlTowerRuntimeModuleHealth[];
  warnings: string[];
}

export interface ControlTowerSummary {
  generatedAt: string;
  sourceMode: "database" | "placeholder";
  executiveSummary: {
    openExceptions: number;
    criticalExceptions: number;
    highExceptions: number;
    runtimeModuleCount: number;
    implementedModuleCount: number;
    databaseConfigured: boolean;
    databaseReachable: boolean;
  };
  exceptionQueue: ControlTowerExceptionSummary;
  runtimeHealth: ControlTowerRuntimeHealth;
  recommendedOperatorFocus: string[];
}
