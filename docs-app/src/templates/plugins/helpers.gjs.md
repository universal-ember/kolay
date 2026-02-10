# Helper utilities

These utilities can be imported and used within your own projects, as they are already used within `kolay`.
This should allow users to build their own specific set of outputs using the same underlying tools that `kolay` uses.

## `gitRef`

Returns the short git SHA of the current commit. Useful for displaying the deployed version somewhere in your app.

In an ESM environment:

```js
import { gitRef } from "kolay/build";

// in some config
version: gitRef();
```

In a CJS environment (e.g. `ember-cli-build.js`):

```js
const { gitRef } = require("kolay/build/legacy");

// in some config
version: gitRef();
```

<APIDocs @module="declarations/build/plugins" @name="gitRef" @package="kolay" />

## `packageTypes`

<APIDocs @module="declarations/build/plugins" @name="packageTypes" @package="kolay" />

## `virtualFile`

<APIDocs @module="declarations/build/plugins" @name="virtualFile" @package="kolay" />

## `generateTypeDocJSON`

<APIDocs @module="declarations/build/plugins" @name="generateTypeDocJSON" @package="kolay" />
