# Page Tree Utils

Utility functions for working with the page manifest. Useful when building custom navigation that needs to distinguish between leaf pages and nested page trees.

Every folder has an **index page**: the page its own URL goes to. That is the page the author named `index` when there is one, and the folder's first page otherwise.

If you render the page list yourself, you will want the rule `<PageNav />` uses to avoid listing a page its section heading already links to — compare titles:

```js
const alreadyInTheHeading = page.title === folder.title;
```

Both titles are resolved at build time, so this is a string comparison rather than a check on how the page was named.

## `isPageTree`

Type guard that returns `true` if the given node is a `PageTree` (a folder of pages) rather than a `Page`.

```js
import { isPageTree } from 'kolay';

for (const node of tree.pages) {
  if (isPageTree(node)) {
    console.log('folder:', node.name, node.pages.length, 'children');
  } else {
    console.log('page:', node.name, node.path);
  }
}
```

## Where a folder's heading links

For "where should this folder's heading go", ask the docs service rather than the tree, because the answer falls back to the first page when there is no index:

```js
import { docsManager } from 'kolay';

const indexPage = docsManager(this).indexPageFor(folder);
```

Inside [`<PageNav />`](/Runtime/navigation/page-nav.gjs.md) this is already done for you — its `:section` block yields `index`.

## API Reference

<APIDocs @module="declarations/browser" @name="isPageTree" @package="kolay" />


