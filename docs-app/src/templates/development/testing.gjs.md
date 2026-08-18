# Testing

A test needs a setup step. Then only the tests that need the kolay behavior use it.

With qunit:

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

In an ember application test, the application route already called the `setup` method
of the docs service. There you do not need this.

## `selectGroup`

Your docs can have more than one group, with one `docs()` usage for each group. `selectGroup` changes the active group in a test. Use it to test the content or the behavior of one group.

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

The first argument is the `owner`, or any object that received an owner from `setOwner`, for example `this` in a test. The second argument is the group name. If you omit it, the name is `'root'`.
