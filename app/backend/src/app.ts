import Fastify, { FastifyInstance } from "fastify";
import { AppEnv } from "./config/env";
import { DatabaseUnavailableError, PostgresDatabase } from "./db/postgres";
import {
  InMemoryExceptionRepository,
  PersistentExceptionService,
  PostgresDatabaseClient,
  PostgresExceptionRepository
} from "./shared";
import { InvalidEnumFilterError } from "./modules/registry/status-registry";
import { registerControlTowerRoutes } from "./routes/control-tower";
import { registerDataRoutes } from "./routes/data";
import { registerHealthRoutes } from "./routes/health";
import { registerListingsRoutes } from "./routes/listings";
import { registerMetaRoutes } from "./routes/meta";
import { registerPipelineRoutes } from "./routes/pipeline";
import { registerPublicationRoutes } from "./routes/publication";
import { registerRulesRoutes } from "./routes/rules";
import { registerSupportRoutes } from "./routes/support";
import { registerSyncRoutes } from "./routes/sync";
import {
  InMemoryExceptionQueueRepository,
  PostgresExceptionQueueRepository
} from "./modules/control-tower";
import {
  InMemoryCustomerMessageRepository,
  InMemorySupportResponseRepository,
  PostgresCustomerMessageRepository,
  PostgresSupportResponseRepository
} from "./modules/support";

interface BuildAppOptions {
  env: AppEnv;
  db: PostgresDatabase;
}

export function buildApp(options: BuildAppOptions): FastifyInstance {
  const app = Fastify({
    logger: {
      level: options.env.logLevel
    }
  });
  const dbClient = new PostgresDatabaseClient(options.db);
  const inMemoryExceptionRepository = new InMemoryExceptionRepository();
  const exceptionRepository = options.db.isConfigured()
    ? new PostgresExceptionRepository(dbClient)
    : inMemoryExceptionRepository;
  const exceptionService = new PersistentExceptionService(exceptionRepository);
  const customerMessageRepository = options.db.isConfigured()
    ? new PostgresCustomerMessageRepository(dbClient)
    : new InMemoryCustomerMessageRepository();
  const supportResponseRepository = options.db.isConfigured()
    ? new PostgresSupportResponseRepository(dbClient)
    : new InMemorySupportResponseRepository();
  const exceptionQueueRepository = options.db.isConfigured()
    ? new PostgresExceptionQueueRepository(options.db)
    : new InMemoryExceptionQueueRepository(inMemoryExceptionRepository);

  app.setErrorHandler((error, request, reply) => {
    if (error instanceof DatabaseUnavailableError) {
      reply.code(503).send({
        error: "database_unavailable",
        message: error.message
      });
      return;
    }

    if (error instanceof InvalidEnumFilterError) {
      reply.code(400).send({
        error: "invalid_enum_filter",
        message: error.message,
        registryKey: error.registryKey,
        receivedValue: error.receivedValue,
        allowedValues: error.allowedValues
      });
      return;
    }

    request.log.error({ err: error }, "Request failed");
    reply.code(500).send({
      error: "internal_server_error",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  });

  app.get("/", async () => {
    return {
      service: "mula-backend",
      status: "ok",
      routes: [
        "/health",
        "/meta",
        "/meta/database",
        "/meta/contracts",
        "/meta/registry",
        "/meta/runtime-modules",
        "/v1/suppliers",
        "/v1/products",
        "/v1/orders",
        "/v1/exceptions",
        "/v1/rules/evaluate",
        "/v1/pipeline/qualify",
        "/v1/listings/preview",
        "/v1/listings/generate",
        "/v1/publication/prepare",
        "/v1/sync/evaluate",
        "/v1/support/classify",
        "/v1/support/respond",
        "/v1/control-tower/summary"
      ]
    };
  });

  void registerHealthRoutes(app, options);
  void registerMetaRoutes(app);
  void registerDataRoutes(app, options);
  void registerRulesRoutes(app, options);
  void registerPipelineRoutes(app, options);
  void registerListingsRoutes(app, options);
  void registerPublicationRoutes(app, options);
  void registerSyncRoutes(app, {
    exceptionService
  });
  void registerSupportRoutes(app, {
    customerMessageRepository,
    supportResponseRepository,
    exceptionService
  });
  void registerControlTowerRoutes(app, {
    ...options,
    exceptionQueueRepository
  });

  return app;
}
