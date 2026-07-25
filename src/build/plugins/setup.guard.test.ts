import { describe, expect, test } from 'vitest';

import { docsVirtualGuard } from './setup.js';

type Guard = { resolveId: (id: string) => unknown };

function guardFor(...groupNames: string[]) {
  return docsVirtualGuard({
    options: {},
    usages: groupNames.map((name) => ({ groups: [{ name, src: `./${name}` }] })),
    isPrimary: true,
  }) as unknown as Guard;
}

describe('docsVirtualGuard', () => {
  test('ignores unrelated ids', () => {
    expect(guardFor('guides').resolveId('kolay')).toBeUndefined();
    expect(guardFor('guides').resolveId('virtual:something-else')).toBeUndefined();
  });

  test('leaves declared groups alone (their own usage resolves them)', () => {
    const guard = guardFor('guides', 'demos');

    expect(guard.resolveId('virtual:kolay/docs/guides')).toBeUndefined();
    expect(guard.resolveId('virtual:kolay/docs/demos')).toBeUndefined();
    expect(guard.resolveId('virtual:kolay/docs/Home')).toBeUndefined();
  });

  test('throws helpfully for undeclared groups', () => {
    let message = '';

    try {
      guardFor('guides', 'demos').resolveId('virtual:kolay/docs/nope');
    } catch (error) {
      message = (error as Error).message;
    }

    expect(message.replaceAll(process.cwd(), '<cwd>')).toMatchInlineSnapshot(
      `"'virtual:kolay/docs/nope' does not exist, because no docs() usage declares a group named 'nope'. Add docs('nope', { src: ... }) — or docs(<a path or URL ending in 'nope'>) — to your plugins. Declared groups: Home, guides, demos"`
    );
  });
});
