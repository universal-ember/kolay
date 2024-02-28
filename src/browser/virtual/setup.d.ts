export function setupKolay(
  context: object,
  options: {
    // Temporary until I can figure out how to make 
    // virtual modules import virtual modules
    apiDocs: any;
    // Temporary until I can figure out how to make 
    // virtual modules import virtual modules
    manifest: any;

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
    topLevelScope?: Record<string, unknown>;

    /**
     * Additional modules you'd like to be able to import from.
     * This is in addition the the default modules provided by ember,
     * and allows you to have access to private libraries without
     * needing to publish those libraries to NPM.
     */
    resolve?: Record<string, Record<string, unknown>>;

    /**
     * Provide additional remark plugins to the default markdown compiler.
     *
     * These can be used to add fetaures like notes, callouts, footnotes, etc
     */
    remarkPlugins?: unknown[];
  }
): Promise<Manifest>;
