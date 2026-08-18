# `handlePotentialIndexVisit`

With `addRoutes()`, a visit to a group URL, for example `/Runtime`, goes to an index route. If that group has no index page, the reader sees an empty page. `handlePotentialIndexVisit` corrects this. It redirects to the first page in the group.

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

Use it with `addRoutes()` in your router:

```js
import { addRoutes } from 'kolay';

Router.map(function () {
  addRoutes(this);
});
```

A reader opens `/Runtime`, and the `Runtime` group has pages. Kolay then redirects to the first page, for example `/Runtime/rendering/page.md`, and not to an empty index.

The function also covers the root of the app. A visit to `/` has no group in the URL, so kolay redirects to the first page of the first group. To enable this, give your top-level `index` route the same `beforeModel`, for example in `routes/index.ts`.

## Nested mounts

You can also call `addRoutes()` inside a nested route. Each group is then its own route. Read [how to use the docs plugin more than one time](/development/configuring-docs.md). You can scope the call to a group with `addRoutes(this, 'group-name')`. The path of the mount can then be different from the name of the group. In both cases, call `handlePotentialIndexVisit` in the `beforeModel` of the mount route. A visit to the URL of the mount, for example `/guides`, goes to the index of the mount:

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

with this router:

```js
import { addRoutes as addGuidesRoutes } from 'virtual:kolay/docs/guides';

Router.map(function () {
  this.route('guides', function () {
    addGuidesRoutes(this);
  });
});
```

The `addRoutes` of the virtual module is scoped to its group, so the mount can be anywhere. An `addRoutes(this)` from `kolay` with no group also works. The path of its mount must then be the same as the name of the group.

## API Reference

<APIDocs @module="declarations/browser" @name="handlePotentialIndexVisit" @package="kolay" />
