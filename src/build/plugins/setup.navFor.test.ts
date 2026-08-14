import { describe, expect, test } from 'vitest';

import { navFor } from './setup.js';

type Usage = { groups?: Array<{ name: string; src?: string }>; nav?: unknown };

function state(...usages: Usage[]) {
  return { options: usages[0] ?? {}, usages, isPrimary: true };
}

function group(name: string) {
  return { groups: [{ name, src: `./${name}` }] };
}

const leaf = (name: string) => ({ name, group: name, children: [] });

describe('navFor', () => {
  test('the co-located pages come first, then a node per group', () => {
    expect(navFor(state(group('guides'), group('demos')))).toEqual([
      leaf('Home'),
      leaf('guides'),
      leaf('demos'),
    ]);
  });

  test('a usage with no groups contributes nothing', () => {
    expect(navFor(state({ groups: [] }, group('guides')))).toEqual([leaf('Home'), leaf('guides')]);
  });

  test("a collection group's tree replaces the groups inside it, in its own position", () => {
    const nav = { name: 'data', group: 'data', children: [leaf('warp-drive')] };

    // the shape docs('data', { src, collection: [...] }) produces: the tree on
    // the collection group's own usage, then a usage per group it collects
    expect(navFor(state(group('guides'), { ...group('data'), nav }, group('warp-drive')))).toEqual([
      leaf('Home'),
      leaf('guides'),
      nav,
    ]);
  });

  test('a collection group with no pages of its own is a nav-only usage', () => {
    const nav = { name: 'data', group: null, children: [leaf('warp-drive'), leaf('schema')] };

    expect(
      navFor(state({ groups: [], nav }, group('warp-drive'), group('schema'), group('guides')))
    ).toEqual([leaf('Home'), nav, leaf('guides')]);
  });

  test('groups collected deeper down are still not top-level entries', () => {
    const nav = {
      name: 'data',
      group: null,
      children: [{ name: 'warp-drive', group: 'warp-drive', children: [leaf('json-api')] }],
    };

    expect(navFor(state({ groups: [], nav }, group('warp-drive'), group('json-api')))).toEqual([
      leaf('Home'),
      nav,
    ]);
  });

  test('two entries of the same name are an error', () => {
    const nav = { name: 'guides', group: null, children: [leaf('warp-drive')] };

    expect(() => navFor(state({ groups: [], nav }, group('warp-drive'), group('guides')))).toThrow(
      /Two navigation entries are named 'guides'/
    );
  });

  test('the co-located pages cannot be collected, or shadowed', () => {
    const nav = { name: 'Home', group: null, children: [leaf('warp-drive')] };

    expect(() => navFor(state({ groups: [], nav }, group('warp-drive')))).toThrow(
      /Two navigation entries are named 'Home'/
    );
  });

  test('two entries differing only in case are an error too', () => {
    // `canonicalGroupName` and `navEntryNamed` both resolve names without
    // regard to case, so these two would be ambiguous at runtime
    const nav = { name: 'Guides', group: null, children: [leaf('warp-drive')] };

    expect(() => navFor(state({ groups: [], nav }, group('warp-drive'), group('guides')))).toThrow(
      /named 'Guides' and 'guides', which differ only in case/
    );
  });

  test('a group cannot be collected by two groups', () => {
    const data = { name: 'data', group: null, children: [leaf('warp-drive')] };
    const schema = { name: 'schema', group: null, children: [leaf('warp-drive')] };

    expect(() =>
      navFor(state({ groups: [], nav: data }, { groups: [], nav: schema }, group('warp-drive')))
    ).toThrow(/'warp-drive' is collected by 'schema' and by 'data'/);
  });
});
