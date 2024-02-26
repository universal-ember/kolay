import path from 'node:path';
import url from 'node:url';

import { describe, expect, test } from 'vitest';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

import { discover } from './discover.js';

const fixtures = path.join(__dirname, '../../../fixtures');

describe('discover', () => {
  test('it works', async () => {
    let result = await discover({ src: path.join(fixtures, 'discover') });

    expect(result.groups[0]?.tree).toMatchInlineSnapshot(`
      {
        "first": "/c/c-b.md",
        "name": "root",
        "pages": [
          {
            "first": "/c/c-b.md",
            "name": "c",
            "pages": [
              {
                "cleanedName": "cb",
                "groupName": "c",
                "name": "c-b",
                "path": "/c/c-b.md",
              },
              {
                "cleanedName": "ca",
                "groupName": "c",
                "name": "c-a",
                "path": "/c/c-a.md",
              },
              {
                "first": "/c/d/d-a.md",
                "name": "d",
                "pages": [
                  {
                    "cleanedName": "da",
                    "groupName": "d",
                    "name": "d-a",
                    "path": "/c/d/d-a.md",
                  },
                  {
                    "cleanedName": "db",
                    "groupName": "d",
                    "name": "d-b",
                    "path": "/c/d/d-b.md",
                  },
                ],
              },
              {
                "first": "/c/e/e-b.md",
                "name": "e",
                "pages": [
                  {
                    "cleanedName": "eb",
                    "groupName": "e",
                    "name": "e-b",
                    "path": "/c/e/e-b.md",
                  },
                  {
                    "cleanedName": "ea",
                    "groupName": "e",
                    "name": "e-a",
                    "path": "/c/e/e-a.md",
                  },
                ],
              },
            ],
          },
        ],
      }
    `);
  });

  test('it works with a tiny set of docs', async () => {
    let result = await discover({ src: path.join(fixtures, 'discover-tiny') });

    expect(result.groups[0]?.tree).toMatchInlineSnapshot(`
      {
        "first": "/main/index.md",
        "name": "root",
        "pages": [
          {
            "first": "/main/index.md",
            "name": "main",
            "pages": [
              {
                "cleanedName": "index",
                "groupName": "main",
                "name": "index",
                "path": "/main/index.md",
              },
            ],
          },
        ],
      }
    `);
  });

  test('it works with a folder that does not exist', async () => {
    let result = await discover({ src: path.join(fixtures, '---does-not-exist---') });

    expect(result.groups[0]?.tree).toMatchInlineSnapshot(`
      {
        "name": "root",
        "pages": [],
      }
    `);
  });

  test('it can work on only groups', async () => {
    let result = await discover({
      groups: [
        {
          name: 'Group 1',
          src: path.join(fixtures, 'group-1'),
        },
      ],
    });

    expect(result.groups.length).toBe(1);
    expect(result.groups.map(x => x.name)).deep.equal(['Group 1']);
  });

  test('it adds in a group by name', async () => {
    let result = await discover({
      src: path.join(fixtures, 'discover-tiny'),
      groups: [
        {
          name: 'Group 1',
          src: path.join(fixtures, 'group-1'),
        },
      ],
    });

    expect(result.groups.length).toBe(2);
    expect(result.groups.map(x => x.name)).deep.equal(['root', 'Group 1']);
    expect(result.groups[0]?.list).toMatchInlineSnapshot(`
      [
        {
          "cleanedName": "index",
          "groupName": "main",
          "name": "index",
          "path": "/main/index.md",
        },
      ]
    `);
    expect(result.groups[1]?.list).toMatchInlineSnapshot(`
      [
        {
          "cleanedName": "somefile",
          "groupName": "components",
          "name": "some-file",
          "path": "/Group 1/components/some-file.md",
        },
      ]
    `);
  });
});
