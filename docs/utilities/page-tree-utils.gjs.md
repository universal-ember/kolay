# Page Tree Utils

Utility functions for working with the page manifest. Useful when building custom navigation that needs to distinguish between leaf pages and nested page trees.

Every folder has a **landing page**: where its own URL goes. That is the page the author named `index` when there is one, and the folder's first page otherwise. Navigation almost always wants this, because every folder with pages has one.

A folder's landing page is an **explicit index** when the author named it `index`. Build-time sorting puts an explicit index first in its folder, so `folder.pages.at(0)` is it whenever there is one, and `page.name === 'index'` is the check:

```js
const first = folder.pages.at(0);
const hasOwnPage = first && !isPageTree(first) && first.name === 'index';
```

That only matters if you are rendering the list yourself: `<PageNav />` leaves an explicit index out of the page list, because the section heading already links to it.

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

## Where a folder links

For "where should this folder's heading go", ask the docs service rather than the tree, because the answer falls back to the first page when there is no index:

```js
import { docsManager } from 'kolay';

const landing = docsManager(this).landingForTree(folder);
```

Inside [`<PageNav />`](/Runtime/navigation/page-nav.gjs.md) this is already done for you — its `:section` block yields `landing`.

## API Reference

<APIDocs @module="declarations/browser" @name="isPageTree" @package="kolay" />


