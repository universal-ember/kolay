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

## A folder's index page

A folder's index page is where its own URL goes: the page named `index` when there is one, and the folder's first page otherwise. Every folder with pages has one, so a folder heading can always be a link.

```js
import { docsManager } from 'kolay';

// `context` is anything with an owner — a component, route, or service
const indexPage = docsManager(context).indexPageFor(folder);
```

[`<PageNav />`](/Runtime/navigation/page-nav.gjs.md) does this for you and yields it as `index`. It also leaves out any page its section heading already links to under the same title:

```js
const alreadyInTheHeading = page.title === folder.title;
```

## Titles

Every page and folder has a resolved `title`, so navigation does not have to derive one:

|          | resolves to                                                                            |
| -------- | -------------------------------------------------------------------------------------- |
| a page   | its frontmatter `title` OR its first heading OR its cleaned filename                    |
| a folder | its `meta.json` `title` OR its index page's title OR its cleaned directory name        |

"Cleaned names" have digits removed, dashes turned into spaces, and are sentence-cased.

## API Reference

<APIDocs @module="declarations/browser" @name="isPageTree" @package="kolay" />


