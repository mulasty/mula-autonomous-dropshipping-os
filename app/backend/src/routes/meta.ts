import { FastifyInstance } from "fastify";
import { runtimeModuleCatalog } from "../modules";
import { getContractManifest, getDatabaseManifest } from "../modules/metadata/repository-manifest";
import { getStatusRegistryManifest } from "../modules/registry/status-registry";

export async function registerMetaRoutes(app: FastifyInstance): Promise<void> {
  app.get("/meta", async () => {
    const [database, contracts, registry] = await Promise.all([
      getDatabaseManifest(),
      getContractManifest(),
      getStatusRegistryManifest()
    ]);

    return {
      database,
      contracts,
      registry,
      runtimeModules: runtimeModuleCatalog
    };
  });

  app.get("/meta/database", async () => {
    return getDatabaseManifest();
  });

  app.get("/meta/contracts", async () => {
    return getContractManifest();
  });

  app.get("/meta/registry", async () => {
    return getStatusRegistryManifest();
  });

  app.get("/meta/runtime-modules", async () => {
    return runtimeModuleCatalog;
  });
}
