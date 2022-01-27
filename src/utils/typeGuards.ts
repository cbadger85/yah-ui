export function isTruthy<T>(value: T | undefined | null): value is T {
  return Boolean(value);
}

export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

export function hasProperty<
  X extends Record<PropertyKey, unknown>,
  Y extends PropertyKey,
>(obj: X, prop: Y): obj is X & Record<Y, unknown> {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}
