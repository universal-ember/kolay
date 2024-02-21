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
            tutorialName: 'second',
          },
          { name: 'first', path: '/top/first', groupName: 'top', tutorialName: 'first' },
        ],
      },
      []
    );

    expect(result).toMatchInlineSnapshot(`
      {
        "name": "top",
        "pages": [
          {
            "groupName": "top",
            "name": "second",
            "path": "/top/second",
            "tutorialName": "second",
          },
          {
            "groupName": "top",
            "name": "first",
            "path": "/top/first",
            "tutorialName": "first",
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
            tutorialName: 'second',
          },
          { name: 'first', path: '/top/first', groupName: 'top', tutorialName: 'first' },
        ],
      },
      [{ path: '/top/meta.jsonc', config: { order: ['first', 'second'] } }]
    );

    expect(result.pages.length).toEqual(2);
    expect(result.pages.map(x => x.name)).deep.equal(['first', 'second']);
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
                tutorialName: 'second',
              },
              { name: 'first', path: '/top/second/first', groupName: 'top', tutorialName: 'first' },
            ],
          },
        ],
      },
      [{ path: '/top/second/meta.jsonc', config: { order: ['first', 'second'] } }]
    );

    expect(result.pages.length).toEqual(1);
    expect(result.pages[0]?.pages.length).toEqual(2);
    expect(result.pages[0]?.pages.map(x => x.name)).deep.equal(['first', 'second']);
  });
});
