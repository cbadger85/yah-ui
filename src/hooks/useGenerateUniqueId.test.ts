import { renderHook } from '@testing-library/react-hooks';
import {
  generateUniqueId,
  resetIds,
  useGenerateUniqueId,
} from './useGenerateUniqueId';

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

  it('should have seperate incrementing values for each prefix', () => {
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

describe('useGenerateUniqueId', () => {
  it('should return an incrementing id', async () => {
    const { result: result1 } = renderHook(() => useGenerateUniqueId());
    expect(result1.current).toBe('uid-1');

    const { result: result2 } = renderHook(() => useGenerateUniqueId());
    expect(result2.current).toBe('uid-2');

    const { result: result3 } = renderHook(() => useGenerateUniqueId());
    expect(result3.current).toBe('uid-3');
  });

  it('should have a default prefix of `uid`', () => {
    const { result } = renderHook(() => useGenerateUniqueId());

    expect(result.current.startsWith('uid')).toBeTruthy();
  });

  it('should prefix the id if a prefix is provided', () => {
    const { result } = renderHook(() => useGenerateUniqueId('prefix'));

    expect(result.current.startsWith('prefix')).toBeTruthy();
  });

  it('should have seperate incrementing values for each prefix', () => {
    const { result: result1 } = renderHook(() => useGenerateUniqueId());
    expect(result1.current).toBe('uid-1');
    const { result: prefixResult1 } = renderHook(() =>
      useGenerateUniqueId('prefix'),
    );
    expect(prefixResult1.current).toBe('prefix-1');
    const { result: result2 } = renderHook(() => useGenerateUniqueId());
    expect(result2.current).toBe('uid-2');
    const { result: prefixResult2 } = renderHook(() =>
      useGenerateUniqueId('prefix'),
    );
    expect(prefixResult2.current).toBe('prefix-2');
  });
});
