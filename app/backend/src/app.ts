import Fastify, { FastifyInstance } from "fastify";
import { AppEnv } from "./config/env";
import { DatabaseUnavailableError, PostgresDatabase } from "./db/postgres";
import { InvalidEnumFilterError } from "./modules/registry/status-registry";
import { registerDataRoutes } from "./routes/data";
import { registerHealthRoutes } from "./routes/health";
import { registerListingsRoutes } from "./routes/listings";
import { registerMetaRoutes } from "./routes/meta";
import { registerRulesRoutes } from "./routes/rules";

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
        "/v1/listings/preview"
      ]
    };
  });

  void registerHealthRoutes(app, options);
  void registerMetaRoutes(app);
  void registerDataRoutes(app, options);
  void registerRulesRoutes(app);
  void registerListingsRoutes(app);

  return app;
}
