import { describe, expect, test } from 'vitest';

import { deepMerge } from './deep-merge.js';

describe('deepMerge', () => {
  test('combines disjoint keys from both sides', () => {
    expect(deepMerge({ a: 1 }, { b: 2 })).toEqual({ a: 1, b: 2 });
  });

  test('source wins on collisions', () => {
    expect(deepMerge({ a: 'target' }, { a: 'source' })).toEqual({ a: 'source' });
  });

  test('merges nested plain objects rather than replacing them', () => {
    const result = deepMerge({ meta: { a: 1, b: 2 } }, { meta: { b: 3, c: 4 } });

    expect(result).toEqual({ meta: { a: 1, b: 3, c: 4 } });
  });

  test('recurses arbitrarily deep', () => {
    const result = deepMerge(
      { a: { b: { c: { d: 1, keep: true } } } },
      { a: { b: { c: { d: 2 } } } }
    );

    expect(result).toEqual({ a: { b: { c: { d: 2, keep: true } } } });
  });

  test('either side being empty is a no-op on the other', () => {
    expect(deepMerge({}, { a: 1 })).toEqual({ a: 1 });
    expect(deepMerge({ a: 1 }, {})).toEqual({ a: 1 });
    expect(deepMerge({}, {})).toEqual({});
  });

  describe('non-plain values replace wholesale', () => {
    test('arrays replace, rather than merging index-by-index like lodash', () => {
      expect(deepMerge({ tags: ['a', 'b', 'c'] }, { tags: ['z'] })).toEqual({ tags: ['z'] });
    });

    test('an array replaces an object, and an object replaces an array', () => {
      expect(deepMerge({ x: { a: 1 } }, { x: ['z'] })).toEqual({ x: ['z'] });
      expect(deepMerge({ x: ['a'] }, { x: { z: 1 } })).toEqual({ x: { z: 1 } });
    });

    test('a primitive replaces an object, and an object replaces a primitive', () => {
      expect(deepMerge({ x: { a: 1 } }, { x: 'flat' })).toEqual({ x: 'flat' });
      expect(deepMerge({ x: 'flat' }, { x: { a: 1 } })).toEqual({ x: { a: 1 } });
    });

    test('null from the source overwrites — YAML `key:` with no value means null', () => {
      expect(deepMerge({ x: { a: 1 } }, { x: null })).toEqual({ x: null });
    });

    test('an explicit undefined overwrites, unlike lodash merge which skips it', () => {
      const result = deepMerge({ x: 1 }, { x: undefined });

      expect(result).toHaveProperty('x', undefined);
    });
  });

  describe('mutation', () => {
    test('mutates neither input', () => {
      const target = { a: 1, nested: { b: 2 } };
      const source = { a: 9, nested: { c: 3 } };

      deepMerge(target, source);

      expect(target).toEqual({ a: 1, nested: { b: 2 } });
      expect(source).toEqual({ a: 9, nested: { c: 3 } });
    });

    test('a merged nested object is a fresh object, not either input', () => {
      const target = { nested: { a: 1 } };
      const source = { nested: { b: 2 } };

      const result = deepMerge(target, source);

      expect(result['nested']).not.toBe(target.nested);
      expect(result['nested']).not.toBe(source.nested);
    });
  });

  describe('prototype pollution', () => {
    test('a `__proto__` key in the source is dropped', () => {
      const source = JSON.parse('{ "__proto__": { "polluted": true } }');

      const result = deepMerge({ a: 1 }, source);

      expect(result).toEqual({ a: 1 });
      expect(Object.getPrototypeOf(result)).toBe(Object.prototype);
      expect(({} as Record<string, unknown>)['polluted']).toBeUndefined();
    });

    test('a `constructor` key in the source is dropped', () => {
      const source = JSON.parse('{ "constructor": { "prototype": { "polluted": true } } }');

      const result = deepMerge({ a: 1 }, source);

      expect(result).toEqual({ a: 1 });
      expect(({} as Record<string, unknown>)['polluted']).toBeUndefined();
    });

    test('a nested `__proto__` key is dropped too', () => {
      const source = JSON.parse('{ "meta": { "__proto__": { "polluted": true } } }');

      const result = deepMerge({ meta: { a: 1 } }, source);

      expect(result).toEqual({ meta: { a: 1 } });
      // the nested object's own prototype is the tell — an unguarded
      // recursion pollutes it while still passing the toEqual above
      expect(Object.getPrototypeOf(result['meta'])).toBe(Object.prototype);
      expect(({} as Record<string, unknown>)['polluted']).toBeUndefined();
    });
  });
});
