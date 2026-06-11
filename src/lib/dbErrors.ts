export type DbErrorCode = 'table_missing' | 'query_failed' | 'not_found';

export class DbError extends Error {
  code: DbErrorCode;
  developerMessage?: string;

  constructor(message: string, code: DbErrorCode, developerMessage?: string) {
    super(message);
    this.code = code;
    this.developerMessage = developerMessage;
  }
}

export const DB_TABLE_MISSING_MESSAGE =
  'Database table missing. Run SUPABASE_DATABASE_SETUP.sql in Supabase.';

export const DB_SAVE_FAILED_MESSAGE = "Couldn't save this project. Please try again.";

export const DB_LOAD_FAILED_MESSAGE = "Couldn't load your projects.";

export function mapSupabaseDbError(error: { message?: string; code?: string }): DbError {
  const message = (error.message ?? '').toLowerCase();
  const code = error.code ?? '';

  if (
    code === '42P01' ||
    message.includes('does not exist') ||
    (message.includes('relation') && message.includes('does not exist'))
  ) {
    return new DbError(DB_TABLE_MISSING_MESSAGE, 'table_missing', error.message);
  }

  return new DbError(DB_LOAD_FAILED_MESSAGE, 'query_failed', error.message);
}

export function logDbWarning(context: string, error: unknown): void {
  const detail =
    error instanceof DbError
      ? error.developerMessage ?? error.message
      : error instanceof Error
        ? error.message
        : String(error);
  console.warn(`[SpaceFlip Pro][DB] ${context}:`, detail);
}
