# Owner

A demo inherits the owner of the application.

So a demo can use a service from the app. For example, the `pageTitle` service comes from `ember-page-title`. This docs app configures that service, and the framework does not supply it:

```gjs live preview
import Component from '@glimmer/component';
import { service } from '@ember/service';

export default class Demo extends Component {
  @service pageTitle;

  get tokens() {
    return this.pageTitle.tokens.map(x => x.title);
  }

  <template>
    <p style="border: 1px dashed; padding: 1rem;">
      {{this.tokens}}
    </p>
  </template>
}
```
