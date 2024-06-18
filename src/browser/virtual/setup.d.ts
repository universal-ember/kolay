import type { Manifest } from '@universal-ember/kolay-ui';

interface ResolveMap {
  [moduleName: string]: ScopeMap;
}

interface ScopeMap {
  [identifier: string]: unknown;
}

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
     */
    topLevelScope?: ScopeMap;

    /**
     * Additional modules you'd like to be able to import from.
     * This is in addition the the default modules provided by ember,
     * and allows you to have access to private libraries without
     * needing to publish those libraries to NPM.
     */
    resolve?: { [moduleName: string]: Promise<ScopeMap> };

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
