/**
 * Extracts a human-readable error message string from an unknown value.
 *
 * - `Error` instances → `.message`
 * - string values → passed through directly
 * - anything else → `''`
 */
export function extractErrorMessage(rawError: unknown): string {
  if (rawError instanceof Error) return rawError.message;
  if (typeof rawError === 'string') return rawError;

  return '';
}
