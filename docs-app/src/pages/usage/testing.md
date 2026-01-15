---
layout: ../../layouts/MarkdownLayout.astro
title: Testing
---

# Testing

Testing will require a setup phase so that only your tests that actually need the kolay behavior will cause the kolay behavior to be used.

If using qunit,

```js
import { setupKolay } from "kolay/test-support";

module("my test group", function (hooks) {
  setupRenderingTest(hooks);
  setupKolay(hooks);

  test("self", async function (assert) {
    // ...
  });
});
```

In ember application tests, the `setup` method from the docs service
will have already been called from the application route, so this isn't needed.
