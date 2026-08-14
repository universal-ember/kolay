import { describe, expect, test } from 'vitest';

import { groupNamesIn } from '../nav.js';
import { navEntriesFor, navEntryFor, navEntryNamed, treeFor } from './nav-entries.ts';

import type { Group, NavNode, Page, PageTree } from '../types.ts';

function page(groupName: string, name: string): Page {
  return {
    path: `/${groupName}/pages/${name}.md`,
    appRelativePath: `/${groupName}/pages/${name}.md`,
    name,
    groupName: 'pages',
    cleanedName: name,
  };
}

/**
 * A group as the manifest has it — its tree named after the group, as the
 * build names it once parsing is done.
 */
function group(name: string): Group {
  const first = page(name, 'index');
  const tree: PageTree = {
    path: name,
    name,
    appRelativePath: `/${name}`,
    first: first.path,
    pages: [
      {
        path: 'pages',
        name: 'pages',
        appRelativePath: `/${name}/pages`,
        first: first.path,
        pages: [first, page(name, 'other')],
      },
    ],
  };

  return { name, list: [first], tree };
}

/** A nav node for a group that collects nothing. */
function leaf(name: string): NavNode {
  return { name, group: name, children: [] };
}

/** A nav node for a group that collects others, with pages of its own. */
function collects(name: string, ...children: NavNode[]): NavNode {
  return { name, group: name, children };
}

/**
 * The same, for a group with no pages of its own — which must collect at
 * least one group, so that its entry has somewhere to land.
 */
function collectsOnly(name: string, first: NavNode, ...rest: NavNode[]): NavNode {
  return { name, group: null, children: [first, ...rest] };
}

const GROUPS = ['Home', 'guides', 'data', 'warp-drive', 'schema', 'json-api'].map(group);

/** Asserting, like the docs service's own `groupFor`. */
function groupFor(name: string): Group {
  const found = GROUPS.find((candidate) => candidate.name === name);

  if (!found) throw new Error(`No such group in the fixture: '${name}'`);

  return found;
}

const hrefForGroup = (name: string) => `/root-url/${name}`;

describe('groupNamesIn', () => {
  test('a leaf is its own group', () => {
    expect(groupNamesIn(leaf('guides'))).toEqual(['guides']);
  });

  test("a collection group's own group comes first, then its children, depth first", () => {
    expect(
      groupNamesIn(collects('data', collects('warp-drive', leaf('json-api')), leaf('schema')))
    ).toEqual(['data', 'warp-drive', 'json-api', 'schema']);
  });

  test('a group with no pages of its own contributes no group name', () => {
    expect(groupNamesIn(collectsOnly('data', leaf('warp-drive')))).toEqual(['warp-drive']);
  });
});

describe('treeFor', () => {
  test('a leaf renders the group its own tree, untouched', () => {
    expect(treeFor(leaf('guides'), groupFor)).toBe(groupFor('guides').tree);
  });

  test('a collection group names the tree, and its own pages come first', () => {
    const tree = treeFor(collects('data', leaf('warp-drive'), leaf('schema')), groupFor);

    expect(tree.name).toBe('data');
    expect(tree.path).toBe('data');
    expect(tree.pages.map((entry) => entry.name)).toEqual([
      // the collection group's own page folder, hoisted above the sections
      'pages',
      'warp-drive',
      'schema',
    ]);
  });

  test('with no pages of its own, the tree is just the sections', () => {
    const tree = treeFor(collectsOnly('data', leaf('warp-drive'), leaf('schema')), groupFor);

    expect(tree.pages.map((entry) => entry.name)).toEqual(['warp-drive', 'schema']);
  });

  test("a section keeps the collected group's pages", () => {
    const tree = treeFor(collectsOnly('data', leaf('warp-drive')), groupFor);
    const [section] = tree.pages as PageTree[];

    expect(section?.pages).toBe(groupFor('warp-drive').tree.pages);
  });

  test('sections nest, for a collected group that collects others', () => {
    const tree = treeFor(
      collectsOnly('data', collects('warp-drive', leaf('json-api')), leaf('schema')),
      groupFor
    );
    const [nested] = tree.pages as PageTree[];

    expect(tree.pages.map((entry) => entry.name)).toEqual(['warp-drive', 'schema']);
    expect(nested?.pages.map((entry) => entry.name)).toEqual(['pages', 'json-api']);
  });

  test('the landing group supplies the location and landing page', () => {
    // the collection group's own, when it has pages
    expect(treeFor(collects('data', leaf('schema')), groupFor)).toMatchObject({
      appRelativePath: '/data',
      first: '/data/pages/index.md',
    });

    // otherwise the first group it collects, however deep
    expect(
      treeFor(collectsOnly('data', collects('warp-drive', leaf('json-api'))), groupFor)
    ).toMatchObject({ appRelativePath: '/warp-drive', first: '/warp-drive/pages/index.md' });
  });
});

describe('navEntriesFor', () => {
  const nav = [
    leaf('Home'),
    collectsOnly('data', leaf('data'), leaf('warp-drive'), leaf('schema')),
    leaf('guides'),
  ];
  const entries = navEntriesFor(nav, groupFor, hrefForGroup);

  test('an entry per node, in order — the collected groups are not entries', () => {
    expect(entries.map((entry) => entry.name)).toEqual(['Home', 'data', 'guides']);
  });

  test('a collecting entry carries every group beneath it, in order', () => {
    const [, includer] = entries;

    expect(includer?.isCollection).toBe(true);
    expect(includer?.groups.map((member) => member.name)).toEqual(['data', 'warp-drive', 'schema']);
  });

  test('a collecting entry links at its landing group', () => {
    expect(entries[1]?.href).toBe('/root-url/data');
  });

  test('a collecting entry renders the merged tree', () => {
    expect((entries[1]?.tree.pages as PageTree[]).map((section) => section.name)).toEqual([
      'data',
      'warp-drive',
      'schema',
    ]);
  });

  test("a plain entry is just the group, with the group's own tree and URL", () => {
    const [home] = entries;

    expect(home?.isCollection).toBe(false);
    expect(home?.groups.map((member) => member.name)).toEqual(['Home']);
    expect(home?.tree).toBe(groupFor('Home').tree);
    expect(home?.href).toBe('/root-url/Home');
  });

  test('a collection group with pages of its own is one entry, not two', () => {
    const [entry] = navEntriesFor([collects('data', leaf('schema'))], groupFor, hrefForGroup);

    expect(entry?.name).toBe('data');
    expect(entry?.href).toBe('/root-url/data');
    expect(entry?.groups.map((member) => member.name)).toEqual(['data', 'schema']);
    expect(entry?.tree.pages.map((section) => section.name)).toEqual(['pages', 'schema']);
  });

  test('nothing collects anything: an entry per group, in order', () => {
    const plain = [leaf('Home'), leaf('guides')];

    expect(navEntriesFor(plain, groupFor, hrefForGroup).map((entry) => entry.name)).toEqual([
      'Home',
      'guides',
    ]);
    expect(navEntriesFor(plain, groupFor, hrefForGroup).every((entry) => !entry.isCollection)).toBe(
      true
    );
  });
});

describe('navEntryFor', () => {
  const entries = navEntriesFor(
    [leaf('Home'), collectsOnly('data', leaf('warp-drive'), collects('schema', leaf('json-api')))],
    groupFor,
    hrefForGroup
  );

  test('a collected group resolves to the collecting entry', () => {
    expect(navEntryFor(entries, 'warp-drive')?.name).toBe('data');
  });

  test('so does one nested deeper', () => {
    expect(navEntryFor(entries, 'json-api')?.name).toBe('data');
  });

  test('a plain group resolves to its own entry', () => {
    expect(navEntryFor(entries, 'Home')?.name).toBe('Home');
  });

  test('undefined for a group that is not in the navigation', () => {
    expect(navEntryFor(entries, 'nope')).toBeUndefined();
  });
});

describe('navEntryNamed', () => {
  const entries = navEntriesFor(
    [leaf('Home'), collectsOnly('data', leaf('warp-drive'), collects('schema', leaf('json-api')))],
    groupFor,
    hrefForGroup
  );

  test('a collection group with no src of its own resolves by its own name', () => {
    // nothing else can resolve it: it is in no manifest and owns no pages
    expect(navEntryNamed(entries, 'data')?.groups[0]?.name).toBe('warp-drive');
  });

  test('case-insensitively, like group names', () => {
    expect(navEntryNamed(entries, 'DATA')?.name).toBe('data');
  });

  test('a collected group does not resolve — it is not an entry', () => {
    expect(navEntryNamed(entries, 'warp-drive')).toBeUndefined();
  });

  test('undefined for a name that is not in the navigation', () => {
    expect(navEntryNamed(entries, 'nope')).toBeUndefined();
  });
});
