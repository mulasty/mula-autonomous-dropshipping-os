import { env } from "./config/env";
import { PostgresDatabase } from "./db/postgres";
import { buildApp } from "./app";

async function main(): Promise<void> {
  const db = new PostgresDatabase(env.databaseUrl);
  const app = buildApp({ env, db });

  const shutdown = async () => {
    await app.close();
    await db.close();
  };

  process.on("SIGINT", () => {
    void shutdown();
  });

  process.on("SIGTERM", () => {
    void shutdown();
  });

  await app.listen({
    host: env.host,
    port: env.port
  });
}

void main();
