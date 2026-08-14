import { describe, expect, test } from 'vitest';

import { registerScopedRoute, scopedRouteNameFor } from './scoped-routes.js';

describe('scopedRouteNameFor', () => {
  test('a top-level mount: ember reports the map root as parent "application"', () => {
    expect(scopedRouteNameFor('application')).toBe('page');
  });

  test("a nested mount uses the surrounding route's full name", () => {
    expect(scopedRouteNameFor('help')).toBe('help.page');
    expect(scopedRouteNameFor('help.nested')).toBe('help.nested.page');
  });

  test('no parent at all behaves like the root', () => {
    expect(scopedRouteNameFor(null)).toBe('page');
    expect(scopedRouteNameFor(undefined)).toBe('page');
  });
});

describe('registerScopedRoute', () => {
  test('two groups cannot mount in the same route', () => {
    registerScopedRoute('shared.page', 'guides');

    expect(() => registerScopedRoute('shared.page', 'demos')).toThrow(
      /The 'shared.page' route already mounts the 'guides' group/
    );
  });

  test('registering the same group again is fine', () => {
    registerScopedRoute('repeat.page', 'guides');

    expect(() => registerScopedRoute('repeat.page', 'guides')).not.toThrow();
  });
});
