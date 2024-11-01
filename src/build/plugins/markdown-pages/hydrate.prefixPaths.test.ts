import { describe, expect, test } from 'vitest';

import { prefixPaths } from './hydrate.js';

import type { Collection } from './types.ts';

describe('prefixPaths', () => {
  test('it works', () => {
    let tree: Collection = {
      name: 'top',
      path: 'top',
      pages: [
        {
          name: 'foo.md',
          path: '/top/foo.md',
          groupName: 'top',
          cleanedName: 'foo',
        },
      ],
    };

    tree = prefixPaths(tree, '/prefix');

    expect(tree).toMatchInlineSnapshot(`
      {
        "name": "top",
        "pages": [
          {
            "cleanedName": "foo",
            "groupName": "top",
            "name": "foo.md",
            "path": "/prefix/top/foo.md",
          },
        ],
        "path": "top",
      }
    `);
  });

  test('works on deep objects', () => {
    let tree: Collection = {
      name: 'top',
      path: 'top',
      pages: [
        {
          name: 'mid',
          path: 'mid',
          pages: [
            {
              name: 'index.md',
              path: '/top/mid/index.md',
              groupName: 'mid',
              cleanedName: 'index',
            },
            {
              name: 'foo.md',
              path: '/top/mid/foo.md',
              groupName: 'mid',
              cleanedName: 'foo',
            },
          ],
        },
      ],
    };

    prefixPaths(tree, '/prefix');

    expect(tree).toMatchInlineSnapshot(`
      {
        "name": "top",
        "pages": [
          {
            "name": "mid",
            "pages": [
              {
                "cleanedName": "index",
                "groupName": "mid",
                "name": "index.md",
                "path": "/prefix/top/mid/index.md",
              },
              {
                "cleanedName": "foo",
                "groupName": "mid",
                "name": "foo.md",
                "path": "/prefix/top/mid/foo.md",
              },
            ],
            "path": "mid",
          },
        ],
        "path": "top",
      }
    `);
  });
});
