import { hasProperty, isString } from '.';
import { isTruthy } from './typeGuards';

describe('isTruthy', () => {
  it.each([
    [true, true],
    [true, 1],
    [true, 'non empty string'],
    [true, {}],
    [true, []],
    [false, false],
    [false, ''],
    [false, 0],
    [false, null],
    [false, undefined],
  ])('should return %s if the value is %s', (expectedValue, value) => {
    expect(isTruthy(value)).toBe(expectedValue);
  });
});

describe('isString', () => {
  it.each([
    [true, ''],
    [true, 'test string'],
    [false, {}],
    [false, []],
    [false, 0],
    [false, 1],
    [false, null],
    [false, undefined],
  ])('[%#] --> should return %s if the value is %s', (expectedValue, value) => {
    expect(isString(value)).toBe(expectedValue);
  });
});

describe('hasProperty', () => {
  it.each([
    [true, { foo: 'foo' }, 'foo'],
    [true, { foo: undefined }, 'foo'],
    [false, { foo: 'foo' }, 'bar'],
    [false, { foo: undefined }, 'bar'],
  ])(
    '[%#] --> should return %s if the property exists in the object',
    (expectedValue, object, key) => {
      expect(hasProperty(object, key)).toBe(expectedValue);
    },
  );
});
