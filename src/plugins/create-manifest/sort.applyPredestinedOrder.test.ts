import { describe, expect, test } from 'vitest';

import { applyPredestinedOrder } from './sort.js';

describe('applyPredestinedOrder', () => {
  test('it works', () => {
    expect(applyPredestinedOrder(['c', 'b', 'a'], ['a', 'c'])).deep.equal(['a', 'c', 'b']);
  });

  test('it works with objects', () => {
    expect(
      applyPredestinedOrder(
        [{ name: 'c' }, { name: 'b' }, { name: 'a' }],
        ['a', 'c'],
        (item) => item.name
      )
    ).deep.equal([{ name: 'a' }, { name: 'c' }, { name: 'b' }]);
  });

  test('it works when the order array is the same length as the input', () => {
    expect(applyPredestinedOrder(['c', 'a'], ['a', 'c'])).deep.equal(['a', 'c']);
  });

  test('it works when the order specifies things that do not exist', () => {
    expect(applyPredestinedOrder(['c', 'b', 'a'], ['a', 'c', 'x', 'y', 'z'])).deep.equal(['a', 'c', 'b']);
  });

  test('it works when the order specifies duplicates', () => {
    expect(applyPredestinedOrder(['c', 'b', 'a'], ['a', 'c', 'a', 'c'])).deep.equal(['a', 'c', 'b']);
  });
});
