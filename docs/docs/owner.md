# Owner

If your demos happen to need access to services or legacy "global" hbs components, you may want to specify a custom owner to the runtime compiler


By default, though, we inherit the application owner as is.

For example, if we want to access the pageTitle service from `ember-page-title` (something that is configured unique to this docs app, and not built in to the framework by default), we can do so

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

## Configuring the owner

```js

setupKolay(this, {

  /** ... other options ... **/
})
```
