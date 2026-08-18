/**
 * Joins ids for an ARIA relationship attribute, dropping empty ones. Returns
 * `undefined` rather than an empty string, because `aria-describedby=""`
 * points at nothing and confuses some screen readers.
 */
export function mergeIds(
  ...ids: readonly (string | undefined | false | null)[]
): string | undefined {
  const joined = ids.filter(Boolean).join(' ');
  return joined === '' ? undefined : joined;
}
