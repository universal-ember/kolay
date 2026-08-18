# Page Tree Utils

Utility functions for working with the page manifest. Useful when building custom navigation that needs to distinguish between leaf pages and nested page trees.

Two words that are easy to conflate, and which mean different things here:

- an **index page** is a page explicitly named `index`. It is a folder's own page.
- a **landing page** is wherever a folder's URL goes: its index page when it has one, its first page otherwise.

Most navigation wants the landing page — every folder has one, so every folder heading can be a link.

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

## `isIndex`

Type guard that returns `true` if the given node is a page explicitly named `index`. It answers "does this folder have a page of its own", not "where should this folder link".

Sorting always puts an explicit index first in its folder, so the first child is it whenever there is one:

```js
import { isIndex } from 'kolay';

const first = folder.pages.at(0);

if (first && isIndex(first)) {
  // `first` is a Page, and it is this folder's own page
}
```

That holds however the folder is ordered. A `meta.json` `order` cannot place an index second — it is hoisted before the order is applied.

## Where a folder links

For "where should this folder's heading go", ask the docs service rather than the tree, because the answer falls back to the first page when there is no index:

```js
import { docsManager } from 'kolay';

const landing = docsManager(this).landingForTree(folder);
```

Inside [`<PageNav />`](/Runtime/navigation/page-nav.gjs.md) this is already done for you — its `:section` block yields `landing`.

## API Reference

<APIDocs @module="declarations/browser" @name="isPageTree" @package="kolay" />

<APIDocs @module="declarations/browser" @name="isIndex" @package="kolay" />
