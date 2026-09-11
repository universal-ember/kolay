import { describe, expect, test } from 'vitest';

import { wrapDemos } from './wrap-demos.js';

describe('wrapDemos options', () => {
  test('componentName is required', () => {
    // @ts-expect-error - the missing option is the point
    expect(() => wrapDemos()).toThrow(/requires a componentName/);
    // @ts-expect-error - the missing option is the point
    expect(() => wrapDemos({})).toThrow(/requires a componentName/);
  });

  test('componentName must be a capitalized identifier', () => {
    expect(() => wrapDemos({ componentName: 'shadowed' })).toThrow(/capitalized identifier/);
    expect(() => wrapDemos({ componentName: 'My-Frame' })).toThrow(/capitalized identifier/);

    expect(() => wrapDemos({ componentName: 'Shadowed' })).not.toThrow();
  });

  test('eachDemo.behavior must be always or opt-in', () => {
    expect(() =>
      // @ts-expect-error - the wrong value is the point
      wrapDemos({ componentName: 'Shadowed', eachDemo: { behavior: 'sometimes' } })
    ).toThrow(/'always' or 'opt-in'/);
  });

  test("eachDemo.behavior 'opt-in' requires eachDemo.meta", () => {
    expect(() =>
      wrapDemos({ componentName: 'Shadowed', eachDemo: { behavior: 'opt-in' } })
    ).toThrow(/requires eachDemo\.meta/);

    expect(() =>
      wrapDemos({ componentName: 'Shadowed', eachDemo: { behavior: 'opt-in', meta: 'shadow' } })
    ).not.toThrow();
  });
});
