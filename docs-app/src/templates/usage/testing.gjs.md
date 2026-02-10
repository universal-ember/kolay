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

## `selectGroup`

If your docs have multiple groups (configured via the `kolay()` build plugin), you can switch the active group in tests using `selectGroup`. This is useful when you need to test content or behavior that lives under a specific docs group.

```js
import { setupKolay, selectGroup } from "kolay/test-support";

module("my test group", function (hooks) {
  setupRenderingTest(hooks);
  setupKolay(hooks);

  test("viewing a specific group", async function (assert) {
    selectGroup(this.owner, "api");

    // assertions against the selected group's docs...
  });
});
```

The first argument can be the `owner` or any object that has had `setOwner` applied to it (such as `this` inside a test). The second argument is the group name — it defaults to `'root'` if omitted.
