import { describe, expect, test } from 'vitest';

import { addTitles, reshape } from './hydrate.js';
import { build, parse } from './parse.js';

import type { Page, PageTree } from '#types';

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

function namesIn(node: Page | PageTree | undefined): string[] {
  return node && 'pages' in node ? node.pages.map((page) => page.name) : [];
}

describe('index hoisting through parse()', () => {
  // `betterSort` can't cover this on its own: `build()` strips `.gjs.md` /
  // `.gts.md` from `path` before sorting runs, so extension handling is only
  // observable once the two are composed.
  test.each(['md', 'gjs.md', 'gts.md'])('an index.%s sorts first', async (ext) => {
    const tree = (await parse(['foo/apple.md', `foo/index.${ext}`], '.', [])) as PageTree;
    const [folder] = tree.pages;

    expect(namesIn(folder)).toEqual(['index', 'apple']);
  });
});

describe('folder titles', () => {
  test('a folder titles itself from its meta.json', async () => {
    const { tree } = await reshape({
      paths: ['foo/apple.md'],
      configs: [{ path: 'foo/meta.json', config: { title: 'Fancy Name' } }],
      cwd: '.',
      prefix: '/',
      base: '/',
    });

    addTitles(tree);

    const [folder] = (tree as PageTree).pages;

    expect((folder as PageTree).title).toEqual('Fancy Name');
  });

  test('otherwise a folder is titled by its cleaned name, sentence-cased', async () => {
    const { tree } = await reshape({
      paths: ['sub-folder/apple.md'],
      configs: [],
      cwd: '.',
      prefix: '/',
      base: '/',
    });

    addTitles(tree);

    const [folder] = (tree as PageTree).pages;

    expect((folder as PageTree).title).toEqual('Sub folder');
  });
});
