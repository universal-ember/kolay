# `handlePotentialIndexVisit`

When using `addRoutes()`, navigating to a group URL (e.g. `/Runtime`) lands on an index route. If that group doesn't have an explicit index page, the user sees a blank page. `handlePotentialIndexVisit` solves this by automatically redirecting to the first page in the group.

It is also where [configured redirects](/development/redirects.md) apply: before the index handling, the visited URL is checked against the project's `redirects` (from `kolay.config.js`), and a match transitions to the rewritten path.

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

When a user visits `/Runtime` and the `Runtime` group has pages, they'll be redirected to the first page (e.g. `/Runtime/rendering/page.md`) instead of seeing a blank index.

It also handles the app's root: on a visit to `/`, there is no group in the URL, so the user is redirected to the first page of the default (first) group. Give your top-level `index` route the same `beforeModel` (e.g. in `routes/index.ts`) to enable this.

## Nested mounts

`addRoutes()` may also be called inside nested routes, mounting each group as its own route (see [using the docs plugin multiple times](/development/configuring-docs.md)) — optionally scoped to a group via `addRoutes(this, 'group-name')`, in which case the mount's path is free to differ from the group's name. Either way, call `handlePotentialIndexVisit` in the mount route's `beforeModel` — visiting the mount's URL (e.g. `/guides`) lands on the mount's own index:

```ts
// routes/guides.ts
import Route from '@ember/routing/route';
import { handlePotentialIndexVisit } from 'kolay';

import type Transition from '@ember/routing/transition';

export default class GuidesRoute extends Route {
  beforeModel(transition: Transition) {
    handlePotentialIndexVisit(this, transition);
  }
}
```

paired with:

```js
import { addRoutes as addGuidesRoutes } from 'virtual:kolay/docs/guides';

Router.map(function () {
  this.route('guides', function () {
    addGuidesRoutes(this);
  });
});
```

The virtual module's `addRoutes` is scoped to its group, so the mount may live anywhere. (An unscoped `addRoutes(this)` from `kolay` works too — its mount's path must then match the group's name.)

## API Reference

<APIDocs @module="declarations/browser" @name="handlePotentialIndexVisit" @package="kolay" />
