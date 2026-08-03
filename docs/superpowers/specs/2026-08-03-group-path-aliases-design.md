# Group path aliases

Date: 2026-08-03

## Problem

A kolay app's `docs()` config names a "group" (e.g. `docs('Runtime', { src: ... })`), and — in the common "root URL space" mount mode, where a single `addRoutes(this)` call at the router root serves every group off a shared wildcard route — that name becomes the group's top-level URL segment (`/Runtime/...`). Renaming a group today breaks every existing bookmark/external link to it: the old URL segment no longer matches any group, and the page fails to resolve.

This feature lets a `docs()` usage declare the group's old name(s) as aliases, so visiting an old URL redirects to the equivalent URL under the new name.

## Scope

Aliases apply to the group's top-level URL segment in the shared-wildcard "root URL space" mount mode (`addRoutes(this)` called once, unscoped, at the router root — the mode used when multiple groups share the generic `page` route and the URL's first segment names the group).

**Out of scope / limitations:**
- A *scoped* mount (`addRoutes(this, 'foo-bar')`) has a URL independent of the group name — renaming the group doesn't change its URL, so aliasing is moot there.
- A dedicated nested mount whose own route path is hardcoded by the consumer (e.g. `this.route('runtime', { path: '/Runtime' }, function () { addRoutes(this) })`, as `docs-app` itself uses) has its URL segment fixed by that hardcoded path string, decided entirely in the consumer's own `router.ts`, before any kolay code runs. `docs()`'s `aliases` option can't affect that; a consumer wanting to preserve an old URL for a dedicated mount manages it via plain Ember routing (keeping/redirecting the old route) themselves.
- Only the group's top-level name is aliased. Aliasing individual page paths within a group is not covered by this design.

## Config surface

`docs(groupName, options)` gains an `aliases` option:

```js
docs('Playground', { src: import.meta.resolve('./playground'), aliases: ['Runtime'] })

// a group renamed more than once:
docs('Playground', { src: import.meta.resolve('./playground'), aliases: ['Runtime', 'Sandbox'] })
```

- `aliases?: string[]` — old group name(s) that now resolve to this group. No bare-string shorthand; always an array. Defaults to `[]`.
- Matching is case-insensitive, consistent with existing group-name matching (`equalsIgnoreCase`).
- An alias colliding with any group's real name, or with another group's alias, is a build-time error naming the conflicting groups — e.g.:
  > `Alias 'Runtime' (declared on group 'Playground') collides with group 'Runtime'. Alias names must be unique across every group and its aliases.`

## Behavior

Visiting an aliased URL (e.g. `/Runtime/sub/page`, for a group renamed to `Playground` with `aliases: ['Runtime']`) redirects (URL bar changes) to the canonical equivalent (`/Playground/sub/page`), preserving the remainder of the path. A canonical group name never redirects. An unrelated/unknown URL segment (neither a group name nor an alias) is untouched — falls through to existing "not found" handling, unrelated to this feature.

## Build-side data flow

1. `src/build/plugins/docs-args.js`: `DocsOptions` gains `aliases?: string[]`. `parseDocsArgs` passes it onto the group entry: `groups: [{ name, src, aliases }]`.
2. `src/build/plugins/setup.js`:
   - `groupSource(group)` threads `group.aliases` into the `enumerateSource` input.
   - `enumerateSource` includes it on the constructed group: `manifestGroup: { name: displayName, aliases, ...found }`.
   - A new validation pass (alongside `assertUniqueGroupNames`) collects every group's `aliases` and errors (per the message above) if any alias collides with another group's `name` or another group's `aliases`.
3. `src/types.ts`: `Manifest['groups'][number]` gains `aliases: string[]` (always present, `[]` when none configured).

This rides the same path every other group property (`name`, `list`, `tree`) already takes from config → `manifestGroup` → the serialized `virtual:kolay/docs/<group>` module → the browser's `Manifest`.

## Runtime resolution & redirect

- **`DocsService.canonicalGroupName(name)`** (`src/browser/services/docs.ts:269`) becomes alias-aware: it matches `name` case-insensitively against each group's `name` **or** any entry in its `aliases`, returning the group's canonical `name`. This is the single source of truth `selectedGroup` and the redirect check both use, so content resolves to the correct group immediately — even in the instant before a redirect transition completes.
- **`handlePotentialIndexVisit`** (`src/browser/router.ts:78`) gains an additional check, run whenever we're inside the wildcard mount (`parent` exists), before falling through to the existing bare-index-visit logic:
  1. Take `wildcardParam` (already computed in this function), split off its first path segment.
  2. If that segment is already an exact (canonical) group name, do nothing further here — existing behavior applies unchanged.
  3. Otherwise, if `canonicalGroupName(firstSegment)` resolves to some *other* name (the segment matched via an alias, not the canonical name itself), rebuild the path with that first segment replaced by the canonical name — keeping the remainder untouched — and `router.transitionTo(...)` to it, using the same app-relative-path convention the existing index-visit redirect already uses.
  4. Otherwise (the segment is neither a group name nor an alias), leave it alone.
- This folds into the existing `handlePotentialIndexVisit` rather than a new opt-in function: every consumer app already calls it from each route's `redirect()` hook (see `docs-app/src/routes/{page,index,runtime,typedoc}.ts`), so alias redirects work automatically with no new call sites and no migration step. A fully-automatic alternative (having `addRoutes()` inject the behavior itself) isn't feasible: `addRoutes` only builds the route map — the `redirect()`/`beforeModel()` hooks live on route classes the consumer authors, outside kolay's control.
- No changes needed to `hrefFor` / `appRelativeHrefFor` / `groupHrefFor` — they generate links from the manifest's canonical group names, never from URL-derived input, so they can never emit a link to an old alias.

## Testing plan

Following the repo's existing split (vitest for build-side pure logic, qunit — hosted in `docs-app` — for browser-runtime logic):

- **Vitest** (colocated `*.test.ts`):
  - `docs-args.test.ts` — `parseDocsArgs` passes `aliases` through onto the group entry; defaults to `[]`.
  - `setup.guard.test.ts` (or a sibling) — the new collision validation throws with a clear message for alias-vs-group-name and alias-vs-alias collisions; passes when aliases are unique.
- **Qunit** (`docs-app/tests/kolay/*`):
  - `services/docs-test.ts` — `canonicalGroupName` resolves an alias to its group's canonical name, case-insensitively; unaffected for non-aliased names.
  - A new test covering `handlePotentialIndexVisit`'s alias-redirect check — visiting `/OldName`, `/OldName/sub/page`, and mixed-case variants transitions to the canonical `/NewName/...` equivalent; a canonical name never redirects; an unrelated unknown segment is untouched.
  - `docs-app/tests/docs-app/runtime-nav-test.gts` is the closest existing acceptance-style precedent (exercises real navigation/`transitionTo`) — an acceptance test alongside it should render the app and confirm the URL bar updates after visiting an aliased path.

These give TDD anchors for the implementation plan: config parsing → manifest plumbing → `canonicalGroupName` → redirect check, each independently testable before wiring the next.
