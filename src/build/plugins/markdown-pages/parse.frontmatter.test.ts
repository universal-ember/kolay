import { describe, expect, test } from 'vitest';

import { parse } from './parse.js';

const cwd = '/definitely/not/read/from';

type Node = Record<string, unknown> & { name: string };
type Tree = { pages: Array<Node & { pages?: Node[] }> };

function pageIn(tree: Tree, folder: string, name: string) {
  const group = tree.pages.find((node) => node.name === folder);

  return (group?.pages ?? []).find((node) => node.name === name);
}

describe('frontmatter', () => {
  test('by default, frontmatter nests under meta', async () => {
    const tree = (await parse(['development/intro.md'], cwd, [], {
      frontmatter: [{ path: 'development/intro.md', data: { author: 'Ryan', order: 2 } }],
    })) as unknown as Tree;

    const page = pageIn(tree, 'development', 'intro');

    expect(page?.meta).toEqual({ author: 'Ryan', order: 2 });
  });

  test('a sibling json config that also defines meta deep-merges; frontmatter wins', async () => {
    const tree = (await parse(
      ['development/intro.md', 'development/intro.json'],
      cwd,
      [
        {
          path: 'development/intro.json',
          config: { title: 'Intro', meta: { author: 'json author', reviewed: true } },
        },
      ],
      {
        frontmatter: [{ path: 'development/intro.md', data: { author: 'frontmatter author' } }],
      }
    )) as unknown as Tree;

    const page = pageIn(tree, 'development', 'intro');

    expect(page?.title).toBe('Intro');
    expect(page?.meta).toEqual({ author: 'frontmatter author', reviewed: true });
  });

  test('a custom populateManifestEntry decides the shape', async () => {
    const tree = (await parse(['development/intro.md'], cwd, [], {
      frontmatter: [{ path: 'development/intro.md', data: { title: 'From Frontmatter' } }],
      populateManifestEntry: (entry, frontmatter) => ({ ...entry, ...frontmatter }),
    })) as unknown as Tree;

    const page = pageIn(tree, 'development', 'intro');

    expect(page?.title).toBe('From Frontmatter');
    expect(page?.meta).toBeUndefined();
  });

  test('receives the default entry — derived keys included — and can override them', async () => {
    /** @type {Array<Record<string, unknown>>} */
    const seen: Array<Record<string, unknown>> = [];

    const tree = (await parse(['development/intro.md'], cwd, [], {
      frontmatter: [{ path: 'development/intro.md', data: { badge: 'new' } }],
      populateManifestEntry: (entry, frontmatter) => {
        seen.push(entry);

        // the whole entry is returned, so even a derived key can be replaced
        return { ...entry, ...frontmatter, cleanedName: 'Custom Name' };
      },
    })) as unknown as Tree;

    // the default entry passed in carries the derived keys
    expect(seen[0]).toMatchObject({
      path: '/development/intro.md',
      name: 'intro',
      groupName: 'development',
      cleanedName: 'intro',
    });

    const page = pageIn(tree, 'development', 'intro');

    expect(page?.badge).toBe('new');
    expect(page?.cleanedName).toBe('Custom Name');
  });

  test('runs on every page — the default gives each a meta, populated or empty', async () => {
    const tree = (await parse(['development/intro.md', 'development/other.md'], cwd, [], {
      frontmatter: [{ path: 'development/intro.md', data: { author: 'Ryan' } }],
    })) as unknown as Tree;

    expect(pageIn(tree, 'development', 'intro')?.meta).toEqual({ author: 'Ryan' });
    // no frontmatter, but the default still runs — meta is present, and empty
    expect(pageIn(tree, 'development', 'other')?.meta).toEqual({});
  });

  test('a custom populateManifestEntry runs for pages without frontmatter too', async () => {
    const tree = (await parse(['development/intro.md'], cwd, [], {
      // no frontmatter entry for this page at all
      populateManifestEntry: (entry, frontmatter) => ({
        ...entry,
        derived: `${entry.name as string}!`,
        frontmatterKeys: Object.keys(frontmatter).length,
      }),
    })) as unknown as Tree;

    const page = pageIn(tree, 'development', 'intro');

    expect(page?.derived).toBe('intro!');
    expect(page?.frontmatterKeys).toBe(0);
  });
});
