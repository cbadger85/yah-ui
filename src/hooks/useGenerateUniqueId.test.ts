import { generateUniqueId, resetIds } from './useGenerateUniqueId';

beforeEach(() => {
  resetIds();
});

describe('generateUniqueId', () => {
  it('should return an incrementing id', () => {
    expect(generateUniqueId()).toBe('uid-1');
    expect(generateUniqueId()).toBe('uid-2');
    expect(generateUniqueId()).toBe('uid-3');
  });

  it('should have a default prefix of `uid`', () => {
    expect(generateUniqueId().startsWith('uid')).toBeTruthy();
  });

  it('should prefix the id if a prefix is provided', () => {
    expect(generateUniqueId('prefix').startsWith('prefix')).toBeTruthy();
  });

  it('should have separte incrementing values for each prefix', () => {
    expect(generateUniqueId()).toBe('uid-1');
    expect(generateUniqueId('prefix')).toBe('prefix-1');
    expect(generateUniqueId()).toBe('uid-2');
    expect(generateUniqueId('prefix')).toBe('prefix-2');
  });
});

describe('resetIds', () => {
  it('should reset the increment if `resetIds` is called', () => {
    expect(generateUniqueId()).toBe('uid-1');
    expect(generateUniqueId('prefix')).toBe('prefix-1');
    expect(generateUniqueId()).toBe('uid-2');
    expect(generateUniqueId('prefix')).toBe('prefix-2');

    resetIds();

    expect(generateUniqueId()).toBe('uid-1');
    expect(generateUniqueId('prefix')).toBe('prefix-1');
    expect(generateUniqueId()).toBe('uid-2');
    expect(generateUniqueId('prefix')).toBe('prefix-2');
  });
});
