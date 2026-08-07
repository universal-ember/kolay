import { describe, expect, test } from 'vitest';

import { addPaths } from './hydrate.js';

import type { Collection } from '#types';

describe('addPaths', () => {
  test('adds base-prefixed paths and appRelativePaths', () => {
    let tree = {
      name: 'top',
      path: 'root',
      pages: [
        {
          name: 'foo.md',
          path: '/top/foo.md',
          groupName: 'top',
          cleanedName: 'foo',
        },
      ],
    } as Collection;

    tree = addPaths(tree, '/Documentation', '/my-github-project/');

    expect(tree).toMatchInlineSnapshot(`
      {
        "appRelativePath": "/Documentation",
        "name": "top",
        "pages": [
          {
            "appRelativePath": "/Documentation/top/foo.md",
            "cleanedName": "foo",
            "groupName": "top",
            "name": "foo.md",
            "path": "/my-github-project/Documentation/top/foo.md",
          },
        ],
        "path": "root",
      }
    `);
  });

  test('at the default base, path and appRelativePath are the same', () => {
    const tree = {
      name: 'top',
      path: 'root',
      pages: [
        {
          name: 'foo.md',
          path: '/top/foo.md',
          groupName: 'top',
          cleanedName: 'foo',
        },
      ],
    } as Collection;

    addPaths(tree, '/', '/');

    const page = tree.pages[0];

    expect(page?.path).toBe('/top/foo.md');
    expect(page?.appRelativePath).toBe('/top/foo.md');
  });

  test('works on deep objects, locating nested collections', () => {
    const tree = {
      name: 'top',
      path: 'root',
      pages: [
        {
          name: 'mid',
          path: 'mid',
          pages: [
            {
              name: 'index.md',
              path: '/mid/index.md',
              groupName: 'mid',
              cleanedName: 'index',
            },
            {
              name: 'foo.md',
              path: '/mid/foo.md',
              groupName: 'mid',
              cleanedName: 'foo',
            },
          ],
        },
      ],
    } as Collection;

    addPaths(tree, '/Documentation', '/prefix/');

    expect(tree).toMatchInlineSnapshot(`
      {
        "appRelativePath": "/Documentation",
        "name": "top",
        "pages": [
          {
            "appRelativePath": "/Documentation/mid",
            "name": "mid",
            "pages": [
              {
                "appRelativePath": "/Documentation/mid/index.md",
                "cleanedName": "index",
                "groupName": "mid",
                "name": "index.md",
                "path": "/prefix/Documentation/mid/index.md",
              },
              {
                "appRelativePath": "/Documentation/mid/foo.md",
                "cleanedName": "foo",
                "groupName": "mid",
                "name": "foo.md",
                "path": "/prefix/Documentation/mid/foo.md",
              },
            ],
            "path": "mid",
          },
        ],
        "path": "root",
      }
    `);
  });
});
