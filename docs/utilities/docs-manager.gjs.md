# `docsManager`

Access the docs service store, which holds the manifest and provides methods for querying groups, pages, and the page hierarchy.

This is useful when building custom navigation or page-selection logic beyond what the built-in `<GroupNav />` and `<PageNav />` components provide.

```js
import { docsManager } from 'kolay';

// inside a class with an owner (route, component, service, etc.)
const docs = docsManager(this);

docs.availableGroups;  // ['Home', 'Runtime', ...]
docs.pages;            // flat list of pages for the current group
docs.tree;             // hierarchical page tree to render for the current page
docs.selectedGroup;    // the currently active group name
docs.navEntries;       // the top-level nav: a group, with what it collects
docs.activeNavEntry;   // the nav entry the current page belongs to
docs.collectionOf('plugins'); // which entry presents this group
docs.findByPath('/install/index.md');  // look up a specific page
docs.groupForURL('/TypeDoc/components/api-docs.md'); // which group owns this URL?
```

## Path spaces

Every manifest item carries two paths, computed at build time:

- `path` — prefixed with the app's `rootURL` (available as `manifest.base`). Use this for `href`s.
- `appRelativePath` — as if the app were deployed at `/`. This is the space `router.currentURL` and `transitionTo` operate in; `findByPath` and `groupForURL` take paths in this space (with or without the `.md` extension for `findByPath`).

At the default `rootURL` of `/`, the two are identical.

## Groups, and the navigation's view of them

`availableGroups` and `selectedGroup` answer questions about *groups*:

- **`availableGroups`** — every group in the manifest, in order. It is the list a URL is resolved against: `canonicalGroupName`, `groupForURL`, `selectGroup`, and [`handlePotentialIndexVisit`](/Runtime/navigation/handle-potential-index-visit.md) all work from it, and `selectedGroup` falls back to its first entry when the URL names no group.
- **`selectedGroup`** — the group the current page belongs to, from the URL (or from the scoped mount the route is inside). `pages`, `tree`, `currentGroup`, and `findByPath` are all relative to it.

`navEntries` answers a question about the *navigation*: what belongs across the top of the site. It is one entry per group — except that a group with a [`collection`](/development/configuring-docs.md) presents the groups it collects as sections of its own entry, so they are not entries themselves. `activeNavEntry` is the entry the current page belongs to, which is what an entry's active state should compare against, and `collectionOf(groupName)` names the entry a given group is presented by. `manifest.nav` is the tree those entries come from, as the config described it.

The two views differ only when a group collects others, and both are needed: `availableGroups` must keep listing every group or a collected group's own pages would stop resolving, so `navEntries` is where the merge lives. `docs.tree` bridges them — it is the current group's page tree, or the collection group's when something collects it — so a page list built on `tree` picks that up on its own, while a top-level nav built on `availableGroups` keeps showing one entry per group until it switches to `navEntries`. `currentGroup.tree` is always the group's own tree.

## API Reference

<APIDocs @module="declarations/browser" @name="docsManager" @package="kolay" />

The store `docsManager` returns:

<APIDocs @module="declarations/browser" @name="DocsService" @package="kolay" />
