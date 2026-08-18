import { describe, expect, test } from 'vitest';

import { virtualGuard } from './setup.js';

type Guard = { resolveId: (id: string) => unknown };

function guardFor(...groupNames: string[]) {
  return virtualGuard({
    options: {},
    usages: groupNames.map((name) => ({ groups: [{ name, src: `./${name}` }] })),
    isPrimary: true,
  }) as unknown as Guard;
}

function errorFor(id: string, ...groupNames: string[]) {
  try {
    guardFor(...groupNames).resolveId(id);
  } catch (error) {
    return (error as Error).message.replaceAll(process.cwd(), '<cwd>');
  }

  throw new Error(`Expected resolveId('${id}') to throw, but it did not`);
}

describe('virtualGuard', () => {
  test('ignores unrelated ids', () => {
    expect(guardFor('guides').resolveId('kolay')).toBeUndefined();
    expect(guardFor('guides').resolveId('kolay/setup')).toBeUndefined();
    expect(guardFor('guides').resolveId('kolay/api-docs:virtual')).toBeUndefined();
    expect(guardFor('guides').resolveId('virtual:something-else')).toBeUndefined();
  });

  test('leaves declared groups alone (their own usage resolves them)', () => {
    const guard = guardFor('guides', 'demos');

    expect(guard.resolveId('virtual:kolay/docs/guides')).toBeUndefined();
    expect(guard.resolveId('virtual:kolay/docs/demos')).toBeUndefined();
    expect(guard.resolveId('virtual:kolay/docs/Home')).toBeUndefined();
    expect(guard.resolveId('virtual:kolay/search/guides')).toBeUndefined();
    expect(guard.resolveId('virtual:kolay/search/Home')).toBeUndefined();
  });

  test('throws helpfully for undeclared groups', () => {
    expect(errorFor('virtual:kolay/docs/nope', 'guides', 'demos')).toMatchInlineSnapshot(`
      "'virtual:kolay/docs/nope' does not exist, because no docs() usage declares a group named 'nope'. Add docs('nope', { src: ... }) — or docs(<a path or URL ending in 'nope'>) — to your plugins.

      Known virtual imports:
        virtual:kolay/docs/<group> — a group's manifest, pages, meta, and addRoutes
        kolay/setup
      Declared groups: Home, guides, demos"
    `);
  });

  test('throws helpfully for an undeclared group in another namespace', () => {
    expect(errorFor('virtual:kolay/search/nope', 'guides')).toMatchInlineSnapshot(`
      "'virtual:kolay/search/nope' does not exist, because no docs() usage declares a group named 'nope'. Add docs('nope', { src: ... }) — or docs(<a path or URL ending in 'nope'>) — to your plugins.

      Known virtual imports:
        virtual:kolay/docs/<group> — a group's manifest, pages, meta, and addRoutes
        kolay/setup
      Declared groups: Home, guides"
    `);
  });

  test('throws helpfully for an unknown namespace', () => {
    expect(errorFor('virtual:kolay/pages/guides', 'guides')).toMatchInlineSnapshot(`
      "'virtual:kolay/pages/guides' does not exist: kolay provides no 'pages' virtual imports.

      Known virtual imports:
        virtual:kolay/docs/<group> — a group's manifest, pages, meta, and addRoutes
        kolay/setup
      Declared groups: Home, guides"
    `);
  });

  test('suggests the public module when one matches', () => {
    expect(errorFor('virtual:kolay/setup', 'guides')).toMatchInlineSnapshot(`
      "'virtual:kolay/setup' does not exist: kolay provides no 'setup' virtual imports. Did you mean 'kolay/setup'?

      Known virtual imports:
        virtual:kolay/docs/<group> — a group's manifest, pages, meta, and addRoutes
        kolay/setup
      Declared groups: Home, guides"
    `);
  });

  test(`never mentions kolay's internal virtual modules`, () => {
    // they are implementation details — the `kolay/*:virtual` modules
    // setupKolay imports, and the search module a docs module's `search()`
    // loads — so nothing in the messages invites importing them by hand
    const messages = [
      errorFor('virtual:kolay/api-docs', 'guides'),
      errorFor('virtual:kolay/compiled-docs', 'guides'),
      errorFor('virtual:kolay/demos', 'guides'),
      errorFor('virtual:kolay/import-entrypoints', 'guides'),
      errorFor('virtual:kolay/docs/nope', 'guides'),
      errorFor('virtual:kolay/search/nope', 'guides'),
      errorFor('virtual:kolay', 'guides'),
    ];

    for (const message of messages) {
      expect(message).not.toContain(':virtual');
      expect(message).not.toContain('Did you mean');
      // the id the user wrote is echoed, but the list never advertises it
      expect(message).not.toContain('virtual:kolay/search/<group>');
    }

    expect(errorFor('virtual:kolay/api-docs', 'guides')).toMatchInlineSnapshot(`
      "'virtual:kolay/api-docs' does not exist: kolay provides no 'api-docs' virtual imports.

      Known virtual imports:
        virtual:kolay/docs/<group> — a group's manifest, pages, meta, and addRoutes
        kolay/setup
      Declared groups: Home, guides"
    `);
  });

  test('throws helpfully for a bare virtual:kolay import', () => {
    expect(errorFor('virtual:kolay', 'guides')).toMatchInlineSnapshot(`
      "'virtual:kolay' does not exist: every kolay virtual import names a namespace and a group, as in 'virtual:kolay/docs/guides'.

      Known virtual imports:
        virtual:kolay/docs/<group> — a group's manifest, pages, meta, and addRoutes
        kolay/setup
      Declared groups: Home, guides"
    `);
    expect(errorFor('virtual:kolay/', 'guides')).toMatchInlineSnapshot(`
      "'virtual:kolay/' does not exist: every kolay virtual import names a namespace and a group, as in 'virtual:kolay/docs/guides'.

      Known virtual imports:
        virtual:kolay/docs/<group> — a group's manifest, pages, meta, and addRoutes
        kolay/setup
      Declared groups: Home, guides"
    `);
  });

  test('throws helpfully when a namespace names no group', () => {
    expect(errorFor('virtual:kolay/docs', 'guides')).toMatchInlineSnapshot(`
      "'virtual:kolay/docs' does not exist, because it names no group — 'virtual:kolay/docs' imports are per-group, as in 'virtual:kolay/docs/guides'.

      Known virtual imports:
        virtual:kolay/docs/<group> — a group's manifest, pages, meta, and addRoutes
        kolay/setup
      Declared groups: Home, guides"
    `);
  });

  test('ignores the query when checking the group', () => {
    expect(guardFor('guides').resolveId('virtual:kolay/docs/guides?v=1')).toBeUndefined();
    expect(errorFor('virtual:kolay/docs/nope?v=1', 'guides')).toMatchInlineSnapshot(`
      "'virtual:kolay/docs/nope?v=1' does not exist, because no docs() usage declares a group named 'nope'. Add docs('nope', { src: ... }) — or docs(<a path or URL ending in 'nope'>) — to your plugins.

      Known virtual imports:
        virtual:kolay/docs/<group> — a group's manifest, pages, meta, and addRoutes
        kolay/setup
      Declared groups: Home, guides"
    `);
  });
});
