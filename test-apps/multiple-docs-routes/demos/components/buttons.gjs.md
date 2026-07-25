# Buttons demo

Build-time compiled `.gjs.md` from the `demos` source directory,
processed by the second usage of the kolay plugin.

```gjs live
<template>
  <button type="button" data-live-demo>click me</button>
</template>
```

An `hbs` fence can use this usage's `scope` without importing:

```hbs live
<Callout>from this usage's scope</Callout>
```
