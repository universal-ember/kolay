import { describe, expect, test } from 'vitest';

import { addInTheFirstPage } from './hydrate.js';

import type { Collection } from './types.ts';

describe('addInTheFirstPage', () => {
  test('adds in the first page to a shallow object', () => {
    let tree: Collection = {
      name: 'top',
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
            "groupName": "top",
            "name": "foo.md",
            "path": "/top/foo.md",
            "tutorialName": "foo",
          },
        ],
      }
    `);
  });

  test('adds in the first page', () => {
    let tree: Collection = {
      name: 'top',
      pages: [
        {
          name: 'mid',
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
                "groupName": "mid",
                "name": "foo.md",
                "path": "/top/mid/foo.md",
                "cleanedName": "foo",
              },
            ],
          },
        ],
      }
    `);
  });

  test('adds in the index page', () => {
    let tree: Collection = {
      name: 'top',
      pages: [
        {
          name: 'mid',
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
                "groupName": "mid",
                "name": "index.md",
                "path": "/top/mid/index.md",
                "cleanedName": "index",
              },
              {
                "groupName": "mid",
                "name": "foo.md",
                "path": "/top/mid/foo.md",
                "cleanedName": "foo",
              },
            ],
          },
        ],
      }
    `);
  });
});
