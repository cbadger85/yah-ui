export function isTruthy<T>(value: T | undefined | null): value is T {
  return !!value;
}

export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

export function hasOwnProperty<
  X extends Record<PropertyKey, unknown>,
  Y extends PropertyKey,
>(obj: X, prop: Y): obj is X & Record<Y, unknown> {
  // eslint-disable-next-line no-prototype-builtins
  return obj.hasOwnProperty(prop);
}

export function hasOwnProperty2<
  X extends Record<string, unknown>,
  Y extends PropertyKey,
>(obj: X, prop: Y): obj is X & Record<Y, unknown> {
  return !!Object.getOwnPropertyDescriptor(obj, prop);
}

export function hasOwnProperty3<
  X extends Record<string, unknown>,
  Y extends PropertyKey,
>(obj: X, prop: Y): obj is X & Record<Y, unknown> {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}
