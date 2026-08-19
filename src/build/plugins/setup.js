/**
 * This plugin is *basically* what v1 addons did.
 */
import { existsSync } from 'node:fs';
import { glob, readFile } from 'node:fs/promises';
import { join, relative } from 'node:path';

import { stripIndent } from 'common-tags';
import send from 'send';

import { virtualFile } from './helpers.js';
import { loadKolayConfig } from './kolay-config.js';
import { extractFrontmatter } from './markdown-pages/frontmatter.js';
import { reshape } from './markdown-pages/hydrate.js';
import { readJSONC } from './markdown-pages/parse.js';
import { sourceMeta } from './source-meta.js';
import { normalizePath } from './utils.js';

/**
 * All groups contributed by every `docs()` usage in the config,
 * in plugin order.
 */
function allGroups(state) {
  return state.usages.flatMap((usage) => usage.groups ?? []);
}

function assertUniqueGroupNames(groups) {
  const seen = new Set();
  const duplicates = new Set();

  for (const group of groups) {
    (seen.has(group.name) ? duplicates : seen).add(group.name);
  }

  if (duplicates.size > 0) {
    throw new Error(
      `Group names must be unique across every usage of the docs() plugin. ` +
        `Duplicate group name(s): ${[...duplicates].join(', ')}`
    );
  }
}

/**
 * Single source of truth for which co-located files count as assets — the
 * dev middleware and the build emission must agree, or an asset would work
 * in dev and 404 in production (or vice versa). Case-insensitive in both:
 * node's glob only ignores case on macOS/Windows, so an extension-cased
 * `LOGO.SVG` would otherwise be served in dev everywhere but dropped from
 * Linux builds.
 */
const ASSET_EXTENSIONS = ['svg', 'png', 'jpg', 'jpeg', 'gif', 'webp', 'avif'];
const ASSET_EXT = new RegExp(`\\.(${ASSET_EXTENSIONS.join('|')})$`, 'i');
// Each extension expands to character classes (svg → [sS][vV][gG]) so the
// glob itself matches case-insensitively on every platform.
const ASSET_GLOB = `**/*.{${ASSET_EXTENSIONS.map((ext) =>
  ext.replaceAll(/[a-z]/g, (c) => `[${c}${c.toUpperCase()}]`)
).join(',')}}`;

/**
 * Possible future direction — reference-driven emission: collect asset URLs
 * while parsing markdown (the rebaseAuthoredLinks visitor already walks
 * exactly the right mdast nodes) and emit only what is referenced, instead
 * of eagerly globbing every asset-extension file. Deliberately not done for
 * now:
 * - plain `.md` is never parsed at build time (kolay defers that to the
 *   browser), so it would only be practical for `.gjs.md`, whose build-time
 *   mdast we already have — start there if we ever do this
 * - reference scanning cannot see dynamic references (component args,
 *   srcset, css url(), app code) — dev serving is request-driven and would
 *   keep working, so those would 404 only in production
 * - the eager glob is one readdir walk per root; reference-driven still
 *   reads every *referenced* asset, so it only saves work for unreferenced
 *   ones. Its real value would be smaller dists and build-time warnings for
 *   broken references, not less FS traffic.
 */

/**
 * Directories whose non-markdown assets are served/emitted at their
 * manifest-space URLs (`<base><groupName>/<relative path>`). The unnamed
 * entries are the co-located pages roots, whose page URLs drop that prefix.
 */
function assetRoots(state, cwd) {
  return [
    { name: '', dir: join(cwd, 'app', 'templates') },
    { name: '', dir: join(cwd, 'src', 'templates') },
    ...allGroups(state).map((group) => ({
      name: group.name,
      dir: normalizePath(group.src),
    })),
  ];
}

function removeTemplatesPrefix(path) {
  return path.replace(/^(app|src)\/templates\//, '');
}

/**
 * Enumerate one docs source: the page-loader entries (URL → dynamic
 * import) and the source's manifest ({ name, list, tree }).
 *
 * @param {object} source
 * @param {string} source.displayName - the group's display name ('Home' for the co-located root)
 * @param {string} source.urlPrefix - the URL prefix pages live under ('' for the co-located root)
 * @param {string} source.sourceCwd - where the files live on disk
 * @param {AsyncIterable<string>} source.entries - the source's files, relative to sourceCwd
 * @param {(entry: string) => string} source.strip - entry → page path (strips the app/src templates prefix for the co-located root)
 * @param {string} baseUrl
 * @param {{ populateManifestEntry?: import('./markdown-pages/frontmatter.js').PopulateManifestEntry }} [options]
 */
async function enumerateSource(
  { displayName, urlPrefix, sourceCwd, entries, strip },
  baseUrl,
  { populateManifestEntry } = {}
) {
  const loaders = {};
  const paths = [];
  const configs = [];
  const frontmatter = [];
  const sources = new Map();

  for await (const entry of entries) {
    if (entry.endsWith('.json') || entry.endsWith('.jsonc')) {
      configs.push({
        path: strip(entry),
        config: await readJSONC(join(sourceCwd, entry)),
        cwd: sourceCwd,
      });
      // Also part of `paths`: per-page configs (`<page>.json`, e.g. for
      // `title`) are discovered from the path list during parsing —
      // `configs` only drives ordering.
      paths.push(strip(entry));
      continue;
    }

    const name =
      baseUrl + (urlPrefix ? urlPrefix + '/' : '') + strip(entry).replace(/\.(gjs|gts)\.md$/, '');
    const full = '/@fs' + join(normalizePath(sourceCwd), entry);

    let query = '';

    if (entry.endsWith('.md')) {
      const source = (await readFile(join(sourceCwd, entry))).toString();
      const { data, content } = extractFrontmatter(source, join(sourceCwd, entry));

      if (data && Object.keys(data).length > 0) {
        frontmatter.push({ path: strip(entry), data });
      }

      if (!entry.endsWith('.gjs.md') && !entry.endsWith('.gts.md')) {
        // Compiled files already remove frontmatter; sources does not need to be reset
        query = '?raw';
      } else {
        // the frontmatter-stripped content, so search headings/text below
        // stay clean
        sources.set(name, { source: content });
      }
    }

    loaders[name] = `() => import("${full}${query}")`;
    paths.push(strip(entry));
  }

  const found = await reshape({
    cwd: sourceCwd,
    paths,
    configs,
    frontmatter,
    populateManifestEntry,
    prefix: join('/', urlPrefix),
    base: baseUrl,
  });

  const search = found.list.flatMap((page) => {
    const source = sources.get(page.path) ?? sources.get(`${page.path}.md`);

    if (!source) {
      if (page.href) return [];

      // No inline source (a plain `.md` page): the runtime loads the text on
      // demand. Deliberately no URL to load it from — this manifest is built
      // against `config.base`, and the app it ends up in may be served under
      // a different rootURL, so that URL is the runtime's to build.
      return [
        {
          path: page.path,
          appRelativePath: page.appRelativePath,
          groupName: displayName,
          title: page.title ?? page.cleanedName,
          headings: [],
          text: '',
        },
      ];
    }

    // headings are shown as-is (a page's title is usually its first one),
    // so the source's inline syntax is stripped: emphasis and code marks,
    // and the `[^label]` a footnote reference leaves behind
    const headings = [...source.source.matchAll(/^#{1,6}\s+(.+?)\s*#*\s*$/gm)].map(([, heading]) =>
      heading
        .replaceAll(/\[\^[^\]]+\]/g, '')
        .replaceAll(/[`*_]/g, '')
        .trim()
    );

    return [
      {
        path: page.path,
        appRelativePath: page.appRelativePath,
        groupName: displayName,
        title: page.title ?? headings[0] ?? page.cleanedName,
        headings,
        text: source.source,
      },
    ];
  });

  return {
    manifestGroup: { name: displayName, ...found },
    loaders,
    search,
  };
}

/**
 * The co-located pages (app/templates, src/templates) — the 'Home' group.
 */
function homeSource(cwd) {
  return {
    displayName: 'Home',
    urlPrefix: '',
    sourceCwd: cwd,
    entries: glob('./{app,src}/templates/**/*.{md,gjs.md,gts.md,json,jsonc}', {
      cwd,
      exclude: ['node_modules'],
    }),
    strip: removeTemplatesPrefix,
  };
}

/**
 * Where the Home source's own files live — its meta.jsonc (and the
 * repo-relative docsPath) belong to the templates directory, not the
 * app root.
 */
function homeMetaCwd(cwd) {
  for (const candidate of ['src/templates', 'app/templates']) {
    const dir = join(cwd, candidate);

    if (existsSync(dir)) return dir;
  }

  return cwd;
}

function groupSource(group) {
  return {
    displayName: group.name,
    urlPrefix: group.name,
    sourceCwd: normalizePath(group.src),
    entries: glob('**/*.{md,gjs.md,gts.md,json,jsonc}', {
      cwd: normalizePath(group.src),
      exclude: ['node_modules'],
    }),
    strip: (entry) => entry,
  };
}

const VIRTUAL_PREFIX = 'virtual:kolay/';
const DOCS_MODULE_PREFIX = `${VIRTUAL_PREFIX}docs/`;
const SEARCH_MODULE_PREFIX = `${VIRTUAL_PREFIX}search/`;

/**
 * Every namespace under `virtual:kolay/`. Each one is per-group: the
 * module id is `virtual:kolay/<namespace>/<groupName>`.
 *
 * `hidden` namespaces still resolve — they're just left out of the
 * known-imports list, because they're loaded for you (`search` is what a
 * docs module's `search()` export imports) rather than imported by hand.
 */
const GROUP_NAMESPACES = [
  { name: 'docs', describe: `a group's manifest, pages, meta, and addRoutes` },
  { name: 'search', hidden: true },
];

/**
 * The virtual modules users are meant to import that live outside the
 * `virtual:kolay/` namespace — a typo'd `virtual:kolay/setup` should point
 * at 'kolay/setup' rather than at the list of per-group modules.
 *
 * The `kolay/*:virtual` modules setupKolay imports (compiled-docs,
 * api-docs, demos, import-entrypoints) are deliberately absent: they're
 * implementation details of setupKolay, so neither the suggestions nor the
 * known-imports list should invite anyone to import them.
 */
const PUBLIC_MODULES = ['kolay/setup'];

function docsModuleId(groupName) {
  return `${DOCS_MODULE_PREFIX}${groupName}`;
}

/**
 * The known-imports blurb every guard error ends with — everything the
 * *current config* makes importable, so a wrong import can be compared
 * against the real list.
 *
 * @param {{ groups: string[], demoAliases: string[] }} available
 */
function knownImports({ groups, demoAliases }) {
  const lines = [
    ...GROUP_NAMESPACES.filter(({ hidden }) => !hidden).map(
      ({ name, describe }) => `  virtual:kolay/${name}/<group> — ${describe}`
    ),
    ...PUBLIC_MODULES.map((module) => `  ${module}`),
    // `demos(src, { as: '#demos/foo' })` makes '#demos/foo/<demo>'
    // importable from codefences — configured, so only listed when present
    ...demoAliases.map((alias) => `  ${alias}/<demo> — a demo from a demos() source`),
  ];

  return `Known virtual imports:\n${lines.join('\n')}\n` + `Declared groups: ${groups.join(', ')}`;
}

/**
 * A guard error: what went wrong (and how to fix it), then the list of
 * what kolay does provide.
 *
 * @param {string} explanation
 * @param {{ groups: string[], demoAliases: string[] }} available
 */
function guardError(explanation, available) {
  return new Error(`${explanation}\n\n${knownImports(available)}`);
}

/**
 * When an import under `virtual:kolay/` isn't one kolay provides — an
 * unknown namespace, or a group no docs() usage declares — fail with an
 * actionable error instead of the bundler's generic "failed to resolve
 * import".
 *
 * (Runs after this usage's own modules have had their chance to resolve;
 *  known groups from other usages are left alone so their instances can
 *  resolve them.)
 *
 * @type {(state: { options: object, usages: object[], isPrimary: boolean }) => import('unplugin').UnpluginOptions}
 */
export function virtualGuard(state) {
  /**
   * The specifiers demos() usages make importable. Discovered from the
   * config, so the error lists what this project actually has — empty
   * under bundlers where vite's configResolved doesn't run, which only
   * costs the list a line.
   *
   * @type {string[]}
   */
  let demoAliases = [];

  return {
    name: 'kolay:virtual-guard',
    vite: {
      configResolved(resolvedConfig) {
        demoAliases = resolvedConfig.plugins
          .filter((plugin) => plugin.name === 'kolay:demos')
          .map((plugin) => plugin.api?.kolay?.options?.alias)
          .filter(Boolean);
      },
    },
    resolveId(id) {
      const [withoutQuery = ''] = id.split('?');

      // `virtual:kolay` itself is caught too — it isn't a module either
      if (withoutQuery !== VIRTUAL_PREFIX.slice(0, -1) && !withoutQuery.startsWith(VIRTUAL_PREFIX))
        return;

      const subPath = withoutQuery.slice(VIRTUAL_PREFIX.length);
      const slash = subPath.indexOf('/');
      const namespace = slash === -1 ? subPath : subPath.slice(0, slash);
      const groupName = slash === -1 ? '' : subPath.slice(slash + 1);
      const groups = ['Home', ...allGroups(state).map((group) => group.name)];
      const available = { groups, demoAliases };

      if (!namespace) {
        throw guardError(
          `'${id}' does not exist: every kolay virtual import names a namespace ` +
            `and a group, as in 'virtual:kolay/docs/${groups[1] ?? 'Home'}'.`,
          available
        );
      }

      if (!GROUP_NAMESPACES.some((candidate) => candidate.name === namespace)) {
        // `virtual:kolay/setup` for 'kolay/setup'
        const suggestion = PUBLIC_MODULES.find((candidate) => candidate === `kolay/${subPath}`);

        throw guardError(
          `'${id}' does not exist: kolay provides no '${namespace}' virtual imports.` +
            (suggestion ? ` Did you mean '${suggestion}'?` : ''),
          available
        );
      }

      if (!groupName) {
        throw guardError(
          `'${id}' does not exist, because it names no group — ` +
            `'virtual:kolay/${namespace}' imports are per-group, as in ` +
            `'virtual:kolay/${namespace}/${groups[1] ?? 'Home'}'.`,
          available
        );
      }

      if (groups.includes(groupName)) return;

      throw guardError(
        `'${id}' does not exist, because no docs() usage declares a group named '${groupName}'. ` +
          `Add docs('${groupName}', { src: ... }) — or docs(<a path or URL ending in '${groupName}'>) — ` +
          `to your plugins.`,
        available
      );
    },
  };
}

/**
 * The source of a `virtual:kolay/docs/<groupName>` module:
 * the group's manifest, its page loaders, its meta, and an `addRoutes`
 * scoped to it.
 */
function groupModuleContent({ manifestGroup, loaders, meta, searchModuleId }, { scopedTo } = {}) {
  return stripIndent`
    import { addRoutes as _addRoutes } from 'kolay';

    export const name = ${JSON.stringify(manifestGroup.name)};

    export const manifest = ${JSON.stringify(manifestGroup)};

    export const meta = ${JSON.stringify(meta ?? {})};

    export const search = () => import(${JSON.stringify(searchModuleId)}).then((mod) => mod.default);

    export const pages = {
      ${Object.entries(loaders)
        .map(([name, importer]) => `"${name}": ${importer}`)
        .join(',\n')}
    };

    export function addRoutes(context) {
      return _addRoutes(context${scopedTo ? `, ${JSON.stringify(scopedTo)}` : ''});
    }
  `;
}

/** @type {(state: { options: object, usages: object[], isPrimary: boolean }) => import('unplugin').UnpluginOptions} */
export const setup = (state) => {
  const cwd = process.cwd();
  let baseUrl = '/';
  let isBuild = false;
  /**
   * Whether an apiDocs() plugin is present in the config — when it isn't,
   * this plugin serves an empty 'kolay/api-docs:virtual' so that
   * 'kolay/setup' can always import it. Set accurately during vite's
   * configResolved; the default keeps the fallback dormant so it can
   * never shadow a real apiDocs().
   */
  let hasApiDocs = true;

  /**
   * Same idea for demos(): when absent, an empty 'kolay/demos:virtual'
   * keeps the generated setupKolay's import working.
   */
  let hasDemos = true;

  /**
   * And for importEntrypoints().
   */
  let hasImportEntrypoints = true;

  /**
   * The project's kolay config file (`kolay.config.js` and friends, via
   * lilconfig) — the whole config, since it will grow more keys over
   * time. Cross-cutting, like `base`, so its data rides the
   * metamanifest.
   */
  let kolayConfig = { redirects: [] };

  return {
    name: 'kolay:setup',
    vite: {
      api: { kolay: state },
      async configResolved(resolvedConfig) {
        baseUrl = resolvedConfig.base;
        isBuild = resolvedConfig.command === 'build';
        hasApiDocs = resolvedConfig.plugins.some((plugin) => plugin.name === 'kolay:apidocs');
        hasDemos = resolvedConfig.plugins.some((plugin) => plugin.name === 'kolay:demos');
        hasImportEntrypoints = resolvedConfig.plugins.some(
          (plugin) => plugin.name === 'kolay:import-entrypoints'
        );

        /**
         * Discover every docs() usage in this config — the plugin may be
         * used multiple times (e.g. different sources with different
         * markdown processing). All usages contribute to one manifest /
         * one set of virtual modules, served by the first ("primary")
         * usage.
         */
        const states = resolvedConfig.plugins
          .filter((plugin) => plugin.name === 'kolay:setup')
          .map((plugin) => plugin.api?.kolay)
          .filter(Boolean);

        if (states.length > 1) {
          const usages = states.map((usageState) => usageState.options);

          states.forEach((usageState, i) => {
            usageState.usages = usages;
            usageState.isPrimary = i === 0;
          });
        }

        // The usages-discovery above has settled isPrimary (default true
        // for a single usage) — discover the project config once, in the
        // primary usage only. Validation errors fail the build / dev
        // server start.
        if (state.isPrimary) {
          kolayConfig = (await loadKolayConfig(cwd)).config;
        }

        resolvedConfig.server ||= {};
        resolvedConfig.server.fs ||= {};
        resolvedConfig.server.fs.allow ||= [];

        // Each usage allows its own groups (every instance runs this hook)
        (state.options.groups ?? []).forEach((group) => {
          resolvedConfig.server.fs.allow.push(normalizePath(group.src));
        });
      },
      /**
       * Serve co-located doc assets at their manifest-space URLs in dev.
       * Registered directly (not via a returned function) so it runs before
       * vite's internal static-file middleware.
       */
      configureServer(server) {
        // configResolved has run: the primary usage serves every usage's docs
        if (!state.isPrimary) return;

        const roots = assetRoots(state, cwd);

        server.middlewares.use((req, res, next) => {
          const [urlPath = ''] = (req.url ?? '').split('?');

          // Page URLs are app routes, but a full-page load of one (e.g.
          // `<base>Docs/intro.md`) can hit a real file on disk when a
          // group's name matches its src directory (case-insensitively),
          // and vite's static middleware would serve raw markdown instead
          // of booting the app. Hand browser navigations to the SPA entry.
          if (
            urlPath.endsWith('.md') &&
            urlPath.startsWith(baseUrl) &&
            req.headers.accept?.includes('text/html')
          ) {
            req.url = baseUrl;

            return next();
          }

          const isMarkdownRequest = urlPath.endsWith('.md');

          if (!ASSET_EXT.test(urlPath) && !isMarkdownRequest) return next();

          for (const { name, dir } of roots) {
            const prefix = baseUrl + (name ? name + '/' : '');

            if (!urlPath.startsWith(prefix)) continue;

            const rel = urlPath.slice(prefix.length);
            const markdownRel = rel.replace(/\.md$/, '.md');
            const candidate = join(dir, decodeURIComponent(rel));

            // Path-traversal guard, and fall through to the other roots when
            // this one doesn't have the file — the unnamed templates roots
            // match every URL under the base.
            if (relative(dir, candidate).startsWith('..')) continue;

            if (!existsSync(candidate)) {
              const sourceCandidate = join(dir, decodeURIComponent(markdownRel));

              if (!isMarkdownRequest || !existsSync(sourceCandidate)) continue;

              send(req, markdownRel, { root: dir })
                .type('text/markdown')
                .on('error', () => next())
                .pipe(res);

              return;
            }

            send(req, rel, { root: dir })
              .on('error', () => next())
              .pipe(res);

            return;
          }

          next();
        });
      },
      /**
       * Emit co-located doc assets into dist at their manifest-space paths
       * (`<groupName>/<relative path>`, no base prefix — fileName is
       * dist-relative) so production serves them at the same URLs dev does.
       */
      async buildStart() {
        if (!isBuild) return;
        // configResolved has run: the primary usage emits every usage's assets
        if (!state.isPrimary) return;

        for (const { name, dir } of assetRoots(state, cwd)) {
          // e.g. no src/templates — nothing to emit. Anything else that
          // throws below should fail the build loudly rather than silently
          // ship without doc assets.
          if (!existsSync(dir)) continue;

          const emitting = [];

          for await (const entry of glob(ASSET_GLOB, { cwd: dir, exclude: ['node_modules'] })) {
            const posixEntry = entry.replaceAll('\\', '/');

            emitting.push(
              readFile(join(dir, entry)).then((source) =>
                this.emitFile({
                  type: 'asset',
                  fileName: name ? `${name}/${posixEntry}` : posixEntry,
                  source,
                })
              )
            );
          }

          await Promise.all(emitting);
        }
      },
    },
    ...virtualFile([
      {
        importPath: 'kolay/api-docs:virtual',
        // dormant whenever an apiDocs() plugin provides the real thing
        when: () => !hasApiDocs,
        content: stripIndent`
          export const packageNames = [];
          export const loadApiDocs = {};
        `,
      },
      {
        importPath: 'kolay/demos:virtual',
        // dormant whenever a demos() plugin provides the real thing
        when: () => !hasDemos,
        content: stripIndent`
          export const modules = {};
        `,
      },
      {
        importPath: 'kolay/import-entrypoints:virtual',
        // dormant whenever an importEntrypoints() plugin provides the real thing
        when: () => !hasImportEntrypoints,
        content: stripIndent`
          export const modules = {};
        `,
      },
      {
        importPath: 'kolay/setup',
        content: stripIndent`
          import { getOwner, setOwner } from '@ember/owner';
          import { assert } from '@ember/debug';
          import { docsManager, loadCompiledDocs } from 'kolay';
          import { registerDestructor } from '@ember/destroyable';


          const secret = window[Symbol.for('__kolay__secret__context__')] ||= {};
          secret.owners ||= new Set();

          export async function setupKolay(context, options) {
            let owner = getOwner(context) ?? context.owner;

            // This is needed because some of our components can be rendered with different owners.
            // But the fetching of API docs is unique per window, not per owner -- documents at an URL
            // can't change.
            secret.owners.add(owner);

            registerDestructor(owner, () => secret.owners.delete(owner));

            assert(
              \`Expected owner to exist on the passed context, \`
              + \`the first parameter passed to setup, but it did not. \`
              + \`Please make sure you pass a framework object as the first paramter to setup, \`
              + \`or make sure that the context that is passed has, at some point, \`
              + \`had setOwner called on it\`,
              owner
            );

            let docs = docsManager(owner);

            // NOTE: TS doesn't resolve paths with colons in them.
            //       But these files don't actually exist on disk.
            //       They are provided by two plugins,
            //       - apiDocs
            //       - markdownPages
            //
            //       If you find yourself reading this comment,
            //       be sure to have both plugins setup in your plugins array.
            //
            //       NOTE: we can't have a virtual module import
            //             more virtual modules under embroide.
            //             :(
            //             So the whole strategy / benefit of setupKolay is
            //             .... much less useful than originally planned
            let [apiDocs, meta, demos, entrypoints] = await Promise.all([
              import('kolay/api-docs:virtual'),
              import('kolay/compiled-docs:virtual'),
              import('kolay/demos:virtual'),
              import('kolay/import-entrypoints:virtual'),
            ]);

            // every group's docs module, loaded in parallel
            let compiledDocs = await loadCompiledDocs(meta);

            await docs.setup({
              apiDocs,
              compiledDocs,
              ...options,
              // demos() aliases and importEntrypoints() packages resolve
              // automatically; explicit modules win
              modules: { ...demos.modules, ...entrypoints.modules, ...(options?.modules ?? {}) },
            });


            return docs.manifest;
          }
        `,
      },
      {
        importPath: 'kolay/compiled-docs:virtual',
        /**
         * The metamanifest: which groups exist, and how to load each
         * group's docs module. Served by the primary usage, enumerating
         * every usage's groups.
         */
        content: async () => {
          const groups = allGroups(state);

          assertUniqueGroupNames(groups);

          const entries = [
            { name: 'Home', id: docsModuleId('Home') },
            ...groups.map((group) => ({ name: group.name, id: docsModuleId(group.name) })),
          ];

          return stripIndent`
            export const base = ${JSON.stringify(baseUrl)};

            export const redirects = ${JSON.stringify(kolayConfig.redirects)};

            export const groups = [
              ${entries
                .map(
                  (entry) =>
                    `{ name: ${JSON.stringify(entry.name)}, load: () => import(${JSON.stringify(entry.id)}) }`
                )
                .join(',\n')}
            ];
          `;
        },
      },
      {
        /**
         * The co-located pages (app/templates, src/templates) — served by
         * the primary usage. Its addRoutes is unscoped: Home pages live in
         * the root URL space.
         */
        importPath: docsModuleId('Home'),
        content: async () => {
          const source = homeSource(cwd);
          const enumerated = await enumerateSource(source, baseUrl, {
            populateManifestEntry: state.options.populateManifestEntry,
          });
          const meta = await sourceMeta(homeMetaCwd(cwd));

          return groupModuleContent({
            ...enumerated,
            meta,
            searchModuleId: `${SEARCH_MODULE_PREFIX}Home`,
          });
        },
      },
      /**
       * Each usage serves the module for its own group:
       * `docs('foo')` enables `virtual:kolay/docs/foo`, whose addRoutes is
       * scoped to the group.
       */
      ...(state.options.groups ?? []).map((group) => ({
        importPath: docsModuleId(group.name),
        content: async () => {
          const enumerated = await enumerateSource(groupSource(group), baseUrl, {
            populateManifestEntry: state.options.populateManifestEntry,
          });
          const meta = await sourceMeta(normalizePath(group.src));

          return groupModuleContent(
            {
              ...enumerated,
              meta,
              searchModuleId: `${SEARCH_MODULE_PREFIX}${group.name}`,
            },
            { scopedTo: group.name }
          );
        },
      })),
      {
        importPath: `${SEARCH_MODULE_PREFIX}Home`,
        content: async () => {
          const enumerated = await enumerateSource(homeSource(cwd), baseUrl, {
            populateManifestEntry: state.options.populateManifestEntry,
          });

          return `export default ${JSON.stringify(enumerated.search)};`;
        },
      },
      ...(state.options.groups ?? []).map((group) => ({
        importPath: `${SEARCH_MODULE_PREFIX}${group.name}`,
        content: async () => {
          const enumerated = await enumerateSource(groupSource(group), baseUrl, {
            populateManifestEntry: state.options.populateManifestEntry,
          });

          return `export default ${JSON.stringify(enumerated.search)};`;
        },
      })),
    ]),
  };
};
