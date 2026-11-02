# `searcher`

Rank every page in the docs against a query.

The index needs no configuration. The `docs()` plugin writes each page's title, headings, and prose into the compiled docs, and `setupKolay` gives that to this store.

```js
import { searcher } from 'kolay';

// inside a class with an owner (route, component, service, etc.)
const search = searcher(this);

await search.search('rootURL'); // ranked SearchResult[], best first
await search.loadSearchData(); // the raw index, to rank it yourself
```

`search` is async because the index is. The manifest loads once, and so does the text of any page the build could not inline. Only the first search waits.

## Wiring up a search page

1. Keep the query in the URL, so a search survives a reload and can be linked to.

```js
// app/routes/search.js
import Route from '@ember/routing/route';

export default class SearchRoute extends Route {
  queryParams = { q: { refreshModel: true } };
}
```

2. Register the route above `addRoutes`, so the docs catch-all does not claim the path.

```js
Router.map(function () {
  this.route('search');
  addRoutes(this);
});
```

3. Await the search in a component.

```gjs
import Component from '@glimmer/component';
import { cached } from '@glimmer/tracking';
import { service } from '@ember/service';

import { searcher } from 'kolay';
import { getPromiseState } from 'reactiveweb/get-promise-state';

export default class SearchPage extends Component {
  @service router;

  get query() {
    return String(this.router.currentRoute?.queryParams?.q ?? '');
  }

  @cached
  get search() {
    if (this.query.length < 3) return Promise.resolve([]);

    return searcher(this).search(this.query);
  }

  get results() {
    return getPromiseState(this.search).resolved ?? [];
  }

  <template>
    {{#each this.results as |result|}}
      <a href={{result.path}}>{{result.title}}</a>
    {{/each}}
  </template>
}
```

Keep the `@cached`. `getPromiseState` keys its state off the promise it receives, so a new promise per access gives a new pending state per access.

## What a result carries

A result is the page's manifest entry, plus how it matched.

- `path` and `appRelativePath`: the two path spaces from [`docsManager`](/Runtime/utilities/docs-manager.md). Link with `path`.
- `title`, `groupName`, `headings`: what to show for the result.
- `score`: a term in the title scores 100, in a heading 25, in the prose 1.
- `excerptRange`: offsets into `text` for the passage that matched.

Results come back sorted by score, ties broken by title. A page that scores zero never appears.

## Excerpts

`excerptRange` covers one passage of prose: the paragraph, list item, or footnote that holds the first matching term. The range skips code fences and HTML blocks, so an excerpt reads as the sentence about a thing rather than a sample of it.

`stripFormatting` turns that range into a line worth reading.

```gjs
import { stripFormatting } from 'kolay';

<template>
  <p>{{stripFormatting result.text result.excerptRange}}</p>
</template>
```

It removes the markdown syntax and collapses the whitespace. It does not compile the markdown, which keeps a page of results cheap.

## Highlighting the query

`highlightSearch` marks each term of the query inside an element.

```gjs
import { highlightSearch, stripFormatting } from 'kolay';

<template>
  <p {{highlightSearch this.query}}>
    {{stripFormatting result.text result.excerptRange}}
  </p>
</template>
```

Style the marks under the name `search-query`.

```css
::highlight(search-query) {
  background: color-mix(in oklab, var(--accent), transparent 65%);
  text-decoration: underline;
}
```

Nothing appears until that rule exists. The modifier uses the [CSS Custom Highlight API](https://developer.mozilla.org/en-US/docs/Web/API/CSS_Custom_Highlight_API), so it adds no wrapper elements and the text stays selectable as written. A browser without the API renders the excerpt plainly.

## Pages the build could not inline

A `.gjs.md` page compiles at build time, so its source is already in the manifest. A plain `.md` page loads on demand: from your bundle first, then from the page's own URL.

A page that cannot be read indexes as empty. Check that first when a page never appears in results.

## API Reference

<APIDocs @module="declarations/browser" @name="searcher" @package="kolay" />

The store `searcher` returns:

<APIDocs @module="declarations/browser" @name="SearchService" @package="kolay" />

<APIDocs @module="declarations/browser" @name="stripFormatting" @package="kolay" />

<APIDocs @module="declarations/browser" @name="highlightSearch" @package="kolay" />
