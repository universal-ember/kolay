/**
 * The wrapDemos rehype plugin, for wrapping every demo (live code fence) in
 * a component from scope — see its docs for options. This is the browser
 * entrypoint (pass the plugin to `setupKolay`'s `rehypePlugins`); build
 * config imports the same plugin from 'kolay/vite'.
 */
export { wrapDemos } from '../wrap-demos.js';
