import { describe, expect, test } from 'vitest';

import { applyPredestinedOrder } from './sort.js';

describe('applyPredestinedOrder', () => {
  test('it works', () => {
    expect(applyPredestinedOrder(['c', 'b', 'a'], ['a', 'c', 'b'])).deep.equal(['a', 'c', 'b']);
  });

  test('it works with objects', () => {
    expect(
      applyPredestinedOrder(
        [{ name: 'c' }, { name: 'b' }, { name: 'a' }],
        ['a', 'c', 'b'],
        (item) => item.name
      )
    ).deep.equal([{ name: 'a' }, { name: 'c' }, { name: 'b' }]);
  });

  test('it works when the order array is the same length as the input', () => {
    expect(applyPredestinedOrder(['c', 'a'], ['a', 'c'])).deep.equal(['a', 'c']);
  });

  test('it handles index pages as always first', () => {
    expect(applyPredestinedOrder(['c', 'a', 'index'], ['a', 'c'])).deep.equal(['index', 'a', 'c']);
  });

  test('it errors when the order specifies things that do not exist', () => {
    expect(() => applyPredestinedOrder(['c', 'b', 'a'], ['a', 'c', 'x'])).toThrow(
      'Order configuration specified "x" but it was not found in the list. Pages are ["c","b","a"]'
    );
  });

  test('it errors when order is a different length than list', () => {
    expect(() => applyPredestinedOrder(['c', 'b', 'a', 'd'], ['a', 'c', 'b']))
      .toThrow(`Order configuration specified different number of arguments than available pages:
Order: ["a","c","b"]
Actual: ["c","b","a","d"]`);
  });

  test('it errors if duplicate pages are specified', () => {
    expect(() => applyPredestinedOrder(['c', 'b', 'a'], ['a', 'c', 'a', 'c']))
      .toThrow(`Order configuration specified duplicate pages:
Unique: ["a","c"]
Order: ["a","c","a","c"]
Actual: ["c","b","a"]`);
  });

  test('it errors if a configuration order option is empty', () => {
    expect(() => applyPredestinedOrder(['c', 'b', 'a'], ['a', '', 'd'])).toThrow(
      `Order configuration found an empty string at index 1`
    );
  });
});
