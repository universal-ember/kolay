import { describe, expect, test } from 'vitest';

import { build } from './parse.js';

describe('build', () => {
  test('shallow path', () => {
    const result = build([{ mdPath: 'top/nested.md' }]);

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
    const result = build([{ mdPath: 'top-level/nested.md' }]);

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
    const result = build([
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
    const result = build([{ mdPath: 'top/deep/path.md' }]);

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
    const result = build([
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

  describe('pages at the source root', () => {
    test('a single top-level page', () => {
      const result = build([{ mdPath: 'intro.md' }]);

      expect(result).toMatchInlineSnapshot(`
        {
          "name": "root",
          "pages": [
            {
              "cleanedName": "intro",
              "groupName": "",
              "name": "intro",
              "path": "/intro.md",
            },
          ],
          "path": "root",
        }
      `);
    });

    test('top-level pages sit alongside folders', () => {
      const result = build([
        { mdPath: 'some-folder/nested.md' },
        { mdPath: 'about.md' },
        { mdPath: 'index.md' },
      ]);

      expect(result).toMatchInlineSnapshot(`
        {
          "name": "root",
          "pages": [
            {
              "cleanedName": "some folder",
              "name": "some-folder",
              "pages": [
                {
                  "cleanedName": "nested",
                  "groupName": "some folder",
                  "name": "nested",
                  "path": "/some-folder/nested.md",
                },
              ],
              "path": "some-folder",
            },
            {
              "cleanedName": "about",
              "groupName": "",
              "name": "about",
              "path": "/about.md",
            },
            {
              "cleanedName": "index",
              "groupName": "",
              "name": "index",
              "path": "/index.md",
            },
          ],
          "path": "root",
        }
      `);
    });

    test('a top-level gjs.md page keeps the double extension out of the path', () => {
      const result = build([{ mdPath: 'intro.gjs.md' }]);

      expect(result).toMatchInlineSnapshot(`
        {
          "name": "root",
          "pages": [
            {
              "cleanedName": "intro",
              "groupName": "",
              "name": "intro",
              "path": "/intro",
            },
          ],
          "path": "root",
        }
      `);
    });

    test('a top-level page keeps its config', () => {
      const result = build([{ mdPath: 'intro.md', config: { title: 'Introduction' } }]);

      expect(result).toMatchInlineSnapshot(`
        {
          "name": "root",
          "pages": [
            {
              "cleanedName": "intro",
              "groupName": "",
              "name": "intro",
              "path": "/intro.md",
              "title": "Introduction",
            },
          ],
          "path": "root",
        }
      `);
    });

    test('a leading ./ does not become a folder', () => {
      const result = build([{ mdPath: './intro.md' }]);

      expect(result).toMatchInlineSnapshot(`
        {
          "name": "root",
          "pages": [
            {
              "cleanedName": "intro",
              "groupName": "",
              "name": "intro",
              "path": "/intro.md",
            },
          ],
          "path": "root",
        }
      `);
    });
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

    test('a top-level page cannot match the name of a top-level folder', () => {
      expect(() => {
        build([{ mdPath: 'guides/index.md' }, { mdPath: 'guides.md' }]);
      }).toThrowError(
        'Cannot have a group that matches the name of an individual page. Please move guides.md into the "guides" folder. If you want this to be the first page, rename the file to guides/index.md'
      );
    });
  });
});
