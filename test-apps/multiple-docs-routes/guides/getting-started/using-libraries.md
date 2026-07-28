# Using libraries

A runtime-compiled page whose live fence imports npm packages taught by two `importEntrypoints()` usages:

```gjs live
import { noop } from "@universal-ember/test-support";
import { noop as wildcardNoop } from "@universal-ember/test-support/utils";
import Resolver from "ember-strict-application-resolver";

<template>
  <p data-demo="entrypoints">{{if noop "package import resolved"}}</p>
  <p data-demo="entrypoints-wildcard">{{if wildcardNoop "wildcard entrypoint resolved"}}</p>
  <p data-demo="entrypoints-2">{{if Resolver "second usage resolved"}}</p>
</template>
```
