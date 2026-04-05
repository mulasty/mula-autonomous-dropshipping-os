import { ControlTowerSummary } from "../contracts/control-tower-summary.contract";
import { ExceptionQueueRepository } from "../repositories/exception-queue.repository";
import { RuntimeHealthRepository } from "../repositories/runtime-health.repository";

function buildOperatorFocus(summary: ControlTowerSummary): string[] {
  const focus: string[] = [];

  if (summary.exceptionQueue.bySeverity.critical > 0) {
    focus.push("review_critical_exceptions");
  }

  if (summary.exceptionQueue.bySeverity.high > 0) {
    focus.push("review_high_severity_queue");
  }

  if (!summary.runtimeHealth.databaseReachable) {
    focus.push("restore_database_visibility");
  }

  if (summary.exceptionQueue.warnings.length > 0) {
    focus.push("check_exception_read_model_warnings");
  }

  if (focus.length === 0) {
    focus.push("continue_standard_operator_monitoring");
  }

  return focus;
}

export class ControlTowerService {
  constructor(
    private readonly exceptionQueueRepository: ExceptionQueueRepository,
    private readonly runtimeHealthRepository: RuntimeHealthRepository
  ) {}

  async getSummary(): Promise<ControlTowerSummary> {
    const [exceptionQueue, runtimeHealth] = await Promise.all([
      this.exceptionQueueRepository.getOpenExceptionSummary(),
      this.runtimeHealthRepository.getRuntimeHealth()
    ]);

    const summary: ControlTowerSummary = {
      generatedAt: new Date().toISOString(),
      sourceMode:
        runtimeHealth.databaseConfigured && runtimeHealth.databaseReachable ? "database" : "placeholder",
      executiveSummary: {
        openExceptions: exceptionQueue.totalOpen,
        criticalExceptions: exceptionQueue.bySeverity.critical,
        highExceptions: exceptionQueue.bySeverity.high,
        runtimeModuleCount: runtimeHealth.runtimeModules.length,
        implementedModuleCount: runtimeHealth.runtimeModules.filter(
          (moduleDescriptor) => moduleDescriptor.implementationStatus === "implemented"
        ).length,
        databaseConfigured: runtimeHealth.databaseConfigured,
        databaseReachable: runtimeHealth.databaseReachable
      },
      exceptionQueue,
      runtimeHealth,
      recommendedOperatorFocus: []
    };

    summary.recommendedOperatorFocus = buildOperatorFocus(summary);
    return summary;
  }
}
