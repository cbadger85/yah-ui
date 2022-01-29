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

export function groupByUnique<T>(
  list: T[],
  getKey: (value: T) => PropertyKey,
): Record<PropertyKey, T> {
  return list.reduce((map, value) => {
    return {
      ...map,
      [getKey(value)]: value,
    };
  }, {});
}

export function filterByField<T, K extends keyof T>(
  list: T[],
  key: K,
  value: T[K],
): T[] {
  return list.filter((item) => item[key] !== value);
}
