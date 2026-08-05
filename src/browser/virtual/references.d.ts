declare module 'kolay/setup' {
  import type { ModuleMap, ScopeMap } from 'ember-repl';
  import type { Manifest } from 'kolay/types';

  export function setupKolay(
    context: object,
    options?: {
      /**
       * Additional invokables that you'd like to have access to
       * in the markdown, without a codefence.
       *
       * By default, the fallowing is available:
       * - for escaping styles / having a clean style-sandbox
       *   - <Shadowed>
       * - for rendering your typedoc:
       *   - <APIDocs>
       *   - <ComponentSignature>
       * - for wrapping demos (paired with the opt-in `wrapDemos` plugin
       *   from 'kolay/wrap-demo', passed via `rehypePlugins`):
       *   - <WrapDemo> — the default renders the demo unchanged; bind your
       *     own WrapDemo here to wrap every demo in your own component.
       */
      topLevelScope?: ScopeMap;

      /**
       * Additional modules you'd like to be able to import from.
       * This is in addition the the default modules provided by ember,
       * and allows you to have access to private libraries without
       * needing to publish those libraries to NPM.
       */
      modules?: ModuleMap;

      /**
       * Provide additional remark plugins to the default markdown compiler.
       *
       * These can be used to add fetaures like notes, callouts, footnotes, etc
       */
      remarkPlugins?: unknown[];

      /**
       * Provide additional rehype plugins to the default html compiler.
       *
       * These can be used to add features syntax-highlighting to pre elements, etc
       */
      rehypePlugins?: unknown[];
    }
  ): Promise<Manifest>;
}

/**
 * Each `docs()` usage enables a virtual module for its group —
 * `docs('foo')` enables `virtual:kolay/docs/foo`:
 *
 * ```js
 * import { addRoutes as addFooRoutes, manifest, meta } from 'virtual:kolay/docs/foo';
 * ```
 *
 * `addRoutes(context)` is pre-scoped to the group: it brings the group's
 * docs into whatever route it's called from.
 *
 * `meta` describes the source: its repository URL, its repo-relative
 * docs path, and anything from a `meta.jsonc` at the source's root.
 */
declare module 'virtual:kolay/docs/*' {
  import type { DocsGroupModule } from 'kolay';

  export const name: DocsGroupModule['name'];
  export const manifest: DocsGroupModule['manifest'];
  export const pages: DocsGroupModule['pages'];
  export const addRoutes: DocsGroupModule['addRoutes'];
  export const meta: DocsGroupModule['meta'];
}
