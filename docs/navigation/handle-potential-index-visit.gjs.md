# `handlePotentialIndexVisit`

Navigating to the app's root (`/`) lands on an index route that names no group, so there is nothing to render. `handlePotentialIndexVisit` redirects to the first page of the default (first) group instead.

Group URLs and folder URLs no longer need it — `setupKolay` wires those to the router itself. See [a page tree's own URL needs no wiring](#a-page-trees-own-url-needs-no-wiring) below.

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

On a visit to `/`, the user is redirected to the first page of the default (first) group. Give your top-level `index` route the same `beforeModel` (e.g. in `routes/index.ts`) to enable this.

## A page tree's own URL needs no wiring

A folder inside a group — say `/Runtime/rendering` — is a real place in the docs, but has no document of its own. Visiting it redirects to that folder's first page, and you call nothing to make it happen: `setupKolay` wires it to the router. Sorting puts a folder's index page at the top of it, so a folder with one goes there; a folder without goes to its first ordered page.

A group's own URL behaves the same way, whether the group's name is in the URL (a top-level mount, `/Runtime`) or the mount has a path of its own (`/guides`). That holds however you arrive — including a click on the group's nav link from a page already inside the mount, which no route hook can serve, because Ember does not re-enter a mount route that is already active.

`handlePotentialIndexVisit` is still needed for the app's root (`/`), which names no group for a transition to resolve.

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
