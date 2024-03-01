import { describe, expect as throwingExpect, test } from 'vitest';

import { sortTree } from './sort.js';

const expect = throwingExpect.soft;

describe('sortTree', () => {
  test('does nothing with no configs', () => {
    let result = sortTree(
      {
        name: 'top',
        pages: [
          {
            path: '/top/second',
            name: 'second',
            groupName: 'top',
            cleanedName: 'second',
          },
          { name: 'first', path: '/top/first', groupName: 'top', cleanedName: 'first' },
        ],
      },
      []
    );

    expect(result).toMatchInlineSnapshot(`
      {
        "name": "top",
        "pages": [
          {
            "cleanedName": "second",
            "groupName": "top",
            "name": "second",
            "path": "/top/second",
          },
          {
            "cleanedName": "first",
            "groupName": "top",
            "name": "first",
            "path": "/top/first",
          },
        ],
      }
    `);
  });

  test('sorts the pages based on a config', () => {
    let result = sortTree(
      {
        name: 'top',
        pages: [
          {
            path: '/top/second',
            name: 'second',
            groupName: 'top',
            cleanedName: 'second',
          },
          { name: 'first', path: '/top/first', groupName: 'top', cleanedName: 'first' },
        ],
      },
      [{ path: 'top/meta.jsonc', config: { order: ['first', 'second'] } }]
    );

    expect(result.pages.length).toEqual(2);
    expect(result.pages.map((x) => x.name)).deep.equal(['first', 'second']);
  });

  test('sorts deeply nested pages', () => {
    let result = sortTree(
      {
        name: 'top',
        pages: [
          {
            name: 'second',
            pages: [
              {
                path: '/top/second/second',
                name: 'second',
                groupName: 'top',
                cleanedName: 'second',
              },
              { name: 'first', path: '/top/second/first', groupName: 'top', cleanedName: 'first' },
            ],
          },
        ],
      },
      [{ path: 'top/second/meta.jsonc', config: { order: ['first', 'second'] } }]
    );

    expect(result.pages.length).toEqual(1);
    expect(result.pages[0]?.pages.length).toEqual(2);
    expect(result.pages[0]?.pages.map((x) => x.name)).deep.equal(['first', 'second']);
  });
});
