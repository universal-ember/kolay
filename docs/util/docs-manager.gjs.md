# `docsManager`

Access the docs service store, which holds the manifest and provides methods for querying groups, pages, and the page hierarchy.

This is useful when building custom navigation or page-selection logic beyond what the built-in `<GroupNav />` and `<PageNav />` components provide.

```js
import { docsManager } from 'kolay';

// inside a class with an owner (route, component, service, etc.)
const docs = docsManager(this);

docs.availableGroups;  // ['root', 'Runtime', ...]
docs.pages;            // flat list of pages for the current group
docs.tree;             // hierarchical page tree for the current group
docs.selectedGroup;    // the currently active group name
docs.findByPath('/usage/setup.md');  // look up a specific page
docs.groupForURL('/Runtime/docs/api-docs.md'); // which group owns this URL?
```

## Path spaces

Every manifest item carries two paths, computed at build time:

- `path` — prefixed with the app's `rootURL` (available as `manifest.base`). Use this for `href`s.
- `appRelativePath` — as if the app were deployed at `/`. This is the space `router.currentURL` and `transitionTo` operate in; `findByPath` and `groupForURL` take paths in this space (with or without the `.md` extension for `findByPath`).

At the default `rootURL` of `/`, the two are identical.

## API Reference

<APIDocs @module="declarations/browser" @name="docsManager" @package="kolay" />
