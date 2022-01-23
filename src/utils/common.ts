// eslint-disable-next-line @typescript-eslint/no-empty-function
export function noop() {}

export function identity<T>(value: T): T {
  return value;
}

export function warn(assertion: unknown, message: string | (() => string)) {
  if (
    !assertion &&
    ['test', 'development'].includes(process.env.NODE_ENV as string)
  ) {
    const warning: string = typeof message === 'function' ? message() : message;

    console.warn(warning);
  }
}
