import { FastifyInstance } from "fastify";
import { DatabaseUnavailableError, PostgresDatabase } from "../db/postgres";
import { PostgresListingRepository } from "../modules/listing-factory";
import { PublicationOrchestratorService } from "../modules/publication";
import { PostgresDatabaseClient } from "../shared";

interface PublicationRouteOptions {
  db: PostgresDatabase;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parsePublicationInput(body: unknown): { listingId: string } | null {
  if (!isRecord(body) || typeof body.listingId !== "string" || body.listingId.trim().length === 0) {
    return null;
  }

  return {
    listingId: body.listingId
  };
}

export async function registerPublicationRoutes(
  app: FastifyInstance,
  options: PublicationRouteOptions
): Promise<void> {
  const dbClient = new PostgresDatabaseClient(options.db);
  const publicationService = new PublicationOrchestratorService(
    dbClient.isConfigured()
      ? new PostgresListingRepository(dbClient)
      : new PostgresListingRepository(dbClient)
  );

  app.post("/v1/publication/prepare", async (request, reply) => {
    const parsed = parsePublicationInput(request.body);
    if (!parsed) {
      reply.code(400).send({
        error: "invalid_publication_prepare_request",
        message: "Body must include listingId."
      });
      return;
    }

    if (!dbClient.isConfigured()) {
      throw new DatabaseUnavailableError();
    }

    return {
      data: await publicationService.prepare(parsed)
    };
  });
}
