import fs from "node:fs/promises";
import path from "node:path";
import { repoRoot, toRepoRelative } from "../../utils/paths";

interface ContractDescriptor {
  contract_name?: string;
  version?: string;
  description?: string;
}

export interface ContractManifestItem {
  file: string;
  contractName: string;
  version: string;
  description: string | null;
}

export interface DatabaseManifest {
  schemaFiles: string[];
  viewFiles: string[];
  seedFiles: string[];
  tables: string[];
  views: string[];
}

export interface SchemaEnumManifestItem {
  key: string;
  table: string;
  column: string;
  constraintName: string;
  file: string;
  values: string[];
}

async function listFilesRecursive(rootPath: string): Promise<string[]> {
  try {
    const entries = await fs.readdir(rootPath, { withFileTypes: true });
    const files = await Promise.all(
      entries.map(async (entry) => {
        const resolved = path.join(rootPath, entry.name);
        if (entry.isDirectory()) {
          return listFilesRecursive(resolved);
        }

        return [resolved];
      })
    );

    return files.flat();
  } catch {
    return [];
  }
}

async function listRelativeFiles(relativeRoot: string): Promise<string[]> {
  const fullPath = path.join(repoRoot, relativeRoot);
  const files = await listFilesRecursive(fullPath);
  return files.map(toRepoRelative).sort((left, right) => left.localeCompare(right));
}

function extractNames(source: string, pattern: RegExp): string[] {
  return [...source.matchAll(pattern)]
    .map((match) => match[1])
    .filter((value): value is string => typeof value === "string" && value.length > 0);
}

function extractQuotedValues(source: string): string[] {
  return [...source.matchAll(/'([^']+)'/g)]
    .map((match) => match[1])
    .filter((value): value is string => typeof value === "string" && value.length > 0);
}

function extractTableBlocks(source: string): Array<{ table: string; body: string }> {
  const tablePattern = /create table(?: if not exists)?\s+([a-z_]+)\s*\(([\s\S]*?)\);\s*/gi;

  return [...source.matchAll(tablePattern)]
    .map((match) => {
      const table = match[1];
      const body = match[2];

      if (typeof table !== "string" || typeof body !== "string") {
        return null;
      }

      return { table, body };
    })
    .filter((value): value is { table: string; body: string } => value !== null);
}

export async function getDatabaseManifest(): Promise<DatabaseManifest> {
  const schemaFiles = await listRelativeFiles("db/schema");
  const viewFiles = await listRelativeFiles("db/views");
  const seedFiles = await listRelativeFiles("db/seeds");

  const tableNames = new Set<string>();
  const viewNames = new Set<string>();

  await Promise.all(
    [...schemaFiles, ...viewFiles].map(async (relativeFile) => {
      const filePath = path.join(repoRoot, relativeFile);
      const content = await fs.readFile(filePath, "utf8");

      extractNames(content, /create table(?: if not exists)?\s+([a-z_]+)/gi).forEach((name) => {
        tableNames.add(name);
      });

      extractNames(content, /create or replace view\s+([a-z_]+)/gi).forEach((name) => {
        viewNames.add(name);
      });
    })
  );

  return {
    schemaFiles,
    viewFiles,
    seedFiles,
    tables: [...tableNames].sort((left, right) => left.localeCompare(right)),
    views: [...viewNames].sort((left, right) => left.localeCompare(right))
  };
}

export async function getSchemaEnumRegistry(): Promise<SchemaEnumManifestItem[]> {
  const schemaFiles = await listRelativeFiles("db/schema");
  const entries = await Promise.all(
    schemaFiles.map(async (relativeFile) => {
      const filePath = path.join(repoRoot, relativeFile);
      const content = await fs.readFile(filePath, "utf8");

      return extractTableBlocks(content).flatMap(({ table, body }) => {
        const constraintPattern =
          /constraint\s+([a-z_]+)\s+check\s*\(\s*([a-z_]+)\s+in\s*\(([\s\S]*?)\)\s*\)/gi;

        return [...body.matchAll(constraintPattern)]
          .map((match) => {
            const constraintName = match[1];
            const column = match[2];
            const rawValues = match[3];

            if (
              typeof constraintName !== "string" ||
              typeof column !== "string" ||
              typeof rawValues !== "string"
            ) {
              return null;
            }

            return {
              key: `${table}.${column}`,
              table,
              column,
              constraintName,
              file: relativeFile,
              values: extractQuotedValues(rawValues)
            };
          })
          .filter((value): value is SchemaEnumManifestItem => value !== null);
      });
    })
  );

  return entries
    .flat()
    .sort((left, right) => left.key.localeCompare(right.key) || left.file.localeCompare(right.file));
}

export async function getContractManifest(): Promise<ContractManifestItem[]> {
  const files = await listRelativeFiles("automation/contracts");

  const contracts = await Promise.all(
    files.map(async (relativeFile) => {
      const filePath = path.join(repoRoot, relativeFile);
      const parsed = JSON.parse(await fs.readFile(filePath, "utf8")) as ContractDescriptor;

      return {
        file: relativeFile,
        contractName: parsed.contract_name ?? path.basename(relativeFile, path.extname(relativeFile)),
        version: parsed.version ?? "unknown",
        description: parsed.description ?? null
      };
    })
  );

  return contracts.sort((left, right) => left.file.localeCompare(right.file));
}
