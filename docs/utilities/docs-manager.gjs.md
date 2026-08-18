# `docsManager`

This store is the docs service. It holds the manifest. It also has methods that query the groups, the pages, and the page hierarchy.

Use it to build your own navigation, or your own page selection, when the `<GroupNav />` and `<PageNav />` components do too little.

```js
import { docsManager } from 'kolay';

// inside a class with an owner (route, component, service, etc.)
const docs = docsManager(this);

docs.availableGroups;  // ['root', 'Runtime', ...]
docs.pages;            // flat list of pages for the current group
docs.tree;             // hierarchical page tree for the current group
docs.selectedGroup;    // the currently active group name
docs.findByPath('/install/index.md');  // look up a specific page
docs.groupForURL('/TypeDoc/components/api-docs.md'); // which group owns this URL?
```

## Path spaces

Every manifest item has two paths, which the build computes:

- `path` starts with the `rootURL` of the app, which is also `manifest.base`. Use this path for an `href`.
- `appRelativePath` is the path as if the app were deployed at `/`. `router.currentURL` and `transitionTo` use this space. `findByPath` and `groupForURL` also take a path in this space. For `findByPath`, the `.md` extension is optional.

At the default `rootURL` of `/`, the two paths are the same.

## API Reference

<APIDocs @module="declarations/browser" @name="docsManager" @package="kolay" />

The store `docsManager` returns:

<APIDocs @module="declarations/browser" @name="DocsService" @package="kolay" />
