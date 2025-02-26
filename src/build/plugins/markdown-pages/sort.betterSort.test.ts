import { describe, expect, test } from 'vitest';

import { betterSort } from './sort.js';

import type { Page } from '#types';

type Entry = Pick<Page, 'name' | 'path'>;

describe('addInTheFirstPage', () => {
  test('sorts on a property', () => {
    const list: Entry[] = [
      { name: 'b', path: '/b.md' },
      { name: 'c', path: '/c.md' },
      { name: 'a', path: '/a.md' },
    ];
    const sorted = list.sort(betterSort('name'));

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
    const list: Entry[] = [
      { name: '09-b', path: '/b.md' },
      { name: '11-c', path: '/c.md' },
      { name: '10-a', path: '/a.md' },
    ];
    const sorted = list.sort(betterSort('name'));

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
    const list: Entry[] = [
      { name: '09-b', path: '/b.md' },
      { name: '11-c', path: '/c.md' },
      { name: 'x-a', path: '/a.md' },
      { name: 'x-11-c', path: '/c.md' },
    ];
    const sorted = list.sort(betterSort('name'));

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
    const list: Entry[] = [
      { name: 'b', path: '/c/b.md' },
      { name: 'c', path: '/c/index.md' },
      { name: 'a', path: '/c/a.md' },
    ];
    const sorted = list.sort(betterSort('name'));

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

  describe('From the Tutorial', () => {
    test('properties starting with x are placed at the end', () => {
      const list: { name: string }[] = [
        { name: '6-component-patterns' },
        { name: 'x-10-observation' },
        { name: '1-introduction' },
      ];
      const sorted = list.sort(betterSort('name'));

      expect(sorted).toMatchInlineSnapshot(`
      [
        {
          "name": "1-introduction",
        },
        {
          "name": "6-component-patterns",
        },
        {
          "name": "x-10-observation",
        },
      ]
    `);
    });

    test('10 comes after 9, and 11 comes after 10', () => {
      const list: { name: string }[] = [
        { name: '12-loading-patterns' },
        { name: '11-requesting-data' },
        { name: '8-form-data-controlled' },
        { name: '99-next-steps' },
        { name: '1-introduction' },
      ];
      const sorted = list.sort(betterSort('name'));

      expect(sorted).toMatchInlineSnapshot(`
        [
          {
            "name": "1-introduction",
          },
          {
            "name": "8-form-data-controlled",
          },
          {
            "name": "11-requesting-data",
          },
          {
            "name": "12-loading-patterns",
          },
          {
            "name": "99-next-steps",
          },
        ]
      `);
    });
  });
});
