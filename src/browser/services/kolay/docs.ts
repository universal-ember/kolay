import { cached, tracked } from '@glimmer/tracking';
import { assert } from '@ember/debug';
import Service, { service } from '@ember/service';

import type ApiDocs from './api-docs';
import type Selected from './selected';
import type { Manifest } from './types';
import type RouterService from '@ember/routing/router-service';
import type { UnifiedPlugin } from 'ember-repl';

export type SetupOptions = Parameters<DocsService['setup']>[0];

interface ResolveMap {
  [moduleName: string]: ScopeMap;
}

interface ScopeMap {
  [identifier: string]: unknown;
}

export default class DocsService extends Service {
  @service declare router: RouterService;
  @service('kolay/selected') declare selected: Selected;
  @service('kolay/api-docs') declare apiDocs: ApiDocs;

  @tracked additionalResolves?: ResolveMap;
  @tracked additionalTopLevelScope?: ScopeMap;
  @tracked remarkPlugins?: UnifiedPlugin[];
  @tracked rehypePlugins?: UnifiedPlugin[];
  _docs: Manifest | undefined;

  loadManifest: () => Promise<Manifest> = () =>
    Promise.resolve({
      list: [],
      tree: {},
    } as any);

  setup = async (options: {
    /**
     * The module of the manifest virtual module.
     * This should be set to `await import('kolay/manifest:virtual')
     */
    manifest?: Promise<any>;

    /**
     * The module of the api docs virtual module.
     * This should be set to `await import('kolay/api-docs:virtual')
     */
    apiDocs?: Promise<any>;

    /**
     * Additional invokables that you'd like to have access to
     * in the markdown, without a codefence.
     *
     * By default, the fallowing is available:
     * - for escaping styles / having a clean style-sandbox
     *   - <Shadowed>
     * - for rendering your typedoc:
     *   - <APIDocs>
     *   - <ComponentSignature>
     */
    topLevelScope?: ScopeMap;

    /**
     * Additional modules you'd like to be able to import from.
     * This is in addition the the default modules provided by ember,
     * and allows you to have access to private libraries without
     * needing to publish those libraries to NPM.
     */
    resolve?: { [moduleName: string]: Promise<ScopeMap> };

    /**
     * Provide additional remark plugins to the default markdown compiler.
     *
     * These can be used to add features like notes, callouts, footnotes, etc
     */
    remarkPlugins?: UnifiedPlugin[];
    /**
     * Provide additional rehype plugins to the default html compiler.
     *
     * These can be used to add features syntax-highlighting to pre elements, etc
     */
    rehypePlugins?: UnifiedPlugin[];
  }) => {
    let [manifest, apiDocs, resolve] = await Promise.all([
      options.manifest,
      options.apiDocs,
      promiseHash(options.resolve),
    ]);

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
    assert(
      `Docs' manifest was not loaded. Be sure to call setup() before accessing anything on the docs service.`,
      this._docs,
    );

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
    let [, /* leading slash */ first] =
      this.router.currentURL?.split('/') || [];

    if (!first) return 'root';

    if (!this.availableGroups.includes(first)) return 'root';

    return first;
  }

  selectGroup = (group: string) => {
    assert(
      `Expected group name, ${group}, to be one of ${this.availableGroups.join(', ')}`,
      this.availableGroups.includes(group),
    );

    if (group === 'root') {
      this.router.transitionTo('/');

      return;
    }

    this.router.transitionTo(`/${group}`);
  };

  get availableGroups() {
    let groups = this.manifest?.groups ?? [];

    return groups.map((group) => group.name);
  }

  @cached
  get currentGroup() {
    return this.groupFor(this.selectedGroup);
  }

  groupFor = (groupName: string) => {
    let groups = this.manifest?.groups ?? [];

    let group = groups.find((group) => group.name === groupName);

    assert(
      `Could not find group in manifest under the name ${groupName}. The available groups are: ${groups.map((group) => group.name).join(', ')}`,
      group,
    );

    return group;
  };

  /**
   * Will return false if a url doesn't exist in any group,
   * or the name of the group that contains the page if the url does exist.
   */
  groupForURL = (url: string): false | string => {
    for (let groupName of this.availableGroups) {
      let group = this.groupFor(groupName);
      let page = group.list.find((page) => page.path === url);

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
async function promiseHash<T>(obj?: {
  [key: string]: Promise<T>;
}): Promise<{ [key: string]: T }> {
  let result: Record<string, T> = {};

  if (!obj) {
    return result;
  }

  let keys: string[] = [];
  let promises = [];

  for (let [key, promise] of Object.entries(obj)) {
    keys.push(key);
    promises.push(promise);
  }

  assert(
    `Something went wrong when resolving a promise Hash`,
    keys.length === promises.length,
  );

  let resolved = await Promise.all(promises);

  for (let i = 0; i < resolved.length; i++) {
    let key = keys[i];
    let resolvedValue = resolved[i];

    assert(`Missing key for index ${i}`, key);
    assert(
      `Resolved value for key ${key} is not an object`,
      typeof resolvedValue === 'object',
    );

    result[key] = resolvedValue;
  }

  return result;
}

// DO NOT DELETE: this is how TypeScript knows how to look up your services.
declare module '@ember/service' {
  interface Registry {
    'kolay/docs': DocsService;
  }
}
