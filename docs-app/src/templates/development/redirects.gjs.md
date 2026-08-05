# Redirects

When a docs site restructures — a group renamed, a section moved, pages consolidated — the old URLs live on in bookmarks, search results, and other sites' links. Redirects let you declare "this old path now lives here", and kolay serves them at the router level so old links keep working.

## The config file

Redirects live in a project-level config file, discovered at build time with [lilconfig](https://github.com/antonk52/lilconfig): `kolay.config.js` (or `.cjs` / `.mjs`), `.kolayrc` (JSON) or `.kolayrc.json` / `.js` / `.cjs` / `.mjs`, or a `"kolay"` key in `package.json` — with every rc / config-file form also looked for inside a `.config/` or `config/` directory.

```js
// kolay.config.js
export default {
  redirects: [
    // a moved subtree
    { from: "guides/*", to: "development/*" },
    // a single moved page
    { from: "legacy-install", to: "install/index.md" },
  ],
};
```

The file is intentionally not part of any `docs()` or `setupKolay()` options: a URL's shape is decided by where `addRoutes` is mounted in your `router.ts`, not by any one plugin usage — so redirects are declared once, globally, in URL space.

There is nothing to wire up: when [`setupKolay`](/install/index.md) runs (in your application route), the router service is subscribed automatically — incoming transitions are rewritten before they land, and the URL the app boots on is corrected (with `replaceWith`, so the back button isn't left pointing at the dead URL).

The two entries above are live in this site's own `kolay.config.js` — follow [/guides/rendering-pages.md](/guides/rendering-pages.md) or [/legacy-install](/legacy-install) and watch the URL bar.

## Matching

Entries are plain path prefixes — not globs — matched against the app-relative URL of every transition:

- A trailing `/*` (on both `from` and `to`) matches the prefix itself and everything under it; the remainder is carried onto `to`. Without it, the entry matches only that exact path.
- Matching is whole-segment (`Runtime/*` does not match `/RuntimeExtras/...`) and case-insensitive, consistent with how kolay matches paths everywhere else.
- Entries apply in order; the first match wins.
- Paths are app-relative (a leading `/` is allowed and ignored) — the deploy's `rootURL` is handled for you.

Because matching happens against the resolved URL, mount topology doesn't matter: root wildcard mounts, nested mounts, and scoped mounts all work the same, and a rewritten path may land in a different mount than the one that caught it.

One boundary: a redirect can only fire for URLs your router recognizes. With a top-level `addRoutes(this)` (like this site), that's every otherwise-unclaimed path; without one, paths outside your routes 404 before kolay ever sees them.

## Validation

The config is validated when the build (or dev server) starts, and fails loudly — naming the config file — for:

- an entry that isn't `{ from: string, to: string }`
- a trailing-`/*` mismatch (`from` and `to` must both have it, or neither)
- two entries sharing a `from` — only the first could ever apply
- a `to` that another entry's `from` would match again — redirects don't chain, so every target must be a final destination. This also makes redirect loops impossible by construction.

## API Reference

<APIDocs @module="declarations/browser" @name="resolveRedirect" @package="kolay" />
