import { isTruthy, isString } from './typeGuards';

// eslint-disable-next-line @typescript-eslint/no-empty-function
export function noop(): void {}

export function identity<T>(value: T): T {
  return value;
}

export function mergeAttributes(...ids: unknown[]): string | undefined {
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

export function warning(
  assertion: unknown,
  message: string | (() => string),
): void {
  if (!assertion && process.env.NODE_ENV !== 'production') {
    const messageString = typeof message === 'function' ? message() : message;

    console.warn(`WARNING: ${messageString}`);
  }
}
