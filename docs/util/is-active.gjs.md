# Is Active

## `isActive`

Whether a manifest item (`Page` or `Collection`) is the currently visited page. Kolay's own `PageNav` uses this for its active-link styling; it is exported for consumers building custom navigation.

```gjs
import { isActive } from 'kolay';

// in a component with the router service injected
isActive(item, this.router.currentURL, this.router.rootURL);
```

Behavior notes:

- rootURL-aware: manifest paths include the app's `rootURL`, while `router.currentURL` is app-relative — the comparison accounts for that, so it works under custom `rootURL` deploys (e.g. a PR preview at `/pr-1234/`).
- Pages are visitable with and without the `.md` extension, so both forms match.
- Query params and the hash on the current URL are ignored.
- A `Collection` is active when any page within it (recursively) is — useful for highlighting or expanding the branch of a nav tree that contains the current page.
- The app root (`/`) is never active.

## API Reference

<APIDocs @module="declarations/browser" @name="isActive" @package="kolay" />
