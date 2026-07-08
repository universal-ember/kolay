// The implementation lives in an ember-free, plain-JS module so the
// node-side build plugins (which run uncompiled) can share it; re-exported
// here for the public `kolay` entry point.
export { rebaseAuthoredLinks } from '../rebase-links.js';
