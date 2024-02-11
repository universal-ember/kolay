import { describe, expect, test } from 'vitest';

import { betterSort } from './sort.js';

import type { Tutorial } from './types.ts';

type Entry = Pick<Tutorial, 'name' | 'path'>;

describe('addInTheFirstPage', () => {
  test('sorts on a property', () => {
    let list: Entry[] = [
      { name: 'b', path: '/b.md' },
      { name: 'c', path: '/c.md' },
      { name: 'a', path: '/a.md' },
    ];
    let sorted = list.sort(betterSort('name'));

    expect(sorted).toMatchInlineSnapshot(`
      [
        {
          "name": "b",
          "path": "/b.md",
        },
        {
          "name": "c",
          "path": "/c.md",
        },
        {
          "name": "a",
          "path": "/a.md",
        },
      ]
    `);
  });

  test('sorts on a property by number prefix', () => {
    let list: Entry[] = [
      { name: '09-b', path: '/b.md' },
      { name: '11-c', path: '/c.md' },
      { name: '10-a', path: '/a.md' },
    ];
    let sorted = list.sort(betterSort('name'));

    expect(sorted).toMatchInlineSnapshot(`
      [
        {
          "name": "09-b",
          "path": "/b.md",
        },
        {
          "name": "10-a",
          "path": "/a.md",
        },
        {
          "name": "11-c",
          "path": "/c.md",
        },
      ]
    `);
  });

  test('properties starting with x are placed at the end', () => {
    let list: Entry[] = [
      { name: '09-b', path: '/b.md' },
      { name: '11-c', path: '/c.md' },
      { name: 'x-a', path: '/a.md' },
      { name: 'x-11-c', path: '/c.md' },
    ];
    let sorted = list.sort(betterSort('name'));

    expect(sorted).toMatchInlineSnapshot(`
      [
        {
          "name": "09-b",
          "path": "/b.md",
        },
        {
          "name": "11-c",
          "path": "/c.md",
        },
        {
          "name": "x-a",
          "path": "/a.md",
        },
        {
          "name": "x-11-c",
          "path": "/c.md",
        },
      ]
    `);
  });

  test('if there is a path ending in index.md, it must be first', () => {
    let list: Entry[] = [
      { name: 'b', path: '/c/b.md' },
      { name: 'c', path: '/c/index.md' },
      { name: 'a', path: '/c/a.md' },
    ];
    let sorted = list.sort(betterSort('name'));

    expect(sorted).toMatchInlineSnapshot(`
      [
        {
          "name": "c",
          "path": "/c/index.md",
        },
        {
          "name": "b",
          "path": "/c/b.md",
        },
        {
          "name": "a",
          "path": "/c/a.md",
        },
      ]
    `);
  });
});
