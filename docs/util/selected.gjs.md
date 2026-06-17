# `selected`

Access the reactive state for the currently selected/visible page. This store manages loading the compiled page content, resolving it from the URL, and providing the rendered component.

This is primarily used internally by the `<Page />` component, but is available for advanced use cases where you need direct access to the current page's compilation state.

```js
import { selected } from 'kolay';

// inside a class with an owner
const current = selected(this);

current.page;           // the current Page object
current.component;      // the compiled component (if ready)
current.isLoading;      // whether the page is still loading/compiling
current.error;          // any error that occurred during compilation
```

## API Reference

<APIDocs @module="declarations/browser" @name="selected" @package="kolay" />

