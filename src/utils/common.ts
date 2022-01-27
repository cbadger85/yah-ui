import { isTruthy, isString } from './typeGuards';

// eslint-disable-next-line @typescript-eslint/no-empty-function
export function noop() {}

export function identity<T>(value: T): T {
  return value;
}

export function mergeAttributes(...ids: unknown[]) {
  const validIds = ids
    .filter(isString)
    .map((id) => id.trim())
    .filter(isTruthy);

  const uniqueIds = Array.from(new Set(validIds));

  return uniqueIds.length ? uniqueIds.join(' ') : undefined;
}
