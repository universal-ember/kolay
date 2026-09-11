/**
 * The wrapDemos rehype plugin, for wrapping every demo (live code fence) in
 * a component from scope — see its docs for options. `kolay/wrap-demos`
 * works from both the browser (pass the plugin to `setupKolay`'s
 * `rehypePlugins`) and build config (a `docs()` usage's `rehypePlugins`).
 */
export { wrapDemos } from '../wrap-demos.js';
