import { describe, expect, test, vi } from 'vitest';

import { addPaths } from './hydrate.js';

import type { PageTree } from '#types';
import type * as NodePath from 'node:path';

/**
 * On Windows, `node:path` joins with backslashes. Page paths are URLs, so they
 * must keep forward slashes whatever the platform: run `addPaths` against the
 * win32 flavour of `node:path` to check it does not leak backslashes into them.
 */
vi.mock('node:path', async (importOriginal) => {
  const path = await importOriginal<typeof NodePath>();

  return { ...path.win32, default: path.win32, posix: path.posix, win32: path.win32 };
});

describe('addPaths, on Windows', () => {
  test('builds URL paths with forward slashes', () => {
    const tree = {
      name: 'top',
      path: 'root',
      pages: [
        {
          name: 'mid',
          path: 'mid',
          pages: [
            {
              name: 'foo.md',
              path: '/mid/foo.md',
              groupName: 'top',
              cleanedName: 'foo',
            },
          ],
        },
      ],
    } as PageTree;

    addPaths(tree, '/Documentation', '/my-github-project/');

    const folder = tree.pages[0] as PageTree;
    const page = folder.pages[0];

    expect(folder.appRelativePath).toBe('/Documentation/mid');
    expect(page?.appRelativePath).toBe('/Documentation/mid/foo.md');
    expect(page?.path).toBe('/my-github-project/Documentation/mid/foo.md');
  });
});
