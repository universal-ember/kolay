import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { demos, demoSpecifiers, parseDemosArgs } from './demos.js';

const here = dirname(fileURLToPath(import.meta.url));
const demosFixture = join(here, 'fixtures', 'demos');

describe('parseDemosArgs', () => {
  it('accepts a path and a specifier', () => {
    expect(parseDemosArgs(here, { as: '#demos/foo' })).toEqual({
      src: here,
      alias: '#demos/foo',
    });
  });

  it('accepts a file URL (import.meta.resolve style)', () => {
    expect(parseDemosArgs(`file://${here}`, { as: '#demos/foo' })).toEqual({
      src: here,
      alias: '#demos/foo',
    });
  });

  it('uses any valid import URI verbatim', () => {
    expect(parseDemosArgs(here, { as: 'demo-kit' }).alias).toBe('demo-kit');
    expect(parseDemosArgs(here, { as: '@scope/demos' }).alias).toBe('@scope/demos');
  });

  it.each([
    [undefined, undefined, /requires a path/],
    [here, undefined, /requires an `as` option/],
    [here, { as: '' }, /requires an `as` option/],
    [here, { as: './demos' }, /valid import URI/],
    [here, { as: '/demos' }, /valid import URI/],
    [here, { as: 'demos/' }, /valid import URI/],
    [here, { as: 'demos foo' }, /valid import URI/],
    [join(here, 'does-not-exist'), { as: '#demos/foo' }, /path does not exist/],
  ])('rejects %s / %o', (src, options, message) => {
    // @ts-expect-error deliberately wrong shapes
    expect(() => parseDemosArgs(src, options)).toThrow(message);
  });
});

describe('demoSpecifiers', () => {
  it('maps each file, and lets index files provide their directory', () => {
    const map = demoSpecifiers('#demos/foo', '/abs', [
      'button.gjs',
      'index.gjs',
      'forms/input.gts',
      'forms/index.gjs',
    ]);

    expect(map).toEqual({
      '#demos/foo/button': '/abs/button.gjs',
      '#demos/foo/index': '/abs/index.gjs',
      '#demos/foo': '/abs/index.gjs',
      '#demos/foo/forms/input': '/abs/forms/input.gts',
      '#demos/foo/forms/index': '/abs/forms/index.gjs',
      '#demos/foo/forms': '/abs/forms/index.gjs',
    });
  });
});

type DemosPlugin = {
  resolveId: (id: string) => unknown;
  load: (id: string) => Promise<string | undefined>;
  vite: { configResolved: (config: unknown) => Promise<void> };
};

/**
 * The plugin as vite sees it: every usage's `configResolved` has run
 * against a config containing all of them (that's how usages find each
 * other), so `resolveId` knows the alias' specifiers.
 */
async function pluginsFor(...usages: Array<{ src?: string; as: string }>) {
  const states = usages.map((usage) => {
    const options = parseDemosArgs(usage.src ?? demosFixture, { as: usage.as });

    return { options, usages: [options], isPrimary: true };
  });

  const plugins = states.map((state) => demos(state) as unknown as DemosPlugin);
  const config = {
    plugins: states.map((state) => ({ name: 'kolay:demos', api: { kolay: state } })),
    server: {},
  };

  await Promise.all(plugins.map((plugin) => plugin.vite.configResolved(config)));

  return plugins;
}

async function pluginFor(as: string) {
  const [plugin] = await pluginsFor({ as });

  return plugin as DemosPlugin;
}

describe('demos() `as`', () => {
  it('resolves every specifier the alias provides', async () => {
    const plugin = await pluginFor('#demos/foo');

    expect(plugin.resolveId('#demos/foo/button')).toBe(join(demosFixture, 'button.gjs'));
    expect(plugin.resolveId('#demos/foo/forms/input')).toBe(
      join(demosFixture, 'forms', 'input.gts')
    );
    // index files also provide their directory — the alias root, and nested
    expect(plugin.resolveId('#demos/foo')).toBe(join(demosFixture, 'index.gjs'));
    expect(plugin.resolveId('#demos/foo/forms')).toBe(join(demosFixture, 'forms', 'index.gjs'));
  });

  it('is used verbatim, whatever shape it has', async () => {
    for (const as of ['#demos/foo', '#foo', 'demo-kit', '@scope/demos']) {
      const plugin = await pluginFor(as);

      expect(plugin.resolveId(`${as}/button`)).toBe(join(demosFixture, 'button.gjs'));
      expect(plugin.resolveId(as)).toBe(join(demosFixture, 'index.gjs'));
    }
  });

  it('claims only ids under the alias', async () => {
    const plugin = await pluginFor('#demos/foo');

    expect(plugin.resolveId('#demos/other/button')).toBeUndefined();
    expect(plugin.resolveId('ember-source/button')).toBeUndefined();
    // a longer alias that merely starts the same is not ours
    expect(plugin.resolveId('#demos/foobar')).toBeUndefined();
    expect(plugin.resolveId('#demos/foobar/button')).toBeUndefined();
  });

  it('throws helpfully for an id under the alias that does not exist', async () => {
    const plugin = await pluginFor('#demos/foo');

    let message = '';

    try {
      plugin.resolveId('#demos/foo/nope');
    } catch (error) {
      message = (error as Error).message.replaceAll(demosFixture, '<fixture>');
    }

    expect(message).toMatchInlineSnapshot(
      `"'#demos/foo/nope' does not exist in the demos() source '<fixture>'. Available: #demos/foo/button, #demos/foo/forms/index, #demos/foo/forms, #demos/foo/forms/input, #demos/foo/index, #demos/foo"`
    );
  });

  it('teaches the runtime map every alias, from every usage', async () => {
    const [primary] = await pluginsFor({ as: '#demos/foo' }, { as: '#demos/bar' });

    const map = (await (primary as DemosPlugin).load('\0kolay/demos:virtual')) ?? '';

    expect(map.replaceAll(demosFixture, '<fixture>')).toMatchInlineSnapshot(`
      "export const modules = {
                "#demos/foo/button": () => import("/@fs<fixture>/button.gjs"),
      "#demos/foo/forms/index": () => import("/@fs<fixture>/forms/index.gjs"),
      "#demos/foo/forms": () => import("/@fs<fixture>/forms/index.gjs"),
      "#demos/foo/forms/input": () => import("/@fs<fixture>/forms/input.gts"),
      "#demos/foo/index": () => import("/@fs<fixture>/index.gjs"),
      "#demos/foo": () => import("/@fs<fixture>/index.gjs"),
      "#demos/bar/button": () => import("/@fs<fixture>/button.gjs"),
      "#demos/bar/forms/index": () => import("/@fs<fixture>/forms/index.gjs"),
      "#demos/bar/forms": () => import("/@fs<fixture>/forms/index.gjs"),
      "#demos/bar/forms/input": () => import("/@fs<fixture>/forms/input.gts"),
      "#demos/bar/index": () => import("/@fs<fixture>/index.gjs"),
      "#demos/bar": () => import("/@fs<fixture>/index.gjs")
              };"
    `);
  });

  it('only the primary usage serves the runtime map', async () => {
    const [, second] = await pluginsFor({ as: '#demos/foo' }, { as: '#demos/bar' });

    expect((second as DemosPlugin).resolveId('kolay/demos:virtual')).toBeUndefined();
    expect(await (second as DemosPlugin).load('\0kolay/demos:virtual')).toBeUndefined();
  });

  it('rejects two usages sharing an `as`', async () => {
    await expect(pluginsFor({ as: '#demos/foo' }, { as: '#demos/foo' })).rejects.toThrow(
      /Every demos\(\) usage needs its own `as`. Duplicated: #demos\/foo/
    );
  });
});
