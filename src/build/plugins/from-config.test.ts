import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { pluginsFromConfig } from './from-config.js';

const configDir = '/some/project';
// demos() checks its path exists at construction, so use a real one
const here = dirname(fileURLToPath(import.meta.url));

interface PluginLike {
  name: string;
  api?: { kolay?: { options: Record<string, unknown> } };
}

function flatten(plugins: unknown[]): PluginLike[] {
  return plugins.flat(Infinity) as PluginLike[];
}

function names(plugins: unknown[]): string[] {
  return [...new Set(flatten(plugins).map((plugin) => plugin.name))];
}

function docsState(plugins: unknown[]) {
  return flatten(plugins).flatMap((plugin) => plugin.api?.kolay ?? []);
}

describe('pluginsFromConfig', () => {
  it('an empty config still yields one docs usage (co-located pages, virtual modules)', () => {
    const plugins = pluginsFromConfig({ redirects: [] }, configDir);

    expect(names(plugins)).toContain('kolay:setup');
    expect(docsState(plugins)).toHaveLength(1);
  });

  it('generates one docs usage per entry, resolving src from the config dir', () => {
    const plugins = pluginsFromConfig(
      {
        redirects: [],
        docs: [{ name: 'Runtime', src: '../docs' }, './guides'],
      },
      configDir
    );

    const [runtime, guides] = docsState(plugins).map(
      (state) => state.options as { groups: { name: string; src: string }[] }
    );

    expect(runtime?.groups).toEqual([{ name: 'Runtime', src: join('/some', 'docs') }]);
    expect(guides?.groups).toEqual([{ name: 'guides', src: join(configDir, 'guides') }]);
  });

  it('shares markdownOptions with every docs entry; the entry wins on conflict', () => {
    const remark = () => {};
    const override = () => {};

    const plugins = pluginsFromConfig(
      {
        redirects: [],
        markdownOptions: { scope: `import { X } from 'x';`, remarkPlugins: [remark] },
        docs: [
          { name: 'A', src: '/abs/a' },
          { name: 'B', src: '/abs/b', remarkPlugins: [override] },
        ],
      },
      configDir
    );

    const [a, b] = docsState(plugins).map((state) => state.options);

    expect(a?.scope).toBe(`import { X } from 'x';`);
    expect(a?.remarkPlugins).toEqual([remark]);
    expect(b?.scope).toBe(`import { X } from 'x';`);
    expect(b?.remarkPlugins).toEqual([override]);
  });

  it('generates apiDocs, demos, and importEntrypoints only when configured', () => {
    const bare = pluginsFromConfig({ redirects: [] }, configDir);

    expect(names(bare)).not.toContain('kolay:apidocs');
    expect(names(bare)).not.toContain('kolay:demos');
    expect(names(bare)).not.toContain('kolay:import-entrypoints');

    const full = pluginsFromConfig(
      {
        redirects: [],
        apiDocs: ['kolay'],
        demos: [{ src: join(here, 'fixtures'), as: '#demos/site' }],
        importEntrypoints: ['ember-primitives'],
      },
      configDir
    );

    expect(names(full)).toContain('kolay:apidocs');
    expect(names(full)).toContain('kolay:demos');
    expect(names(full)).toContain('kolay:import-entrypoints');
  });
});
