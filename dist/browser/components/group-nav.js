import Component from '@glimmer/component';
import { service } from '@ember/service';
import { precompileTemplate } from '@ember/template-compilation';
import { setComponentTemplate } from '@ember/component';
import { g, i } from 'decorator-transforms/runtime';

class GroupNav extends Component {
  static {
    g(this.prototype, "docs", [service('kolay/docs')]);
  }
  #docs = (i(this, "docs"), void 0);
  static {
    g(this.prototype, "router", [service]);
  }
  #router = (i(this, "router"), void 0);
  get homeName() {
    return this.args.homeName ?? 'Home';
  }
  get groups() {
    return this.docs.availableGroups.map(groupName => {
      if (groupName === 'root') return {
        text: this.homeName,
        value: '/'
      };
      return {
        text: groupName,
        value: `/${groupName}`
      };
    });
  }
  isActive = subPath => {
    if (subPath === '/') return false;
    return this.router.currentURL?.startsWith(subPath);
  };
  get activeClass() {
    return this.args.activeClass ?? 'active';
  }
  static {
    setComponentTemplate(precompileTemplate("\n    <nav aria-label=\"Groups\" ...attributes>\n      <ul>\n        {{#each this.groups as |group|}}\n          <li>\n            <a href={{group.value}} class={{if (this.isActive group.value) this.activeClass}}>\n\n              {{#if (has-block)}}\n                {{yield group.text}}\n              {{else}}\n                {{group.text}}\n              {{/if}}\n\n            </a>\n          </li>\n        {{/each}}\n      </ul>\n    </nav>\n  ", {
      strictMode: true
    }), this);
  }
}

export { GroupNav };
//# sourceMappingURL=group-nav.js.map
