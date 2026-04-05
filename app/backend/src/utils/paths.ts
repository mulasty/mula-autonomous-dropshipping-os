import path from "node:path";

export const backendRoot = path.resolve(__dirname, "../..");
export const repoRoot = path.resolve(backendRoot, "..", "..");

export function toRepoRelative(targetPath: string): string {
  return path.relative(repoRoot, targetPath).split(path.sep).join("/");
}
