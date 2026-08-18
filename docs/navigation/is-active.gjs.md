# Is Active

## `isActive`

This function tells you if a manifest item (`Page` or `PageTree`) is the current page. The `PageNav` of kolay uses it to style the active link. Kolay exports it for your own navigation.

```gjs
import { isActive } from 'kolay';

// in a component with the router service injected
isActive(item, this.router.currentURL);
```

Notes on the behavior:

- The function knows about the `rootURL`. It compares the `appRelativePath` of the item, which the build wrote into the manifest, with the app-relative `router.currentURL`. So it works under a custom `rootURL` deploy, for example a pull request preview at `/pr-1234/`, with no conversion.
- A page opens with and without the `.md` extension, so both forms match.
- The function ignores the query params and the hash of the current URL.
- A `PageTree` is active when one of its pages is active, at any depth. Use this to highlight or to open the branch of a nav tree that holds the current page.
- The app root (`/`) is never active.

## API Reference

<APIDocs @module="declarations/browser" @name="isActive" @package="kolay" />
