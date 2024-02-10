import { describe, expect,test } from 'vitest';

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
                "groupName": "top",
                "name": "nested.md",
                "path": "/top/nested.md",
                "tutorialName": "nested",
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
      { mdPath: 'top-2/other.md' }
    ]);

    expect(result).toMatchInlineSnapshot(`
      {
        "name": "root",
        "pages": [
          {
            "name": "top",
            "pages": [
              {
                "groupName": "top",
                "name": "nested.md",
                "path": "/top/nested.md",
                "tutorialName": "nested",
              },
              {
                "groupName": "top",
                "name": "nested-sibling.md",
                "path": "/top/nested-sibling.md",
                "tutorialName": "nestedsibling",
              },
              {
                "groupName": "top",
                "name": "other.md",
                "path": "/top-2/other.md",
                "tutorialName": "other",
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
                    "groupName": "deep",
                    "name": "path.md",
                    "path": "/top/deep/path.md",
                    "tutorialName": "path",
                  },
                ],
              },
            ],
          },
        ],
      }
    `)
  });

  test('a deep path with an index.md', () => {
    let result = build([{
      mdPath: 'top/deep/another/index.md'
    }]);

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
                        "groupName": "another",
                        "name": "index.md",
                        "path": "/top/deep/another/index.md",
                        "tutorialName": "index",
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      }
    `)
  });
  
  describe('validation', () => {
  test('cannot have named and index at the same time', () => {
    expect(() => {
      build([
        { mdPath: 'top/deep/another/index.md' }, 
        { mdPath: 'top/deep/another.md' }
      ]);
    }).toThrowError('Cannot have a group that matches the name of an individual page. Please move top/deep/another.md into the "another" folder. If you want this to be the first page, rename the file to top/deep/another/index.md');
  });

  test('cannot have index and named at the same time', () => {
    expect(() => {
      build([
        { mdPath: 'top/deep/another.md' },
        { mdPath: 'top/deep/another/index.md' }, 
      ]);
    }).toThrowError('Cannot have a group that matches the name of an individual page. Please move another.md into the "/top/deep/another" folder. If you want this to be the first page, rename the file to top/deep/another/index.md');
  });
  });
});
