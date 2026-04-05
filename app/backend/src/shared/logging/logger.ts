export interface RuntimeLogger {
  debug(message: string, context?: Record<string, unknown>): void;
  info(message: string, context?: Record<string, unknown>): void;
  warn(message: string, context?: Record<string, unknown>): void;
  error(message: string, context?: Record<string, unknown>): void;
}

export class NoopLogger implements RuntimeLogger {
  debug(): void {}

  info(): void {}

  warn(): void {}

  error(): void {}
}
