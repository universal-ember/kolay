import { describe, expect, test } from 'vitest';

import { rebaseAuthoredLinks } from './rebase-links.js';

/** Minimal mdast-ish node — enough for the plugin to traverse and mutate. */
interface Node {
  type: string;
  url?: unknown;
  value?: string;
  children?: Node[];
}

/** Run the plugin's transformer over a tree in place, returning the tree. */
function rebase(prefix: string, tree: Node): Node {
  const transformer = rebaseAuthoredLinks(prefix)();

  transformer?.(tree);

  return tree;
}

describe('rebaseAuthoredLinks', () => {
  test('returns no transformer at the default prefix (no-op)', () => {
    expect(rebaseAuthoredLinks('/')()).toBeUndefined();
  });

  test('rebases root-absolute link, image, and definition urls onto the prefix', () => {
    const tree: Node = {
      type: 'root',
      children: [
        { type: 'link', url: '/Documentation/sub-folder/lonely-page.md' },
        { type: 'image', url: '/Documentation/sub-folder/ember-tomster.svg' },
        { type: 'definition', url: '/Documentation/ref' },
      ],
    };

    rebase('/my-github-project/', tree);

    expect(tree.children?.map((n) => n.url)).toEqual([
      '/my-github-project/Documentation/sub-folder/lonely-page.md',
      '/my-github-project/Documentation/sub-folder/ember-tomster.svg',
      '/my-github-project/Documentation/ref',
    ]);
  });

  test('rebases nodes nested below the root, not just direct children', () => {
    const tree: Node = {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [{ type: 'link', url: '/Documentation/a.md' }],
        },
      ],
    };

    rebase('/my-github-project/', tree);

    expect(tree.children?.[0]?.children?.[0]?.url).toBe('/my-github-project/Documentation/a.md');
  });

  test('accepts a prefix with or without a trailing slash', () => {
    const withSlash = rebase('/my-github-project/', {
      type: 'root',
      children: [{ type: 'link', url: '/Documentation/a.md' }],
    });
    const withoutSlash = rebase('/my-github-project', {
      type: 'root',
      children: [{ type: 'link', url: '/Documentation/a.md' }],
    });

    expect(withSlash.children?.[0]?.url).toBe('/my-github-project/Documentation/a.md');
    expect(withoutSlash.children?.[0]?.url).toBe('/my-github-project/Documentation/a.md');
  });

  test('leaves relative urls untouched', () => {
    const tree = rebase('/my-github-project/', {
      type: 'root',
      children: [{ type: 'image', url: './ember-logo.svg' }],
    });

    expect(tree.children?.[0]?.url).toBe('./ember-logo.svg');
  });

  test('leaves protocol-relative urls untouched', () => {
    const tree = rebase('/my-github-project/', {
      type: 'root',
      children: [{ type: 'link', url: '//cdn.example.com/logo.svg' }],
    });

    expect(tree.children?.[0]?.url).toBe('//cdn.example.com/logo.svg');
  });

  test('leaves absolute external urls untouched', () => {
    const tree = rebase('/my-github-project/', {
      type: 'root',
      children: [{ type: 'link', url: 'https://example.com/a' }],
    });

    expect(tree.children?.[0]?.url).toBe('https://example.com/a');
  });

  test('is idempotent — already-prefixed urls are left alone', () => {
    const tree = rebase('/my-github-project/', {
      type: 'root',
      children: [
        { type: 'link', url: '/my-github-project/Documentation/a.md' },
        // the bare prefix itself
        { type: 'link', url: '/my-github-project' },
      ],
    });

    expect(tree.children?.map((n) => n.url)).toEqual([
      '/my-github-project/Documentation/a.md',
      '/my-github-project',
    ]);
  });

  test('does not confuse a prefix-lookalike sibling path', () => {
    // not under the base, so it must still be rebased
    const tree = rebase('/my-github-project/', {
      type: 'root',
      children: [{ type: 'link', url: '/my-github-project-staging/a.md' }],
    });

    expect(tree.children?.[0]?.url).toBe('/my-github-project/my-github-project-staging/a.md');
  });

  test('ignores nodes whose url is missing or not a string', () => {
    const tree: Node = {
      type: 'root',
      children: [{ type: 'link' }, { type: 'image', url: 42 }],
    };

    rebase('/my-github-project/', tree);

    expect(tree.children?.[0]?.url).toBeUndefined();
    expect(tree.children?.[1]?.url).toBe(42);
  });

  test('accepts a getter prefix, resolved at transform time', () => {
    // the build-time plugin only learns the base after its compiler exists
    let prefix = '/';
    const transformer = rebaseAuthoredLinks(() => prefix)();
    const tree: Node = {
      type: 'root',
      children: [{ type: 'link', url: '/Documentation/a.md' }],
    };

    transformer?.(tree);
    expect(tree.children?.[0]?.url).toBe('/Documentation/a.md');

    prefix = '/my-github-project/';
    transformer?.(tree);
    expect(tree.children?.[0]?.url).toBe('/my-github-project/Documentation/a.md');
  });

  test('rebases root-absolute href/src attributes in raw html nodes', () => {
    const tree: Node = {
      type: 'root',
      children: [
        {
          type: 'html',
          value:
            '<img src="/Documentation/a.svg" width="40"> ' +
            "<a href='/Documentation/b.md'>b</a> " +
            '<a href="/my-github-project/already.md">idempotent</a> ' +
            '<img src="//cdn.example.com/x.svg"> ' +
            '<a href="https://example.com/a">external</a>',
        },
      ],
    };

    rebase('/my-github-project/', tree);

    expect(tree.children?.[0]?.value).toBe(
      '<img src="/my-github-project/Documentation/a.svg" width="40"> ' +
        "<a href='/my-github-project/Documentation/b.md'>b</a> " +
        '<a href="/my-github-project/already.md">idempotent</a> ' +
        '<img src="//cdn.example.com/x.svg"> ' +
        '<a href="https://example.com/a">external</a>'
    );
  });

  test('does not rewrite root-absolute urls inside code nodes', () => {
    const tree: Node = {
      type: 'root',
      children: [{ type: 'code', value: '<a href="/Documentation/a.md">x</a>' }],
    };

    rebase('/my-github-project/', tree);

    expect(tree.children?.[0]?.value).toBe('<a href="/Documentation/a.md">x</a>');
  });
});
