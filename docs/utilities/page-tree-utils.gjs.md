# Page Tree Utils

Working with the page manifest, when building navigation of your own.

## Titles

Every page and folder has a resolved `title`, so navigation does not have to derive one:

|          | resolves to                                                          |
| -------- | -------------------------------------------------------------------- |
| a page   | its json `title`, then its first heading, then its cleaned filename   |
| a folder | its `meta.json` `title`, then its index page's title, then its cleaned directory name |

Cleaned names have digits removed, dashes turned into spaces, and are sentence-cased.

## `isPageTree`

Type guard: `true` for a `PageTree` (a folder), `false` for a `Page`.

```js
import { isPageTree } from 'kolay';

for (const node of folder.pages) {
  console.log(isPageTree(node) ? 'folder:' : 'page:', node.title);
}
```

## Where a folder's heading links

A folder's **index page** is the page its own URL goes to: the one named `index` when there is one, and the folder's first page otherwise.

```js
import { docsManager } from 'kolay';

const indexPage = docsManager(this).indexPageFor(folder);
```

[`<PageNav />`](/Runtime/navigation/page-nav.gjs.md) does this for you and yields it as `index`. It also leaves out any page the heading already links to under the same words:

```js
const alreadyInTheHeading = page.title === folder.title;
```

## API Reference

<APIDocs @module="declarations/browser" @name="isPageTree" @package="kolay" />
