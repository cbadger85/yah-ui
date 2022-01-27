import { identity, mergeAttributes } from './common';

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
