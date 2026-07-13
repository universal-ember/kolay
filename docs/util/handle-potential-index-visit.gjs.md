# `handlePotentialIndexVisit`

When using `addRoutes()`, navigating to a group URL (e.g. `/Runtime`) lands on an index route. If that group doesn't have an explicit index page, the user sees a blank page. `handlePotentialIndexVisit` solves this by automatically redirecting to the first page in the group.

## Usage

Call it in the `beforeModel` hook of your page route:

```ts
// routes/page.ts
import Route from '@ember/routing/route';
import { handlePotentialIndexVisit } from 'kolay';

import type RouterService from '@ember/routing/router-service';

type Transition = ReturnType<RouterService['transitionTo']>;

export default class PageRoute extends Route {
  beforeModel(transition: Transition) {
    handlePotentialIndexVisit(this, transition);
  }
}
```

This pairs with `addRoutes()` in your router:

```js
import { addRoutes } from 'kolay';

Router.map(function () {
  addRoutes(this);
});
```

When a user visits `/Runtime` and the `Runtime` group has pages, they'll be redirected to the first page (e.g. `/Runtime/docs/component-signature.md`) instead of seeing a blank index.

## API Reference

<APIDocs @module="declarations/browser" @name="handlePotentialIndexVisit" @package="kolay" />
