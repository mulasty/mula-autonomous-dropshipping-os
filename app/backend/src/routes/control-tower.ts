import { FastifyInstance } from "fastify";
import { PostgresDatabase } from "../db/postgres";
import {
  ControlTowerService,
  DefaultRuntimeHealthRepository,
  ExceptionQueueRepository,
  PostgresExceptionQueueRepository
} from "../modules/control-tower";
import { runtimeModuleCatalog } from "../modules";

interface ControlTowerRouteOptions {
  db: PostgresDatabase;
  exceptionQueueRepository?: ExceptionQueueRepository;
}

export async function registerControlTowerRoutes(
  app: FastifyInstance,
  options: ControlTowerRouteOptions
): Promise<void> {
  const controlTowerService = new ControlTowerService(
    options.exceptionQueueRepository ?? new PostgresExceptionQueueRepository(options.db),
    new DefaultRuntimeHealthRepository(options.db, runtimeModuleCatalog)
  );

  app.get("/v1/control-tower/summary", async () => {
    return {
      data: await controlTowerService.getSummary()
    };
  });
}
