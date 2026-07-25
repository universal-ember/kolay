# memory-scroll

[GitHub](https://github.com/ef4/memory-scroll) · [npm](https://www.npmjs.com/package/memory-scroll)

memory-scroll provides modifiers for keeping scroll positions sensible as users navigate. This site uses it for its page-scroll behavior: navigating to a page scrolls to the top, while going back (or forward) restores that history entry's position.

The whole behavior is one modifier — `rememberDocumentScroll` — keyed by the current history entry:

```gts
import Component from "@glimmer/component";
import { service } from "@ember/service";
import rememberDocumentScroll from "memory-scroll/modifiers/remember-document-scroll";

class ScrollBehavior extends Component {
  @service router;

  get key() {
    this.router.currentURL; // recompute on every navigation

    return String(window.history.state?.uuid ?? this.router.currentURL);
  }

  <template>
    <div aria-hidden="true" {{rememberDocumentScroll key=this.key}}></div>
  </template>
}
```

Why the history entry's `uuid` (stamped by Ember's location) instead of the URL: a link click creates a fresh entry — a key memory-scroll has never seen, so it scrolls to `0` — while back/forward revisits an existing entry, whose position the modifier has been recording live. The same page reached two different ways behaves correctly in both.

Render it once, anywhere that's always on screen (this site puts it in the application template).

If your app resolves services from an explicit module registry, re-export the addon's service so it can be found:

```js
// app/services/memory-scroll.js
export { default } from "memory-scroll/services/memory-scroll";
```

memory-scroll also ships `memoryScroll` (remember an individual scrollable element's position) and `scrollTo` (always scroll to a position when a key changes) for finer-grained control.
