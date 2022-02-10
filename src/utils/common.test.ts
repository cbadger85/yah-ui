import { identity, mergeAttributes, warning } from './common';

describe('identity', () => {
  it('should return the value provided', () => {
    const testobj = {};

    expect(identity(testobj)).toBe(testobj);
  });
});

describe('mergeAttributes', () => {
  it('should filter out all non string arguments and if at least one is present, join them on a space', () => {
    expect(
      mergeAttributes(
        'test-string-1',
        false && 'test-string-2',
        true && 'test-string-3',
        '  test-string-4  ',
        null,
        {},
        [],
        null,
        undefined,
      ),
    ).toBe('test-string-1 test-string-3 test-string-4');
  });

  it('should filter out all non string arguments and if none are present return undefined', () => {
    expect(
      mergeAttributes(false && 'test-string-2', null, {}, [], null, undefined),
    ).toBeUndefined();
  });

  it('should remove duplicate strings', () => {
    expect(mergeAttributes('test-string-1', 'test-string-1')).toBe(
      'test-string-1',
    );
  });
});

describe('warning', () => {
  it('should only display the warning if the assertion is false', () => {
    const consoleWarn = jest.spyOn(console, 'warn');

    const message = 'oops';

    warning(false, message);

    expect(consoleWarn).toBeCalledWith(`WARNING: ${message}`);

    consoleWarn.mockClear();

    warning(true, message);

    expect(consoleWarn).not.toBeCalled();
  });

  it('should allow just a message without an assertion', () => {
    const consoleWarn = jest.spyOn(console, 'warn');

    const message = 'oops';

    warning(message);

    expect(consoleWarn).toBeCalledWith(`WARNING: ${message}`);
  });
});
