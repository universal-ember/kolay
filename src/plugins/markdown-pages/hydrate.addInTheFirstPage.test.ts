import { describe, expect, test } from 'vitest';

import { addInTheFirstPage } from './hydrate.js';

import type { Collection } from './types.ts';

describe('addInTheFirstPage', () => {
  test('adds in the first page to a shallow object', () => {
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

    addInTheFirstPage(tree);

    expect(tree).toMatchInlineSnapshot(`
      {
        "first": "/top/foo.md",
        "name": "top",
        "pages": [
          {
            "cleanedName": "foo",
            "groupName": "top",
            "name": "foo.md",
            "path": "/top/foo.md",
          },
        ],
        "path": "top",
      }
    `);
  });

  test('adds in the first page', () => {
    let tree: Collection = {
      name: 'top',
      path: 'top',
      pages: [
        {
          name: 'mid',
          path: 'mid',
          pages: [
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

    addInTheFirstPage(tree);

    expect(tree).toMatchInlineSnapshot(`
      {
        "first": "/top/mid/foo.md",
        "name": "top",
        "pages": [
          {
            "first": "/top/mid/foo.md",
            "name": "mid",
            "pages": [
              {
                "cleanedName": "foo",
                "groupName": "mid",
                "name": "foo.md",
                "path": "/top/mid/foo.md",
              },
            ],
            "path": "mid",
          },
        ],
        "path": "top",
      }
    `);
  });

  test('adds in the index page', () => {
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

    addInTheFirstPage(tree);

    expect(tree).toMatchInlineSnapshot(`
      {
        "first": "/top/mid/index.md",
        "name": "top",
        "pages": [
          {
            "first": "/top/mid/index.md",
            "name": "mid",
            "pages": [
              {
                "cleanedName": "index",
                "groupName": "mid",
                "name": "index.md",
                "path": "/top/mid/index.md",
              },
              {
                "cleanedName": "foo",
                "groupName": "mid",
                "name": "foo.md",
                "path": "/top/mid/foo.md",
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
