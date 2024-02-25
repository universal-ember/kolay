import path from 'node:path';
import url from 'node:url';

import { describe, expect, test } from 'vitest';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

import { discover } from './discover.js';

const fixtures = path.join(__dirname, '../../../fixtures/discover');

describe('discover', () => {
  test('it works', async () => {
    let result = await discover({ cwd: fixtures });

    expect(result.tree).toMatchInlineSnapshot(`
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
});
