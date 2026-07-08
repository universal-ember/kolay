# Rebase Links

Utilities for apps deployed under a custom `rootURL`. Kolay uses these internally so that authored content, navigation, and page lookup all keep working when the app is served from a sub-path (e.g. a PR preview at `/pr-1234/`). They are exported for consumers with custom compile pipelines or custom navigation.

## `rebaseAuthoredLinks`

A remark plugin that rebases root-absolute URLs in authored markdown onto the given prefix, so they keep working when the app is served at a non-root `rootURL`. This covers markdown link, image, and definition syntax (e.g. `[x](/Docs/a.md)`) as well as `href`/`src` attributes in raw inline HTML (e.g. `<img src="/Docs/a.svg">`).

Kolay prepends this plugin to both of its markdown pipelines automatically — the in-browser compiler for `.md` pages and the build-time compiler for `.gjs.md` pages — so you only need it if you compile markdown yourself instead of going through `setupKolay`. It must run while links are still mdast nodes (i.e. as a remark plugin, before any plugin that serializes to raw HTML); this also keeps code blocks untouched.

```js
import { rebaseAuthoredLinks } from 'kolay';

// in a custom compile pipeline
compile(markdown, {
  remarkPlugins: [
    rebaseAuthoredLinks(router.rootURL),
    // ...your other remark plugins
  ],
});
```

Behavior notes:

- At the default `rootURL` of `/`, the plugin is a no-op.
- Only root-absolute URLs are touched. Relative (`./a.md`), protocol-relative (`//host/...`), and fully-qualified URLs pass through unchanged.
- Idempotent: URLs already starting with the prefix are left alone, so it is safe alongside a consumer's own rebasing or pre-prefixed authored URLs. The tradeoff: an authored path whose first segment happens to equal the `rootURL`'s segment (a group named `docs` on an app served at `/docs/`) is indistinguishable from an already-rebased URL and is left alone — avoid that collision when naming groups.
- The prefix may be a string or, for pipelines constructed before the `rootURL` is known, a `() => string` getter resolved at transform time.

## `stripRootURL`

The inverse operation: strips the app's `rootURL` prefix from a path, yielding an app-relative path. Useful for bringing manifest paths (which include the `rootURL`) into the same space as `router.currentURL` (which is already app-relative — Ember's location layer strips the `rootURL` before it is set, so never strip `currentURL` itself).

```js
import { stripRootURL } from 'kolay';

stripRootURL('/pr-1234/Runtime/util/page.md', '/pr-1234/');
// => '/Runtime/util/page.md'
```

Only a prefix at the start of the path (up to a `/` boundary) is stripped — a coincidental mid-string occurrence of the `rootURL`, or a lookalike sibling prefix (`/pr-1234-old/…` under `/pr-1234/`), is untouched. The `rootURL` may be given with or without its trailing slash. A no-op when `rootURL` is the default `/` or the path does not start with it.

## API Reference

<APIDocs @module="declarations/browser" @name="rebaseAuthoredLinks" @package="kolay" />

<APIDocs @module="declarations/browser" @name="stripRootURL" @package="kolay" />
