# Helper utilities

You can import these utilities into your own project. `kolay` uses them too.
With these tools you can build your own output, with the same tools that `kolay` uses.

## `gitRef`

This function returns the short git SHA of the current commit. Use it to show the deployed version in your app.

In an ESM environment:

```js
import { gitRef } from "kolay/build";

// in some config
version: gitRef();
```

In a CJS environment, for example `ember-cli-build.js`:

```js
const { gitRef } = require("kolay/build/legacy");

// in some config
version: gitRef();
```

```hbs live
<APIDocs @module="declarations/build/plugins" @name="gitRef" @package="kolay" />
```

## `packageTypes`

```hbs live
<APIDocs @module="declarations/build/plugins" @name="packageTypes" @package="kolay" />
```

## `virtualFile`

```hbs live
<APIDocs @module="declarations/build/plugins" @name="virtualFile" @package="kolay" />
```

## `generateTypeDocJSON`

```hbs live
<APIDocs @module="declarations/build/plugins" @name="generateTypeDocJSON" @package="kolay" />
```
