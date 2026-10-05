# `handlePotentialIndexVisit`

Redirects the app's root (`/`) to the first page of your first docs group.

It exists because `/` is your app's URL, not kolay's. A folder or group URL is unambiguously docs, so kolay redirects those itself; `/` might be a page of your own, so nothing happens there unless you ask for it.

## Usage

Call it in your top-level `index` route:

```ts
// routes/index.ts
import Route from '@ember/routing/route';
import { handlePotentialIndexVisit } from 'kolay';

import type Transition from '@ember/routing/transition';

export default class IndexRoute extends Route {
  beforeModel(transition: Transition) {
    handlePotentialIndexVisit(this, transition);
  }
}
```

Leave it out and `/` renders whatever your app puts there.

## Where it does nothing

Calling it anywhere else is harmless but pointless — these URLs redirect on their own:

- a wildcard page route (`routes/page.ts`)
- a mount route (`routes/guides.ts`), whether or not the mount is scoped
- a group's own URL (`/Runtime`), or a folder's (`/Runtime/rendering`)

A folder or group URL goes to its index page: the page named `index` when there is one, and the first page otherwise. That holds however you arrive, including a click on the group's own nav link from a page already inside it.

## API Reference

<APIDocs @module="declarations/browser" @name="handlePotentialIndexVisit" @package="kolay" />
