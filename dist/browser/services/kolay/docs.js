import { tracked, cached } from '@glimmer/tracking';
import { assert } from '@ember/debug';
import Service, { service } from '@ember/service';
import { g, i, n } from 'decorator-transforms/runtime';

class DocsService extends Service {
  static {
    g(this.prototype, "router", [service]);
  }
  #router = (i(this, "router"), void 0);
  static {
    g(this.prototype, "selected", [service('kolay/selected')]);
  }
  #selected = (i(this, "selected"), void 0);
  static {
    g(this.prototype, "apiDocs", [service('kolay/api-docs')]);
  }
  #apiDocs = (i(this, "apiDocs"), void 0);
  static {
    g(this.prototype, "additionalResolves", [tracked]);
  }
  #additionalResolves = (i(this, "additionalResolves"), void 0);
  static {
    g(this.prototype, "additionalTopLevelScope", [tracked]);
  }
  #additionalTopLevelScope = (i(this, "additionalTopLevelScope"), void 0);
  static {
    g(this.prototype, "remarkPlugins", [tracked]);
  }
  #remarkPlugins = (i(this, "remarkPlugins"), void 0);
  static {
    g(this.prototype, "rehypePlugins", [tracked]);
  }
  #rehypePlugins = (i(this, "rehypePlugins"), void 0);
  loadManifest = () => Promise.resolve({
    list: [],
    tree: {}
  });
  setup = async options => {
    let [manifest, apiDocs, resolve] = await Promise.all([options.manifest, options.apiDocs, promiseHash(options.resolve)]);
    if (options.manifest) {
      this.loadManifest = manifest.load;
    }
    if (options.apiDocs) {
      this.apiDocs._packages = apiDocs.packages;
      this.apiDocs.loadApiDocs = apiDocs.loadApiDocs;
    }
    if (options.resolve) {
      this.additionalResolves = resolve;
    }
    if (options.topLevelScope) {
      this.additionalTopLevelScope = options.topLevelScope;
    }
    if (options.remarkPlugins) {
      this.remarkPlugins = options.remarkPlugins;
    }
    if (options.rehypePlugins) {
      this.rehypePlugins = options.rehypePlugins;
    }
    this._docs = await this.loadManifest();
    return this.manifest;
  };
  get docs() {
    assert(`Docs' manifest was not loaded. Be sure to call setup() before accessing anything on the docs service.`, this._docs);
    return this._docs;
  }
  get manifest() {
    return this.docs;
  }

  /**
   * The flat list of all pages.
   * Each page knows the name of its immediate parent.
   */
  get pages() {
    return this.currentGroup?.list ?? [];
  }

  /**
   * The full page hierachy
   */
  get tree() {
    return this.currentGroup?.tree ?? {};
  }

  /**
   * We use the URL for denoting which group we're looking at.
   * The first segment of the URL will either be a group,
   * or part of the path segment on the root namespace.
   *
   * This does open us up for collisions, so maybe
   * we'll need to alias "root" with something, or at
   * the very least not use a non-path segement for it.
   */
  get selectedGroup() {
    let [, /* leading slash */first] = this.router.currentURL?.split('/') || [];
    if (!first) return 'root';
    if (!this.availableGroups.includes(first)) return 'root';
    return first;
  }
  selectGroup = group => {
    assert(`Expected group name, ${group}, to be one of ${this.availableGroups.join(', ')}`, this.availableGroups.includes(group));
    if (group === 'root') {
      this.router.transitionTo('/');
      return;
    }
    this.router.transitionTo(`/${group}`);
  };
  get availableGroups() {
    let groups = this.manifest?.groups ?? [];
    return groups.map(group => group.name);
  }
  get currentGroup() {
    return this.groupFor(this.selectedGroup);
  }
  static {
    n(this.prototype, "currentGroup", [cached]);
  }
  groupFor = groupName => {
    let groups = this.manifest?.groups ?? [];
    let group = groups.find(group => group.name === groupName);
    assert(`Could not find group in manifest under the name ${groupName}. The available groups are: ${groups.map(group => group.name).join(', ')}`, group);
    return group;
  };

  /**
   * Will return false if a url doesn't exist in any group,
   * or the name of the group that contains the page if the url does exist.
   */
  groupForURL = url => {
    for (let groupName of this.availableGroups) {
      let group = this.groupFor(groupName);
      let page = group.list.find(page => page.path === url);
      if (page) {
        return groupName;
      }
    }
    return false;
  };
}

/**
 * RSVP.hash, but native
 */
async function promiseHash(obj) {
  let result = {};
  if (!obj) {
    return result;
  }
  let keys = [];
  let promises = [];
  for (let [key, promise] of Object.entries(obj)) {
    keys.push(key);
    promises.push(promise);
  }
  assert(`Something went wrong when resolving a promise Hash`, keys.length === promises.length);
  let resolved = await Promise.all(promises);
  for (let i = 0; i < resolved.length; i++) {
    let key = keys[i];
    let resolvedValue = resolved[i];
    assert(`Missing key for index ${i}`, key);
    assert(`Resolved value for key ${key} is not an object`, typeof resolvedValue === 'object');
    result[key] = resolvedValue;
  }
  return result;
}

// DO NOT DELETE: this is how TypeScript knows how to look up your services.

export { DocsService as default };
//# sourceMappingURL=docs.js.map
