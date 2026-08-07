import { describe, expect, test } from 'vitest';

import { addInTheFirstPage } from './hydrate.js';

import type { Collection } from '#types';

describe('addInTheFirstPage', () => {
  test('adds in the first page to a shallow object', () => {
    const tree: Collection = {
      name: 'top',
      path: 'top',
      appRelativePath: '/top',
      pages: [
        {
          name: 'foo.md',
          path: '/top/foo.md',
          appRelativePath: '/top/foo.md',
          groupName: 'top',
          cleanedName: 'foo',
        },
      ],
    };

    addInTheFirstPage(tree);

    expect(tree).toMatchInlineSnapshot(`
      {
        "appRelativePath": "/top",
        "first": "/top/foo.md",
        "name": "top",
        "pages": [
          {
            "appRelativePath": "/top/foo.md",
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
    const tree: Collection = {
      name: 'top',
      path: 'top',
      appRelativePath: '/top',
      pages: [
        {
          name: 'mid',
          path: 'mid',
          appRelativePath: '/mid',
          pages: [
            {
              name: 'foo.md',
              path: '/top/mid/foo.md',
              appRelativePath: '/top/mid/foo.md',
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
        "appRelativePath": "/top",
        "first": "/top/mid/foo.md",
        "name": "top",
        "pages": [
          {
            "appRelativePath": "/mid",
            "first": "/top/mid/foo.md",
            "name": "mid",
            "pages": [
              {
                "appRelativePath": "/top/mid/foo.md",
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
    const tree: Collection = {
      name: 'top',
      path: 'top',
      appRelativePath: '/top',
      pages: [
        {
          name: 'mid',
          path: 'mid',
          appRelativePath: '/mid',
          pages: [
            {
              name: 'index.md',
              path: '/top/mid/index.md',
              appRelativePath: '/top/mid/index.md',
              groupName: 'mid',
              cleanedName: 'index',
            },
            {
              name: 'foo.md',
              path: '/top/mid/foo.md',
              appRelativePath: '/top/mid/foo.md',
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
        "appRelativePath": "/top",
        "first": "/top/mid/index.md",
        "name": "top",
        "pages": [
          {
            "appRelativePath": "/mid",
            "first": "/top/mid/index.md",
            "name": "mid",
            "pages": [
              {
                "appRelativePath": "/top/mid/index.md",
                "cleanedName": "index",
                "groupName": "mid",
                "name": "index.md",
                "path": "/top/mid/index.md",
              },
              {
                "appRelativePath": "/top/mid/foo.md",
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
