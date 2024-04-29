import { describe, expect, test } from 'vitest';

import { build } from './parse.js';

describe('build', () => {
  test('shallow path', () => {
    let result = build([{ mdPath: 'top/nested.md' }]);

    expect(result).toMatchInlineSnapshot(`
      {
        "name": "root",
        "pages": [
          {
            "name": "top",
            "pages": [
              {
                "cleanedName": "nested",
                "groupName": "top",
                "name": "nested",
                "path": "/top/nested.md",
              },
            ],
          },
        ],
      }
    `);
  });

  test('hypehenated group', () => {
    let result = build([{ mdPath: 'top-level/nested.md' }]);

    expect(result).toMatchInlineSnapshot(`
      {
        "name": "root",
        "pages": [
          {
            "name": "top level",
            "pages": [
              {
                "cleanedName": "nested",
                "groupName": "top level",
                "name": "nested",
                "path": "/top-level/nested.md",
              },
            ],
          },
        ],
      }
    `);
  });

  test('multiple shallow paths', () => {
    let result = build([
      { mdPath: 'top/nested.md' },
      { mdPath: 'top/nested-sibling.md' },
      { mdPath: 'top-2/other.md' },
    ]);

    expect(result).toMatchInlineSnapshot(`
      {
        "name": "root",
        "pages": [
          {
            "name": "top",
            "pages": [
              {
                "cleanedName": "nested",
                "groupName": "top",
                "name": "nested",
                "path": "/top/nested.md",
              },
              {
                "cleanedName": "nested sibling",
                "groupName": "top",
                "name": "nested-sibling",
                "path": "/top/nested-sibling.md",
              },
            ],
          },
          {
            "name": "top ",
            "pages": [
              {
                "cleanedName": "other",
                "groupName": "top ",
                "name": "other",
                "path": "/top-2/other.md",
              },
            ],
          },
        ],
      }
    `);
  });

  test('a deep path', () => {
    let result = build([{ mdPath: 'top/deep/path.md' }]);

    expect(result).toMatchInlineSnapshot(`
      {
        "name": "root",
        "pages": [
          {
            "name": "top",
            "pages": [
              {
                "name": "deep",
                "pages": [
                  {
                    "cleanedName": "path",
                    "groupName": "deep",
                    "name": "path",
                    "path": "/top/deep/path.md",
                  },
                ],
              },
            ],
          },
        ],
      }
    `);
  });

  test('a deep path with an index.md', () => {
    let result = build([
      {
        mdPath: 'top/deep/another/index.md',
      },
    ]);

    expect(result).toMatchInlineSnapshot(`
      {
        "name": "root",
        "pages": [
          {
            "name": "top",
            "pages": [
              {
                "name": "deep",
                "pages": [
                  {
                    "name": "another",
                    "pages": [
                      {
                        "cleanedName": "index",
                        "groupName": "another",
                        "name": "index",
                        "path": "/top/deep/another/index.md",
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      }
    `);
  });

  describe('validation', () => {
    test('cannot have named and index at the same time', () => {
      expect(() => {
        build([{ mdPath: 'top/deep/another/index.md' }, { mdPath: 'top/deep/another.md' }]);
      }).toThrowError(
        'Cannot have a group that matches the name of an individual page. Please move top/deep/another.md into the "another" folder. If you want this to be the first page, rename the file to top/deep/another/index.md'
      );
    });

    test('cannot have index and named at the same time', () => {
      expect(() => {
        build([{ mdPath: 'top/deep/another.md' }, { mdPath: 'top/deep/another/index.md' }]);
      }).toThrowError(
        'Cannot have a group that matches the name of an individual page. Please move another.md into the "/top/deep/another" folder. If you want this to be the first page, rename the file to top/deep/another/index.md'
      );
    });
  });
});
