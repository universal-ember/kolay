# Using libraries

A runtime-compiled page whose live fence imports an npm package taught by `importEntrypoints()`:

```gjs live
import { noop } from "@universal-ember/test-support";

<template>
  <p data-demo="entrypoints">{{if noop "package import resolved"}}</p>
</template>
```
