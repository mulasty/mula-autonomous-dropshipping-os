import { FastifyInstance } from "fastify";
import { AppEnv } from "../config/env";
import { PostgresDatabase } from "../db/postgres";

interface RegisterHealthRoutesOptions {
  env: AppEnv;
  db: PostgresDatabase;
}

export async function registerHealthRoutes(
  app: FastifyInstance,
  options: RegisterHealthRoutesOptions
): Promise<void> {
  app.get("/health", async () => {
    const database = await options.db.healthCheck();

    return {
      status: database.reachable || !database.configured ? "ok" : "degraded",
      service: "mula-backend",
      environment: options.env.nodeEnv,
      database
    };
  });
}
