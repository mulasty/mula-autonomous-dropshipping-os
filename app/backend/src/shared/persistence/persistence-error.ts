export class PersistenceError extends Error {
  constructor(
    message: string,
    public readonly operation: string,
    options?: { cause?: unknown }
  ) {
    super(message);
    this.name = "PersistenceError";

    if (options?.cause !== undefined) {
      (this as Error & { cause?: unknown }).cause = options.cause;
    }
  }
}

export function wrapPersistenceError(operation: string, error: unknown): PersistenceError {
  if (error instanceof PersistenceError) {
    return error;
  }

  if (error instanceof Error) {
    return new PersistenceError(error.message, operation, { cause: error });
  }

  return new PersistenceError("Unknown persistence error", operation, {
    cause: error
  });
}
