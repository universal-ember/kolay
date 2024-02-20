import { describe, expect, test } from 'vitest';

import { sortTree } from './sort.js';

describe('sortTree', () => {
  test('does nothing with no configs', () => {
    let result = sortTree({
      name: 'top',
      pages: [
        {
          path: '/top/second',
          name: 'second',
          groupName: 'top',
          tutorialName: 'second',

        }, { name: 'first', path: '/top/first', groupName: 'top', tutorialName: 'first' }
      ],
    }, []);

    expect(result).toMatchInlineSnapshot(`
      {
        "name": "top",
        "pages": [
          {
            "groupName": "top",
            "name": "second",
            "path": "/top/second",
            "tutorialName": "second",
          },
          {
            "groupName": "top",
            "name": "first",
            "path": "/top/first",
            "tutorialName": "first",
          },
        ],
      }
    `);
  });
});

