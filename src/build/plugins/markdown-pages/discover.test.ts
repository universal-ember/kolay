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
        "first": "/c/index.md",
        "name": "root",
        "pages": [
          {
            "cleanedName": "c",
            "first": "/c/index.md",
            "name": "c",
            "pages": [
              {
                "cleanedName": "index",
                "groupName": "c",
                "name": "index",
                "path": "/c/index.md",
              },
              {
                "cleanedName": "c b",
                "groupName": "c",
                "name": "c-b",
                "path": "/c/c-b.md",
              },
              {
                "cleanedName": "c a",
                "groupName": "c",
                "name": "c-a",
                "path": "/c/c-a.md",
              },
              {
                "cleanedName": "d",
                "first": "/c/d/d-a.md",
                "name": "d",
                "pages": [
                  {
                    "cleanedName": "d a",
                    "groupName": "d",
                    "name": "d-a",
                    "path": "/c/d/d-a.md",
                  },
                  {
                    "cleanedName": "d b",
                    "groupName": "d",
                    "name": "d-b",
                    "path": "/c/d/d-b.md",
                  },
                ],
                "path": "d",
              },
              {
                "cleanedName": "e",
                "first": "/c/e/e-b.md",
                "name": "e",
                "pages": [
                  {
                    "cleanedName": "e b",
                    "groupName": "e",
                    "name": "e-b",
                    "path": "/c/e/e-b.md",
                  },
                  {
                    "cleanedName": "e a",
                    "groupName": "e",
                    "name": "e-a",
                    "path": "/c/e/e-a.md",
                  },
                ],
                "path": "e",
              },
            ],
            "path": "c",
          },
        ],
        "path": "root",
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
            "cleanedName": "main",
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
            "path": "main",
          },
        ],
        "path": "root",
      }
    `);
  });

  test('it works with a folder that does not exist', async () => {
    let result = await discover({ src: path.join(fixtures, '---does-not-exist---') });

    expect(result.groups[0]?.tree).toMatchInlineSnapshot(`
      {
        "name": "root",
        "pages": [],
        "path": "root",
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
    expect(result.groups.map((x) => x.name)).deep.equal(['Group 1']);
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
    expect(result.groups.map((x) => x.name)).deep.equal(['root', 'Group 1']);
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
          "cleanedName": "some file",
          "groupName": "components",
          "name": "some-file",
          "path": "/Group 1/components/some-file.md",
        },
      ]
    `);
  });
});
