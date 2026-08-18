/**
 * Reads an `aria-invalid` value as a boolean. The attribute accepts strings,
 * and the string `"false"` means valid — a plain truthiness check would read
 * it as invalid.
 */
export function resolveInvalid(
  value: boolean | 'false' | 'true' | 'grammar' | 'spelling' | undefined,
): boolean {
  return value !== undefined && value !== false && value !== 'false';
}
