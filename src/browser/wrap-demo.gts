import type { TOC } from '@ember/component/template-only';

export { wrapDemos } from '../wrap-demos.js';

export interface WrapDemoSignature {
  Blocks: {
    /**
     * The rendered demo.
     */
    default: [];
  };
}

/**
 * With the opt-in `wrapDemos` plugin, every demo (live code fence) is
 * wrapped in a `<WrapDemo>` (or the plugin's `componentName` option),
 * resolved from scope — this is the default, which renders the demo
 * unchanged.
 *
 * To wrap every demo in your own chrome, bind a component named `WrapDemo`
 * yourself:
 * - for runtime-compiled `.md` pages: in `setupKolay`'s `topLevelScope`
 * - for build-time-compiled `.gjs.md` / `.gts.md` pages: in the `scope`
 *   option of the `docs()` plugin (when your scope binds `WrapDemo`, the
 *   generated import of this default is skipped)
 */
export const WrapDemo: TOC<WrapDemoSignature> = <template>
  {{! template-lint-disable no-yield-only }}
  {{yield}}
</template>;
