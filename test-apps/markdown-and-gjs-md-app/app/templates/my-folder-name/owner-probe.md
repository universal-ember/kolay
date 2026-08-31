# Owner probe

This page is plain markdown, so it and its live snippet render through the
runtime compilers — the snippet's component resolves `getOwner(...)` through
the owner configured by the application route's `formatOptions`. (A `.gjs.md`
page would compile at build time and never consult the runtime compiler.)

```gjs live no-shadow
import Component from "@glimmer/component";
import { getOwner } from "@ember/owner";

export default class OwnerProbe extends Component {
  get probed() {
    return getOwner(this)?.lookup("kolay-test:probe");
  }

  <template>
    <span data-owner-probe>{{this.probed}}</span>
  </template>
}
```
