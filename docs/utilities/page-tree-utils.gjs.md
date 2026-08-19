# Page Tree Utils

Utility functions for working with the page manifest. Useful when building custom navigation that needs to distinguish between leaf pages and nested page trees.

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

## `getIndexPage`

A folder's index page is where its own URL goes: the page named `index` when there is one, and the folder's first page otherwise. Every folder with pages has one, so a folder heading can always be a link.

```js
import { getIndexPage } from 'kolay';

const indexPage = getIndexPage(folder);
```

The fallback can descend — a folder whose first child is another folder answers with that child's index page. `docsManager(context).indexPageFor(folder)` is the same answer through the service.

## `isRedundantWithHeading`

A nav renders a folder as a heading linking to its index page, then lists that folder's pages. When the heading and one of those pages carry the same title, listing the page repeats the heading:

```js
import { getIndexPage, isRedundantWithHeading } from 'kolay';

for (const page of folder.pages) {
  if (isRedundantWithHeading(folder, page)) continue;

  // ...render the page's link
}
```

It compares titles rather than identity, because the question is what the reader sees. A folder titled by its `meta.json` says something its index page does not, and that page is worth listing.

[`<PageNav />`](/Runtime/navigation/page-nav.gjs.md) applies both for you: it yields the index page as `index` and omits the redundant page from the `:page` block. These are the pieces to reach for when replacing it with a nav of your own.

## Titles

Every page and folder has a resolved `title`, so navigation does not have to derive one:

|          | resolves to                                                                            |
| -------- | -------------------------------------------------------------------------------------- |
| a page   | its frontmatter `title` OR its first heading OR its cleaned filename                    |
| a folder | its `meta.json` `title` OR its index page's title OR its cleaned directory name        |

"Cleaned names" have digits removed, dashes turned into spaces, and are sentence-cased.

## API Reference

<APIDocs @module="declarations/browser" @name="isPageTree" @package="kolay" />

<APIDocs @module="declarations/browser" @name="getIndexPage" @package="kolay" />

<APIDocs @module="declarations/browser" @name="isRedundantWithHeading" @package="kolay" />


