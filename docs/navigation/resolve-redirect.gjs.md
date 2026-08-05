# Resolve Redirect

## `resolveRedirect`

The matching behind [configured redirects](/development/redirects.md): resolves a visited path against the `redirects` carried on the manifest, returning the rewritten path — or `undefined` when nothing matches. [`handlePotentialIndexVisit`](/Runtime/navigation/handle-potential-index-visit.md) applies it for you; it is exported for consumers building their own routing.

```gjs
import { resolveRedirect } from 'kolay';

// in a component or route with access to the docs manager
resolveRedirect('Old/some/page.md', docsManager(this).manifest.redirects);
// => 'New/some/page.md' (with { from: 'Old/*', to: 'New/*' } configured)
```

Behavior notes:

- Entries are plain path prefixes: a trailing `/*` matches the prefix itself and everything under it (the remainder is preserved onto `to`); without it, only that exact path matches.
- Matching is whole-segment and case-insensitive; the first matching entry wins.
- Redirects don't chain — the result is never resolved again. Config validation (at build time) guarantees no entry's target lands where another's `from` would match.

## API Reference

<APIDocs @module="declarations/browser" @name="resolveRedirect" @package="kolay" />
