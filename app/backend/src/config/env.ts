import path from "node:path";
import { config as loadEnv } from "dotenv";
import { backendRoot } from "../utils/paths";

loadEnv({ path: path.join(backendRoot, ".env") });

function parsePort(value: string | undefined, fallback: number): number {
  if (!value) {
    return fallback;
  }

  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed <= 0) {
    return fallback;
  }

  return parsed;
}

export interface AppEnv {
  host: string;
  port: number;
  logLevel: string;
  nodeEnv: string;
  databaseUrl: string | null;
}

export const env: AppEnv = {
  host: process.env.HOST ?? "0.0.0.0",
  port: parsePort(process.env.PORT, 3000),
  logLevel: process.env.LOG_LEVEL ?? "info",
  nodeEnv: process.env.NODE_ENV ?? "development",
  databaseUrl: process.env.DATABASE_URL ?? null
};
