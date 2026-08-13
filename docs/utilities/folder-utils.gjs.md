# Folder Utils

Utility functions for working with the page manifest. Useful when building custom navigation that needs to distinguish between leaf pages and nested folders.

## `isFolder`

Type guard that returns `true` if the given node is a `Folder` (a folder of pages) rather than a `Page`.

```js
import { isFolder } from 'kolay';

for (const node of tree.pages) {
  if (isFolder(node)) {
    console.log('folder:', node.name, node.pages.length, 'children');
  } else {
    console.log('page:', node.name, node.path);
  }
}
```

## `getIndexPage`

Given a `Folder`, returns the `Page` whose path ends with `index`, if one exists. This is useful for making folder names in navigation link to an index page.

```js
import { getIndexPage, isFolder } from 'kolay';

for (const node of tree.pages) {
  if (isFolder(node)) {
    const index = getIndexPage(node);

    if (index) {
      // This collection has an index page — render a link to it
    }
  }
}
```

## API Reference

<APIDocs @module="declarations/browser" @name="isFolder" @package="kolay" />

<APIDocs @module="declarations/browser" @name="getIndexPage" @package="kolay" />


