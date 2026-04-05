import { PostgresDatabase } from "../../../db/postgres";
import type { RuntimeModuleDescriptor } from "../../index";
import { ControlTowerRuntimeHealth } from "../contracts/control-tower-summary.contract";

export interface RuntimeHealthRepository {
  getRuntimeHealth(): Promise<ControlTowerRuntimeHealth>;
}

export class DefaultRuntimeHealthRepository implements RuntimeHealthRepository {
  constructor(
    private readonly db: PostgresDatabase,
    private readonly runtimeModules: RuntimeModuleDescriptor[]
  ) {}

  async getRuntimeHealth(): Promise<ControlTowerRuntimeHealth> {
    const databaseHealth = await this.db.healthCheck();
    const warnings: string[] = [];

    if (!databaseHealth.configured) {
      warnings.push("DATABASE_NOT_CONFIGURED");
    } else if (!databaseHealth.reachable) {
      warnings.push("DATABASE_UNREACHABLE");
    }

    return {
      databaseConfigured: databaseHealth.configured,
      databaseReachable: databaseHealth.reachable,
      databaseError: databaseHealth.error,
      runtimeModules: this.runtimeModules.map((moduleDescriptor) => ({
        moduleName: moduleDescriptor.moduleName,
        implementationStatus: moduleDescriptor.implementationStatus,
        description: moduleDescriptor.description
      })),
      warnings
    };
  }
}
