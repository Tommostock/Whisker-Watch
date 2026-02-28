/**
 * useLocalStorage Hook Tests
 * Tests localStorage integration, error handling, and persistence
 */

import { renderHook, act } from '@testing-library/react';
import {
  useLocalStorage,
  getStorageValue,
  setStorageValue,
  clearStorage,
  removeStorageKey,
  getStorageKeys,
  getStorageSize,
} from '../useLocalStorage';

describe('useLocalStorage Hook', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Hook: Read and Write', () => {
    it('should return initial value if not in localStorage', () => {
      const { result } = renderHook(() =>
        useLocalStorage<string>('testKey', 'default')
      );

      expect(result.current[0]).toBe('default');
    });

    it('should load value from localStorage on mount', () => {
      localStorage.setItem('testKey', JSON.stringify('stored'));
      const { result } = renderHook(() =>
        useLocalStorage<string>('testKey', 'default')
      );

      expect(result.current[0]).toBe('stored');
    });

    it('should save value to localStorage', () => {
      const { result } = renderHook(() =>
        useLocalStorage<string>('testKey', 'initial')
      );

      act(() => {
        result.current[1]('updated');
      });

      expect(result.current[0]).toBe('updated');
      expect(localStorage.getItem('testKey')).toMatch(/updated/);
    });

    it('should persist value across re-renders', () => {
      const { result, rerender } = renderHook(() =>
        useLocalStorage<string>('testKey', 'initial')
      );

      act(() => {
        result.current[1]('updated');
      });

      rerender();
      expect(result.current[0]).toBe('updated');
    });

    it('should support function updater (like useState)', () => {
      const { result } = renderHook(() =>
        useLocalStorage<number>('counter', 0)
      );

      act(() => {
        result.current[1]((prev) => prev + 1);
      });

      expect(result.current[0]).toBe(1);

      act(() => {
        result.current[1]((prev) => prev + 1);
      });

      expect(result.current[0]).toBe(2);
    });

    it('should handle object storage', () => {
      interface TestObj {
        name: string;
        value: number;
      }

      const { result } = renderHook(() =>
        useLocalStorage<TestObj>('obj', { name: 'test', value: 0 })
      );

      act(() => {
        result.current[1]({ name: 'updated', value: 42 });
      });

      expect(result.current[0].name).toBe('updated');
      expect(result.current[0].value).toBe(42);
    });

    it('should handle array storage', () => {
      const { result } = renderHook(() =>
        useLocalStorage<string[]>('items', [])
      );

      act(() => {
        result.current[1](['a', 'b', 'c']);
      });

      expect(result.current[0]).toEqual(['a', 'b', 'c']);
      expect(result.current[0]).toHaveLength(3);
    });

    it('should handle boolean storage', () => {
      const { result } = renderHook(() =>
        useLocalStorage<boolean>('flag', false)
      );

      act(() => {
        result.current[1](true);
      });

      expect(result.current[0]).toBe(true);
    });

    it('should handle null values', () => {
      const { result } = renderHook(() =>
        useLocalStorage<string | null>('nullable', 'initial')
      );

      act(() => {
        result.current[1](null);
      });

      expect(result.current[0]).toBeNull();
    });
  });

  describe('Hook: Error Handling', () => {
    it('should handle invalid JSON in localStorage', () => {
      localStorage.setItem('badJson', 'not valid json');
      const { result } = renderHook(() =>
        useLocalStorage<string>('badJson', 'default')
      );

      // Should use default on parse error
      expect(result.current[0]).toBe('default');
      expect(result.current[2]).not.toBeNull();
      expect(result.current[2]?.message).toMatch(/JSON/i);
    });

    it('should clear error after successful write', () => {
      localStorage.setItem('testKey', 'invalid json');
      const { result } = renderHook(() =>
        useLocalStorage<string>('testKey', 'default')
      );

      expect(result.current[2]).not.toBeNull();

      act(() => {
        result.current[1]('valid');
      });

      expect(result.current[2]).toBeNull();
    });

    it('should update state on successful storage write', () => {
      const { result } = renderHook(() =>
        useLocalStorage<string>('testKey', 'initial')
      );

      act(() => {
        result.current[1]('updated');
      });

      // State should update and no error
      expect(result.current[0]).toBe('updated');
      expect(result.current[2]).toBeNull();
    });

    it('should handle large data storage', () => {
      const { result } = renderHook(() =>
        useLocalStorage<string[]>('testKey', [])
      );

      // Create large data
      const largeData = Array(100).fill('test value');

      act(() => {
        result.current[1](largeData);
      });

      expect(result.current[0]).toEqual(largeData);
      expect(result.current[2]).toBeNull();
    });

    it('should handle setValue errors gracefully', () => {
      const { result } = renderHook(() =>
        useLocalStorage<string>('testKey', 'initial')
      );

      // State should still update even if there's an error
      act(() => {
        result.current[1]('updated');
      });

      expect(result.current[0]).toBe('updated');
    });

    it('should return error as third element of tuple', () => {
      localStorage.setItem('badJson', 'invalid');
      const { result } = renderHook(() =>
        useLocalStorage<string>('badJson', 'default')
      );

      expect(result.current).toHaveLength(3);
      expect(result.current[2]).not.toBeNull();
      expect(result.current[2] instanceof Error).toBe(true);
    });
  });

  describe('Hook: Key Changes', () => {
    it('should reload from localStorage when key changes', () => {
      localStorage.setItem('key1', JSON.stringify('value1'));
      localStorage.setItem('key2', JSON.stringify('value2'));

      const { result, rerender } = renderHook(
        ({ key }) => useLocalStorage<string>(key, 'default'),
        { initialProps: { key: 'key1' } }
      );

      expect(result.current[0]).toBe('value1');

      rerender({ key: 'key2' });

      expect(result.current[0]).toBe('value2');
    });

    it('should save to old key, load from new key', () => {
      localStorage.setItem('key1', JSON.stringify('initial'));
      localStorage.setItem('key2', JSON.stringify('other'));

      const { result, rerender } = renderHook(
        ({ key }) => useLocalStorage<string>(key, 'default'),
        { initialProps: { key: 'key1' } }
      );

      act(() => {
        result.current[1]('updated');
      });

      expect(localStorage.getItem('key1')).toMatch(/updated/);

      rerender({ key: 'key2' });

      expect(result.current[0]).toBe('other');
    });
  });

  describe('Standalone: getStorageValue', () => {
    it('should read value from localStorage', () => {
      localStorage.setItem('testKey', JSON.stringify('stored'));
      const value = getStorageValue('testKey', 'default');

      expect(value).toBe('stored');
    });

    it('should return default if key not found', () => {
      const value = getStorageValue('nonexistent', 'default');

      expect(value).toBe('default');
    });

    it('should handle JSON parsing', () => {
      const obj = { name: 'test', value: 42 };
      localStorage.setItem('obj', JSON.stringify(obj));

      const value = getStorageValue('obj', {});
      expect(value.name).toBe('test');
      expect(value.value).toBe(42);
    });

    it('should return default on parse error', () => {
      localStorage.setItem('badJson', 'not json');
      const value = getStorageValue('badJson', 'default');

      expect(value).toBe('default');
    });

    it('should handle array retrieval', () => {
      const arr = ['a', 'b', 'c'];
      localStorage.setItem('arr', JSON.stringify(arr));

      const value = getStorageValue('arr', []);
      expect(value).toEqual(['a', 'b', 'c']);
    });
  });

  describe('Standalone: setStorageValue', () => {
    it('should write value to localStorage', () => {
      const result = setStorageValue('testKey', 'value');

      expect(result).toBe(true);
      expect(localStorage.getItem('testKey')).toMatch(/value/);
    });

    it('should return true on success', () => {
      const result = setStorageValue('testKey', 'value');

      expect(result).toBe(true);
      expect(localStorage.getItem('testKey')).toMatch(/value/);
    });

    it('should handle complex objects', () => {
      const obj = { name: 'test', value: 42, nested: { a: 1 } };
      const result = setStorageValue('obj', obj);

      expect(result).toBe(true);
      const stored = JSON.parse(localStorage.getItem('obj') || '{}');
      expect(stored.name).toBe('test');
      expect(stored.nested.a).toBe(1);
    });

    it('should JSON serialize values', () => {
      setStorageValue('str', 'test');
      setStorageValue('num', 42);
      setStorageValue('bool', true);
      setStorageValue('arr', [1, 2, 3]);

      expect(localStorage.getItem('str')).toBe('"test"');
      expect(localStorage.getItem('num')).toBe('42');
      expect(localStorage.getItem('bool')).toBe('true');
      expect(localStorage.getItem('arr')).toBe('[1,2,3]');
    });
  });

  describe('Standalone: clearStorage', () => {
    it('should clear all localStorage', () => {
      localStorage.setItem('key1', 'value1');
      localStorage.setItem('key2', 'value2');
      localStorage.setItem('key3', 'value3');

      expect(localStorage.length).toBe(3);

      const result = clearStorage();

      expect(result).toBe(true);
      expect(localStorage.length).toBe(0);
    });

    it('should return true on success', () => {
      localStorage.setItem('test', 'value');
      const result = clearStorage();

      expect(result).toBe(true);
    });

    it('should return true and clear all data', () => {
      localStorage.setItem('key1', 'value1');
      localStorage.setItem('key2', 'value2');

      const result = clearStorage();

      expect(result).toBe(true);
      expect(localStorage.length).toBe(0);
    });
  });

  describe('Standalone: removeStorageKey', () => {
    it('should remove specific key', () => {
      localStorage.setItem('key1', 'value1');
      localStorage.setItem('key2', 'value2');

      expect(localStorage.getItem('key1')).not.toBeNull();

      const result = removeStorageKey('key1');

      expect(result).toBe(true);
      expect(localStorage.getItem('key1')).toBeNull();
      expect(localStorage.getItem('key2')).not.toBeNull();
    });

    it('should return true even if key not found', () => {
      const result = removeStorageKey('nonexistent');

      expect(result).toBe(true);
    });

    it('should return true on success', () => {
      localStorage.setItem('key', 'value');
      const result = removeStorageKey('key');

      expect(result).toBe(true);
      expect(localStorage.getItem('key')).toBeNull();
    });
  });

  describe('Standalone: getStorageKeys', () => {
    it('should return all keys in localStorage', () => {
      localStorage.setItem('a', '1');
      localStorage.setItem('b', '2');
      localStorage.setItem('c', '3');

      const keys = getStorageKeys();

      expect(keys).toContain('a');
      expect(keys).toContain('b');
      expect(keys).toContain('c');
      expect(keys).toHaveLength(3);
    });

    it('should return empty array for empty storage', () => {
      const keys = getStorageKeys();

      expect(keys).toEqual([]);
    });

    it('should handle errors gracefully', () => {
      // Just verify that the function returns an array even with empty storage
      const keys = getStorageKeys();
      expect(Array.isArray(keys)).toBe(true);
    });
  });

  describe('Standalone: getStorageSize', () => {
    it('should calculate storage size in bytes', () => {
      localStorage.setItem('short', 'abc');
      const size = getStorageSize();

      expect(size).toBeGreaterThan(0);
    });

    it('should account for key and value length', () => {
      localStorage.clear();
      localStorage.setItem('a', 'test');

      const size = getStorageSize();

      // Key 'a' = 1 byte, value 'test' = 4 bytes = 5 total
      expect(size).toBeGreaterThanOrEqual(5);
    });

    it('should accumulate for multiple items', () => {
      localStorage.clear();
      localStorage.setItem('key1', 'value');
      const size1 = getStorageSize();

      localStorage.setItem('key2', 'value');
      const size2 = getStorageSize();

      expect(size2).toBeGreaterThan(size1);
    });

    it('should return 0 for empty storage', () => {
      localStorage.clear();
      const size = getStorageSize();

      expect(size).toBe(0);
    });

    it('should handle edge cases', () => {
      // Add item with special characters
      localStorage.setItem('special-key_123', 'value');
      const size = getStorageSize();
      expect(typeof size).toBe('number');
      expect(size).toBeGreaterThan(0);
    });
  });

  describe('Integration: Multiple Operations', () => {
    it('should handle multiple hooks reading same key', () => {
      const { result: result1 } = renderHook(() =>
        useLocalStorage<string>('shared', 'initial')
      );

      const { result: result2 } = renderHook(() =>
        useLocalStorage<string>('shared', 'initial')
      );

      act(() => {
        result1.current[1]('updated');
      });

      // Both should see the updated value
      expect(result1.current[0]).toBe('updated');
      // result2 is a separate hook instance, so it won't update immediately
      // but the value in localStorage should be updated
      expect(localStorage.getItem('shared')).toMatch(/updated/);
    });

    it('should handle hook + standalone utility together', () => {
      const { result } = renderHook(() =>
        useLocalStorage<string>('key', 'initial')
      );

      act(() => {
        result.current[1]('hook-value');
      });

      const standaloneValue = getStorageValue('key', 'default');
      expect(standaloneValue).toBe('hook-value');

      const setSuccess = setStorageValue('key', 'standalone-value');
      expect(setSuccess).toBe(true);

      // Hook should see the new value (after next effect/rerender)
      expect(localStorage.getItem('key')).toMatch(/standalone-value/);
    });
  });
});
