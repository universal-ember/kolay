# memory-scroll

[GitHub](https://github.com/ef4/memory-scroll) · [npm](https://www.npmjs.com/package/memory-scroll)

memory-scroll supplies modifiers that keep the scroll position correct while a reader navigates. This site uses it for the page scroll. A move to a new page scrolls to the top. A move back or forward restores the position of that history entry.

The complete behavior is one modifier, `rememberDocumentScroll`, with a key from the current history entry:

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

The key is the `uuid` of the history entry, which the location of Ember writes. The key is not the URL. A click on a link makes a new entry, so memory-scroll sees a new key and scrolls to `0`. A move back or forward returns to an entry that exists, and the modifier recorded the position of that entry. The same page then behaves correctly by both routes.

Render the modifier one time, in a place that is always on screen. This site puts it in the application template.

If your app resolves its services from an explicit module registry, export the service of the addon again, so the resolver finds it:

```js
// app/services/memory-scroll.js
export { default } from "memory-scroll/services/memory-scroll";
```

memory-scroll also has `memoryScroll` and `scrollTo` for more control. `memoryScroll` remembers the position of one scrollable element. `scrollTo` scrolls to a position each time a key changes.
