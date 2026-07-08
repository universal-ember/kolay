import { describe, expect, test } from 'vitest';

import { stripRootURL } from './strip-root-url.js';

describe('stripRootURL', () => {
  test('is a no-op at the default rootURL', () => {
    expect(stripRootURL('/Documentation/sub-folder/lonely-page', '/')).toBe(
      '/Documentation/sub-folder/lonely-page'
    );
  });

  test('strips a custom rootURL prefix, yielding an app-relative path', () => {
    expect(stripRootURL('/my-github-project/Documentation/x', '/my-github-project/')).toBe(
      '/Documentation/x'
    );
  });

  test('maps the rootURL itself to the app root', () => {
    expect(stripRootURL('/my-github-project/', '/my-github-project/')).toBe('/');
  });

  test('leaves a path that does not start with the rootURL untouched', () => {
    expect(stripRootURL('/other/Documentation/x', '/my-github-project/')).toBe(
      '/other/Documentation/x'
    );
  });

  test('is anchored to the start — a mid-string occurrence is not stripped', () => {
    expect(stripRootURL('/leading/my-github-project/x', '/my-github-project/')).toBe(
      '/leading/my-github-project/x'
    );
  });

  test('accepts a rootURL without a trailing slash', () => {
    expect(stripRootURL('/my-github-project/Documentation/x', '/my-github-project')).toBe(
      '/Documentation/x'
    );
  });

  test('maps the rootURL itself to the app root, with any slash pairing', () => {
    expect(stripRootURL('/my-github-project', '/my-github-project/')).toBe('/');
    expect(stripRootURL('/my-github-project', '/my-github-project')).toBe('/');
    expect(stripRootURL('/my-github-project/', '/my-github-project')).toBe('/');
  });

  test('does not strip a lookalike sibling prefix, even without a trailing slash', () => {
    expect(stripRootURL('/my-github-project-staging/x', '/my-github-project')).toBe(
      '/my-github-project-staging/x'
    );
    expect(stripRootURL('/my-github-project-staging/x', '/my-github-project/')).toBe(
      '/my-github-project-staging/x'
    );
  });

  test('passes null through at a custom rootURL', () => {
    expect(stripRootURL(null, '/my-github-project/')).toBe(null);
  });

  test('passes null through at the default rootURL', () => {
    expect(stripRootURL(null, '/')).toBe(null);
  });
});
