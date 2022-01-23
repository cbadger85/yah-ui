import { isTruthy, isString } from './typeGuards';

export function mergeAttributes(...ids: (string | undefined | null)[]) {
  const validIds = ids
    .filter(isString)
    .map((id) => id.trim())
    .filter(isTruthy);

  const uniqueIds = Array.from(new Set(validIds));

  return uniqueIds.length ? uniqueIds.join(' ') : undefined;
}
