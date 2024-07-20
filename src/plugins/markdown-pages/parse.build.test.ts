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
            "cleanedName": "top",
            "name": "top",
            "pages": [
              {
                "cleanedName": "nested",
                "groupName": "top",
                "name": "nested",
                "path": "/top/nested.md",
              },
            ],
            "path": "top",
          },
        ],
        "path": "root",
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
            "cleanedName": "top level",
            "name": "top-level",
            "pages": [
              {
                "cleanedName": "nested",
                "groupName": "top level",
                "name": "nested",
                "path": "/top-level/nested.md",
              },
            ],
            "path": "top-level",
          },
        ],
        "path": "root",
      }
    `);
  });

  test('multiple shallow paths', () => {
    let result = build([
      { mdPath: 'top/nested.md' },
      { mdPath: 'top/nested-sibling.md' },
      { mdPath: 'top-two/other.md' },
    ]);

    expect(result).toMatchInlineSnapshot(`
      {
        "name": "root",
        "pages": [
          {
            "cleanedName": "top",
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
            "path": "top",
          },
          {
            "cleanedName": "top two",
            "name": "top-two",
            "pages": [
              {
                "cleanedName": "other",
                "groupName": "top two",
                "name": "other",
                "path": "/top-two/other.md",
              },
            ],
            "path": "top-two",
          },
        ],
        "path": "root",
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
            "cleanedName": "top",
            "name": "top",
            "pages": [
              {
                "cleanedName": "deep",
                "name": "deep",
                "pages": [
                  {
                    "cleanedName": "path",
                    "groupName": "deep",
                    "name": "path",
                    "path": "/top/deep/path.md",
                  },
                ],
                "path": "deep",
              },
            ],
            "path": "top",
          },
        ],
        "path": "root",
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
            "cleanedName": "top",
            "name": "top",
            "pages": [
              {
                "cleanedName": "deep",
                "name": "deep",
                "pages": [
                  {
                    "cleanedName": "another",
                    "name": "another",
                    "pages": [
                      {
                        "cleanedName": "index",
                        "groupName": "another",
                        "name": "index",
                        "path": "/top/deep/another/index.md",
                      },
                    ],
                    "path": "another",
                  },
                ],
                "path": "deep",
              },
            ],
            "path": "top",
          },
        ],
        "path": "root",
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
