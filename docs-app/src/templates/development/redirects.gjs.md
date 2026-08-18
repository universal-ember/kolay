# Redirects

A docs site changes over time. You rename a group, you move a section, or you join pages together. The old URLs stay in bookmarks, in search results, and in the links on other sites. A redirect declares that an old path now points somewhere else. Kolay serves the redirect in the router, so the old links continue to work.

Your host can have its own redirect support, for example Netlify, Cloudflare, or Vercel. Configure the redirects there when you can. The host answers with a real `301` before the app starts, and a search engine then updates its index. The redirects of kolay operate after the app starts. They also cover the links between pages, which a host redirect never sees. Old internal links are common in a large docs app, where nobody checks every link.

## The config file

The redirects are one key of [kolay.config.js](/development/config-file.md):

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

There is no other configuration. [`setupKolay`](/install/index.md) operates in your application route, and it subscribes to the router service for you. Kolay rewrites each transition before it completes. It also corrects the start URL of the app with `replaceWith`, so the back button does not point at the dead URL.

The entries above are real. The `kolay.config.js` of this site lists the old URLs from its earlier structure. Open [/usage/setup](/usage/setup) or [/docs/component-signature](/docs/component-signature), then look at the URL bar.

## Matching

An entry is a plain path prefix, not a glob. Kolay matches it against the app-relative URL of every transition:

- A `/*` at the end, on both `from` and `to`, matches the prefix and every path below it. Kolay adds the rest of the path to `to`. Without the `/*`, the entry matches only that exact path.
- A match is always a whole segment, so `Runtime/*` does not match `/RuntimeExtras/...`. A match also ignores the letter case, as kolay does for every other path. For an exact entry, the `.md` extension on the visited path is optional, because a page opens with and without it.
- The entries apply in order. The first match is the one that applies.
- A path is app-relative. A `/` at the start is permitted, and kolay ignores it. Kolay applies the `rootURL` of the deploy for you.

The match is against the URL, so the structure of your mounts is not important. A root wildcard mount, a nested mount, and a scoped mount all behave the same. A rewritten path can also go to a different mount from the one that caught it.

There is one limit. A redirect works only for a URL that your router recognizes. With a top-level `addRoutes(this)`, as this site has, that is every free path. Without it, a path outside your routes returns a 404 before kolay sees it.

## Validation

An invalid config stops the build and the start of the dev server. The error message gives the path of the config file. These are the faults:

- An entry that is not `{ from: string, to: string }`.
- A `/*` on one side only. Both `from` and `to` must have it, or neither of them.
- Two entries with the same `from`, where only the first one can apply.
- A `to` that the `from` of another entry matches again. A redirect does not chain, so every target must be a final destination. This also makes a redirect loop impossible.
