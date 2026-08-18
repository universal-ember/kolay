# Page Tree Utils

These functions work with the page manifest. Use them in your own navigation, where you must know the difference between a page and a page tree.

## `isPageTree`

This type guard returns `true` when the node is a `PageTree`, which is a folder of pages. It returns `false` for a `Page`.

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

## `getIndexPage`

This function takes a `PageTree`. It returns the `Page` with a path that ends with `index`, if that page exists. Use it to make a folder name in the navigation a link to its index page.

```js
import { getIndexPage, isPageTree } from 'kolay';

for (const node of tree.pages) {
  if (isPageTree(node)) {
    const index = getIndexPage(node);

    if (index) {
      // This collection has an index page — render a link to it
    }
  }
}
```

## API Reference

<APIDocs @module="declarations/browser" @name="isPageTree" @package="kolay" />

<APIDocs @module="declarations/browser" @name="getIndexPage" @package="kolay" />


