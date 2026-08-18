# `searcher`

This store ranks every page in the docs against a query.

The index needs no configuration. The `docs()` plugin writes the title, the headings, and the prose of each page into the compiled docs. `setupKolay` then gives that data to this store.

```js
import { searcher } from 'kolay';

// inside a class with an owner (route, component, service, etc.)
const search = searcher(this);

await search.search('rootURL'); // ranked SearchResult[], best first
await search.loadSearchData(); // the raw index, to rank it yourself
```

`search` is async, because the index is async. The manifest loads one time. The text of a page that the build cannot inline also loads one time. Only the first search waits.

## Build a search page

1. Keep the query in the URL. A search then survives a reload, and you can link to it.

```js
// app/routes/search.js
import Route from '@ember/routing/route';

export default class SearchRoute extends Route {
  queryParams = { q: { refreshModel: true } };
}
```

2. Register the route before `addRoutes`, so that the docs wildcard route does not take the path.

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

Keep the `@cached`. `getPromiseState` keys its state on the promise that it receives. A new promise on each access gives a new pending state on each access.

## What a result carries

A result is the manifest entry of the page, and the details of the match.

- `path` and `appRelativePath` are the two path spaces from [`docsManager`](/Runtime/utilities/docs-manager.md). Use `path` for a link.
- `title`, `groupName`, and `headings` are what you show for the result.
- `score` ranks the page. A term in the title scores 100, a term in a heading scores 25, and a term in the prose scores 1.
- `excerptRange` gives the offsets in `text` for the passage that matched.

The results come back in order of score. The title breaks a tie. A page with a score of zero never appears.

## Excerpts

`excerptRange` covers one passage of prose. That passage is the paragraph, the list item, or the footnote with the first term of the match. The range skips a code fence and an HTML block. So an excerpt reads as a sentence about the subject, and not as an example of it.

`stripFormatting` makes that range into a line that reads well.

```gjs
import { stripFormatting } from 'kolay';

<template>
  <p>{{stripFormatting result.text result.excerptRange}}</p>
</template>
```

It removes the markdown syntax, and it collapses the whitespace. It does not compile the markdown, so a page of results stays fast.

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

Style the marks with the name `search-query`.

```css
::highlight(search-query) {
  background: color-mix(in oklab, var(--accent), transparent 65%);
  text-decoration: underline;
}
```

Nothing appears before that rule exists. The modifier uses the [CSS Custom Highlight API](https://developer.mozilla.org/en-US/docs/Web/API/CSS_Custom_Highlight_API). It adds no wrapper elements, and the reader can select the text as you wrote it. A browser without the API shows the excerpt with no marks.

## Pages that the build cannot inline

A `.gjs.md` page compiles at build time, so its source is in the manifest. A plain `.md` page loads when the search needs it: first from your bundle, then from the URL of the page.

A page that kolay cannot read indexes as empty. If a page never appears in the results, look at this first.

## API Reference

<APIDocs @module="declarations/browser" @name="searcher" @package="kolay" />

The store `searcher` returns:

<APIDocs @module="declarations/browser" @name="SearchService" @package="kolay" />

<APIDocs @module="declarations/browser" @name="stripFormatting" @package="kolay" />

<APIDocs @module="declarations/browser" @name="highlightSearch" @package="kolay" />
