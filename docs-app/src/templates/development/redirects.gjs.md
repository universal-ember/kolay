# Redirects

When a docs site restructures (a group renamed, a section moved, pages consolidated), the old URLs live on in bookmarks, search results, and other sites' links. Redirects let you declare "this old path now lives here", and kolay serves them at the router level so old links keep working.

If your site deploys to a host with its own redirect support (Netlify, Cloudflare, Vercel, etc.), prefer configuring redirects there: the host answers with a real `301` before the app ever boots, and search engines update their indexes. Kolay's redirects run after the app boots, and they also cover the links between pages, which no host redirect ever sees. Stale internal links are common once a docs app grows large and nobody is checking every link regularly.

## The config file

Redirects are one key of [kolay.config.js](/development/config-file.md), the project-level config file (which can also describe your docs groups, api docs, demos, and import entrypoints):

```js
// kolay.config.js
import { defineConfig } from "kolay/vite";

export default defineConfig({
  redirects: [
    // a moved subtree
    { from: "docs/*", to: "TypeDoc/components/*" },
    // a single moved page
    { from: "usage/setup", to: "install/index.md" },
  ],
});
```

There is nothing to wire up: when [`setupKolay`](/install/index.md) runs (in your application route), the router service is subscribed automatically. Incoming transitions are rewritten before they land, and the URL the app boots on is corrected with `replaceWith`, so the back button isn't left pointing at the dead URL.

The entries above are real: this site's own `kolay.config.js` carries the old URLs from its previous arrangements. Follow [/usage/setup](/usage/setup) or [/docs/component-signature](/docs/component-signature) and watch the URL bar.

## Matching

Entries are plain path prefixes, not globs, matched against the app-relative URL of every transition:

- A trailing `/*` (on both `from` and `to`) matches the prefix itself and everything under it, carrying the remainder onto `to`. Without it, the entry matches only that exact path.
- Matching is whole-segment (`Runtime/*` does not match `/RuntimeExtras/...`) and case-insensitive, consistent with how kolay matches paths everywhere else. For exact entries, the `.md` extension is optional on the visited path, since pages are visitable with and without it.
- Entries apply in order; the first match wins.
- Paths are app-relative (a leading `/` is allowed and ignored). The deploy's `rootURL` is handled for you.

Because matching happens against the URL, mount topology doesn't matter: root wildcard mounts, nested mounts, and scoped mounts all work the same, and a rewritten path may land in a different mount than the one that caught it.

One boundary: a redirect can only fire for URLs your router recognizes. With a top-level `addRoutes(this)` (like this site), that's every otherwise-unclaimed path. Without one, paths outside your routes 404 before kolay ever sees them.

## Validation

An invalid config is a build (and dev-server start) error, reported with the config file's path:

- an entry that isn't `{ from: string, to: string }`
- a trailing-`/*` mismatch (`from` and `to` must both have it, or neither)
- two entries sharing a `from`, where only the first could ever apply
- a `to` that another entry's `from` would match again. Redirects don't chain, so every target must be a final destination. This also makes redirect loops impossible by construction.
