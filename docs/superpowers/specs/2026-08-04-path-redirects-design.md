# Path redirects via a root kolay config file

Date: 2026-08-04

Supersedes [2026-08-03-group-path-aliases-design.md](./2026-08-03-group-path-aliases-design.md) — that design tied aliases to a specific `docs()` group's config. Review on [PR #359](https://github.com/universal-ember/kolay/pull/359) (maintainer feedback) argued redirects must be a separate concept from `docs()`, since URL mount topology is decided by the consumer's own `router.ts`, not by any `docs()` call. This design replaces the per-group `aliases` option entirely with a single, global, file-driven `redirects` list.

## Problem

Renaming or restructuring a URL path in a kolay-powered docs site breaks every existing bookmark/external link to it. There's currently no way to declare "this old path now lives here" so old links keep working.

## Design goals (from review discussion)

- Redirects must not be tied to a specific `docs()` group or its Vite plugin usage — a mount's URL is decided in the consumer's `router.ts`, independent of which `docs()` call feeds it.
- Avoid inventing a second parallel config surface. (Rejected: a new `redirects(...)` Vite plugin export living beside `docs()`/`apiDocs()` — still one config file among several, and still couples to the Vite-config layer specifically.)
- Reuse an existing, well-known pattern for "one project-root config file, several supported formats" — lilconfig (explicitly named in review), the same family of tool ESLint/Stylelint/Prettier use.
- The whole point of `setupKolay` is "the thing that loads everything the browser runtime needs" — redirects should ride along that, not require any new call-site wiring.

## Config surface

A single root-level config file, discovered via `lilconfig('kolay')`'s default search (no custom loaders — this project has no YAML anywhere today; scope is JS/CJS/MJS/JSON, following existing precedent):

- `kolay.config.js` / `.cjs` / `.mjs`
- `.kolayrc` / `.kolayrc.json`
- a `"kolay"` key in `package.json`

Its shape (for now, one key — the file is a general project config, but `redirects` is the only thing it carries until something else needs one):

```js
// kolay.config.js
export default {
  redirects: [
    { from: 'Runtime/*', to: 'Playground/*' },
    { from: 'Old/exact/page', to: 'New/exact/page' },
  ],
};
```

- `from` / `to` are plain path prefixes, matched/rewritten whole-segment and case-insensitively (consistent with kolay's existing `equalsIgnoreCase` path-matching convention) — **not** a general glob library. A trailing `/*` means "this segment and everything under it"; without it, the entry matches only that exact path. `from` and `to` must agree on whether they end in `/*` (both, or neither) — a mismatch is a config error.
- Discovered **once**, at build time (in the primary `docs()` usage's `configResolved`, alongside where `docs()` usages are already discovered in `setup.js`), from `process.cwd()` (matching the `cwd` `setup.js` already uses for `homeSource`/enumeration) upward.
- The file is the **only** source of redirects. `setupKolay(this, options)` gains no matching option — no merging, no second place to look.

## Validation

At config-load time (build/dev-server start), throw a clear error for:
- A `redirects` entry whose `from` or `to` isn't a string, or where exactly one of the pair ends in `/*`.
- Two entries with the same `from` (case-insensitive) — ambiguous, since only one target could apply.

(Overlapping-but-not-identical prefixes, e.g. `Runtime/*` and `Runtime/sub/*`, are not specially detected — entries apply in file order, first match wins. Flagging true overlaps is a possible future enhancement, not needed for v1.)

## Build-side data flow

The metamanifest (`virtual:kolay/compiled-docs`, generated in `setup.js:520-550`) already carries build-time-known, cross-cutting data (`base`) independent of any single `docs()` group — `redirects` belongs there too, not on any per-group manifest entry:

1. `setup.js`: during `configResolved`, run `lilconfig('kolay').search()` once (in the primary usage only — mirrors how `state.isPrimary` already gates other cross-usage work), validate the result (above), default to `[]` if no config file exists.
2. The generated `kolay/compiled-docs:virtual` module content gains `export const redirects = ${JSON.stringify(redirects)};`, alongside its existing `base`/`groups` exports.
3. `src/browser/load-compiled-docs.ts`: `MetaManifest` gains `redirects: { from: string; to: string }[]`; `loadCompiledDocs()` threads it straight into the assembled `Manifest`: `manifest: { base: meta.base, redirects: meta.redirects, groups: ... }`.
4. `src/types.ts`: `Manifest` gains `redirects: { from: string; to: string }[]` (always present, `[]` when no config file / no entries).
5. `src/browser/virtual.d.ts`: `declare module 'kolay/compiled-docs:virtual'` gains `export const redirects: Array<{ from: string; to: string }>;`.

No changes needed to `docs-args.js`, `docs()`'s options, or `setupKolay`'s options type (`src/browser/virtual/references.d.ts`) — this is intentionally invisible to both.

## Runtime resolution & redirect

- `DocsService` (`src/browser/services/docs.ts`) already receives the full `Manifest` via `PREPARE_DOCS`/`this._docs = compiledDocs.manifest` — `manifest.redirects` is available with no service changes beyond exposing it (or a small `resolveRedirect(path): string | undefined` helper method alongside `findByPath`/`groupForURL`).
- `handlePotentialIndexVisit` (`src/browser/router.ts:78`) gains a redirect check, run whenever we're inside the wildcard mount (`parent` exists), before its existing bare-index-visit logic:
  1. Take the current app-relative path (the full remaining wildcard segment, not just its first piece — unlike the superseded design, this isn't scoped to "first segment only").
  2. Check it against `docs.manifest.redirects` in order: for a `/*`-suffixed `from`, match if the path equals the prefix or starts with `prefix + '/'` (case-insensitive); for a bare `from`, match only on exact equality (case-insensitive).
  3. On a match, rebuild the path by substituting the matched prefix with `to`'s (preserving whatever remainder follows), and `router.transitionTo(...)` to it — same app-relative-path convention the existing index-visit redirect already uses.
  4. No match: fall through unchanged to existing behavior.
- Redirects do not chain: only the first matching entry (checked against the originally-visited path) is applied. If entry A's `to` happens to equal entry B's `from`, visiting a path under A lands on B's `from`, not B's `to` — this keeps behavior predictable and rules out accidental redirect loops from misconfigured entries. Worth a doc comment; not worth a build-time cycle check for v1.
- This subsumes the previous design's group-rename use case for free (`{ from: 'Runtime/*', to: 'Playground/*' }` is exactly a group rename) while also covering arbitrary path restructuring, and works regardless of mount topology (root wildcard, nested, or scoped) since it operates purely on the resolved URL, not on group names or manifest group membership.
- No changes needed to `hrefFor` / `appRelativeHrefFor` / `groupHrefFor` — unaffected, as before.

## New dependency

`lilconfig` (small, zero-dependency, widely used for exactly this). No YAML loader added — out of scope per "no existing YAML anywhere in this project."

## Testing plan

- **Vitest** (colocated `*.test.ts`, build-side):
  - A new test for the `setup.js` config-discovery step: loads `redirects` from each supported file form (`kolay.config.js`, `.kolayrc.json`, `package.json#kolay`); defaults to `[]` when absent.
  - Validation: throws for non-string `from`/`to`, mismatched trailing-`/*`, and duplicate `from` entries; passes for valid, non-colliding entries.
- **Qunit** (`docs-app/tests/kolay/*`, browser-side):
  - A new test for the redirect-matching logic itself (whether exposed as `DocsService.resolveRedirect` or inlined) — `/*`-suffixed prefix matches (including the exact-prefix boundary case), bare exact matches, case-insensitivity, first-match-wins ordering, and "no match" passthrough.
  - A new router-level test — visiting `/OldPrefix/sub/page` (and mixed-case variants) transitions to the rewritten `/NewPrefix/sub/page`; an exact-match entry redirects only that one path; an unrelated path is untouched.
  - `docs-app/tests/docs-app/runtime-nav-test.gts` is the closest existing acceptance-style precedent (exercises real navigation/`transitionTo`) — an acceptance test alongside it should render the app with a `kolay.config.js` fixture and confirm the URL bar updates after visiting a redirected path.

This gives TDD anchors for the implementation plan: config discovery/validation → metamanifest plumbing → `Manifest.redirects` → redirect-matching logic → router integration, each independently testable before wiring the next.
