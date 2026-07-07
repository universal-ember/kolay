import { describe, expect, test } from 'vitest';

import { applyRootURL, rebaseAuthoredLinks } from './root-url.js';

describe('applyRootURL', () => {
  test('is a no-op at the default rootURL', () => {
    expect(applyRootURL('/Documentation/sub-folder/lonely-page', '/')).toBe(
      '/Documentation/sub-folder/lonely-page'
    );
  });

  test('prefixes an app-relative path with a custom rootURL', () => {
    expect(applyRootURL('/Documentation/x', '/my-github-project/')).toBe(
      '/my-github-project/Documentation/x'
    );
  });

  test('accepts a rootURL with or without a trailing slash', () => {
    expect(applyRootURL('/x', '/my-github-project/')).toBe('/my-github-project/x');
    expect(applyRootURL('/x', '/my-github-project')).toBe('/my-github-project/x');
  });

  test('maps the app root to the rootURL', () => {
    expect(applyRootURL('/', '/my-github-project/')).toBe('/my-github-project/');
  });

  test('is idempotent — an already-physical path is left alone', () => {
    expect(applyRootURL('/my-github-project/Documentation/x', '/my-github-project/')).toBe(
      '/my-github-project/Documentation/x'
    );
    expect(applyRootURL('/my-github-project', '/my-github-project/')).toBe('/my-github-project');
  });

  test('does not confuse a rootURL-lookalike sibling path', () => {
    expect(applyRootURL('/my-github-project-staging/a', '/my-github-project/')).toBe(
      '/my-github-project/my-github-project-staging/a'
    );
  });

  test('leaves relative, protocol-relative, and absolute urls untouched', () => {
    expect(applyRootURL('./logo.svg', '/my-github-project/')).toBe('./logo.svg');
    expect(applyRootURL('//cdn.example.com/logo.svg', '/my-github-project/')).toBe(
      '//cdn.example.com/logo.svg'
    );
    expect(applyRootURL('https://example.com/a', '/my-github-project/')).toBe(
      'https://example.com/a'
    );
  });
});

/** Minimal mdast-ish node — enough for the plugin to traverse and mutate. */
interface Node {
  type: string;
  url?: unknown;
  value?: string;
  children?: Node[];
}

/** Run the plugin's transformer over a tree in place, returning the tree. */
function rebase(rootURL: string, tree: Node): Node {
  const transformer = rebaseAuthoredLinks(rootURL)();

  transformer?.(tree);

  return tree;
}

describe('rebaseAuthoredLinks', () => {
  test('returns no transformer at the default rootURL (no-op)', () => {
    expect(rebaseAuthoredLinks('/')()).toBeUndefined();
  });

  test('rebases root-absolute link, image, and definition urls onto the rootURL', () => {
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

  test('leaves relative and external urls untouched', () => {
    const tree: Node = {
      type: 'root',
      children: [
        { type: 'image', url: './ember-logo.svg' },
        { type: 'link', url: '//cdn.example.com/logo.svg' },
        { type: 'link', url: 'https://example.com/a' },
      ],
    };

    rebase('/my-github-project/', tree);

    expect(tree.children?.map((n) => n.url)).toEqual([
      './ember-logo.svg',
      '//cdn.example.com/logo.svg',
      'https://example.com/a',
    ]);
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

  test('does not rewrite root-absolute urls inside code nodes', () => {
    const tree: Node = {
      type: 'root',
      children: [{ type: 'code', value: '<a href="/Documentation/a.md">x</a>' }],
    };

    rebase('/my-github-project/', tree);

    expect(tree.children?.[0]?.value).toBe('<a href="/Documentation/a.md">x</a>');
  });
});
