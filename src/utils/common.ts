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

export function warning(
  assertion: unknown,
  message: string | (() => string),
): void;
export function warning(message: string): void;
export function warning(arg: unknown, message?: string | (() => string)): void {
  const isOnlyMessage = message === undefined && typeof arg === 'string';

  const isWarn = isOnlyMessage || !arg;

  if (isWarn && process.env.NODE_ENV !== 'production') {
    const messageString =
      isOnlyMessage && typeof arg === 'string'
        ? arg
        : typeof message === 'function'
        ? message()
        : message;

    console.warn(`WARNING: ${messageString}`);
  }
}
