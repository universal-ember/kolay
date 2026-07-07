# Rebase Links

Utilities for apps deployed under a custom `rootURL`. Kolay uses these internally so that authored content, navigation, and page lookup all keep working when the app is served from a sub-path (e.g. a PR preview at `/pr-1234/`). They are exported for consumers with custom compile pipelines or custom navigation.

## `rebaseAuthoredLinks`

A remark plugin that rebases root-absolute link, image, and definition URLs in authored markdown (e.g. `[x](/Docs/a.md)`) onto the given prefix, so they keep working when the app is served at a non-root `rootURL`.

Kolay prepends this plugin to its markdown pipeline automatically — you only need it if you compile markdown yourself instead of going through `setupKolay`. It must run while links are still mdast nodes (i.e. as a remark plugin, before any plugin that serializes to raw HTML); this also keeps code blocks untouched.

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
- Idempotent: URLs already starting with the prefix are left alone, so it is safe alongside a consumer's own rebasing or pre-prefixed authored URLs.

## `stripRootURL`

The inverse operation: strips the app's `rootURL` prefix from a path, yielding an app-relative path. Useful when comparing `router.currentURL` against manifest paths in custom navigation.

```js
import { stripRootURL } from 'kolay';

stripRootURL('/pr-1234/Runtime/util/page.md', '/pr-1234/');
// => '/Runtime/util/page.md'
```

Only a prefix at the start of the path is stripped — a coincidental mid-string occurrence of the `rootURL` is untouched. A no-op when `rootURL` is the default `/` or the path does not start with it.

## API Reference

<APIDocs @module="declarations/browser" @name="rebaseAuthoredLinks" @package="kolay" />

<APIDocs @module="declarations/browser" @name="stripRootURL" @package="kolay" />
