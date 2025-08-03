import { describe, it, expect, vi } from 'vitest';
import { cn, debounce, generateId, deepClone, isEmpty, sleep, retry } from '../common';

describe('Common Utilities', () => {
  describe('cn (class name utility)', () => {
    it('should merge Tailwind classes correctly', () => {
      expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4');
    });

    it('should handle conditional classes', () => {
      const isActive = true;
      expect(cn('base-class', isActive && 'active-class')).toBe('base-class active-class');
    });

    it('should handle falsy values', () => {
      const isActive = false;
      expect(cn('base-class', isActive && 'active-class')).toBe('base-class');
    });

    it('should handle arrays and objects', () => {
      expect(cn(['class1', 'class2'], { class3: true, class4: false })).toBe('class1 class2 class3');
    });
  });

  describe('debounce', () => {
    it('should debounce function calls', async () => {
      let callCount = 0;
      const debouncedFn = debounce(() => {
        callCount++;
      }, 100);

      // Call multiple times quickly
      debouncedFn();
      debouncedFn();
      debouncedFn();

      // Should not have been called yet
      expect(callCount).toBe(0);

      // Wait for debounce delay
      await new Promise(resolve => setTimeout(resolve, 150));

      // Should have been called only once
      expect(callCount).toBe(1);
    });

    it('should pass arguments correctly', async () => {
      let lastArgs: any[] = [];
      const debouncedFn = debounce((...args: any[]) => {
        lastArgs = args;
      }, 100);

      debouncedFn('test', 123, { key: 'value' });

      await new Promise(resolve => setTimeout(resolve, 150));

      expect(lastArgs).toEqual(['test', 123, { key: 'value' }]);
    });
  });

  describe('generateId', () => {
    it('should generate unique IDs', () => {
      const id1 = generateId();
      const id2 = generateId();

      expect(id1).toBeDefined();
      expect(id2).toBeDefined();
      expect(id1).not.toBe(id2);
      expect(typeof id1).toBe('string');
      expect(id1.length).toBeGreaterThan(0);
    });

    it('should generate alphanumeric IDs', () => {
      const id = generateId();
      expect(id).toMatch(/^[a-z0-9]+$/);
    });
  });

  describe('deepClone', () => {
    it('should clone primitive values', () => {
      expect(deepClone(42)).toBe(42);
      expect(deepClone('test')).toBe('test');
      expect(deepClone(true)).toBe(true);
      expect(deepClone(null)).toBe(null);
      expect(deepClone(undefined)).toBe(undefined);
    });

    it('should clone arrays', () => {
      const original = [1, 2, 3, { nested: 'value' }];
      const cloned = deepClone(original);

      expect(cloned).toEqual(original);
      expect(cloned).not.toBe(original);
      expect(cloned[3]).not.toBe(original[3]);
    });

    it('should clone objects', () => {
      const original = { a: 1, b: { nested: 'value' }, c: [1, 2, 3] };
      const cloned = deepClone(original);

      expect(cloned).toEqual(original);
      expect(cloned).not.toBe(original);
      expect(cloned.b).not.toBe(original.b);
      expect(cloned.c).not.toBe(original.c);
    });

    it('should clone dates', () => {
      const original = new Date('2024-01-01');
      const cloned = deepClone(original);

      expect(cloned).toEqual(original);
      expect(cloned).not.toBe(original);
      expect(cloned instanceof Date).toBe(true);
    });

    it('should throw error for circular references', () => {
      const original: any = { a: 1 };
      original.self = original;

      // Should throw error for circular references
      expect(() => deepClone(original)).toThrow('Maximum call stack size exceeded');
    });
  });

  describe('isEmpty', () => {
    it('should return true for null and undefined', () => {
      expect(isEmpty(null)).toBe(true);
      expect(isEmpty(undefined)).toBe(true);
    });

    it('should return true for empty strings', () => {
      expect(isEmpty('')).toBe(true);
      expect(isEmpty('   ')).toBe(false);
    });

    it('should return true for empty arrays', () => {
      expect(isEmpty([])).toBe(true);
      expect(isEmpty([1, 2, 3])).toBe(false);
    });

    it('should return true for empty objects', () => {
      expect(isEmpty({})).toBe(true);
      expect(isEmpty({ key: 'value' })).toBe(false);
    });

    it('should return true for empty maps and sets', () => {
      expect(isEmpty(new Map())).toBe(true);
      expect(isEmpty(new Set())).toBe(true);
      expect(isEmpty(new Map([['key', 'value']]))).toBe(false);
      expect(isEmpty(new Set([1, 2, 3]))).toBe(false);
    });

    it('should return false for non-empty values', () => {
      expect(isEmpty(0)).toBe(false);
      expect(isEmpty(false)).toBe(false);
      expect(isEmpty('hello')).toBe(false);
      expect(isEmpty([1])).toBe(false);
      expect(isEmpty({ key: 'value' })).toBe(false);
    });
  });

  describe('sleep', () => {
    it('should wait for specified time', async () => {
      const start = Date.now();
      await sleep(100);
      const end = Date.now();
      
      expect(end - start).toBeGreaterThanOrEqual(100);
    });
  });

  describe('retry', () => {
    it('should succeed on first try', async () => {
      const fn = vi.fn().mockResolvedValue('success');
      
      const result = await retry(fn);
      
      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should retry on failure and eventually succeed', async () => {
      let callCount = 0;
      const fn = vi.fn().mockImplementation(() => {
        callCount++;
        if (callCount < 3) {
          throw new Error('Temporary failure');
        }
        return 'success';
      });
      
      const result = await retry(fn, 3, 10);
      
      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(3);
    });

    it('should throw error after max retries', async () => {
      const error = new Error('Persistent failure');
      const fn = vi.fn().mockRejectedValue(error);
      
      await expect(retry(fn, 2, 10)).rejects.toThrow('Persistent failure');
      expect(fn).toHaveBeenCalledTimes(3); // Initial + 2 retries
    });

    it('should use exponential backoff', async () => {
      let callCount = 0;
      const fn = vi.fn().mockImplementation(() => {
        callCount++;
        if (callCount < 3) {
          throw new Error('Temporary failure');
        }
        return 'success';
      });
      
      const start = Date.now();
      await retry(fn, 3, 50);
      const end = Date.now();
      
      // Should have waited at least 50 + 100 = 150ms
      expect(end - start).toBeGreaterThanOrEqual(150);
    });
  });
}); 