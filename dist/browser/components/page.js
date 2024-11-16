import Component from '@glimmer/component';
import { service } from '@ember/service';
import { precompileTemplate } from '@ember/template-compilation';
import { setComponentTemplate } from '@ember/component';
import { g, i } from 'decorator-transforms/runtime';

class Page extends Component {
  static {
    setComponentTemplate(precompileTemplate("\n    {{#if this.selected.hasError}}\n      {{yield this.selected.error to=\"error\"}}\n    {{/if}}\n\n    {{#if this.selected.prose}}\n      {{yield this.selected.prose to=\"success\"}}\n    {{/if}}\n  ", {
      strictMode: true
    }), this);
  }
  static {
    g(this.prototype, "selected", [service('kolay/selected')]);
  }
  #selected = (i(this, "selected"), void 0);
}

export { Page, Page as default };
//# sourceMappingURL=page.js.map
