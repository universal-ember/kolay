import { cached } from '@glimmer/tracking';
import { assert } from '@ember/debug';
import { service } from '@ember/service';

import { Shadowed } from 'ember-primitives/components/shadowed';
import { createStore } from 'ember-primitives/store';
import { type ModuleMap, setupCompiler } from 'ember-repl';

import { APIDocs, CommentQuery } from '../typedoc/renderer.gts';
import { ComponentSignature } from '../typedoc/signature/component.gts';
import { HelperSignature } from '../typedoc/signature/helper.gts';
import { ModifierSignature } from '../typedoc/signature/modifier.gts';
import { typedocLoader } from './api-docs.ts';

import type { LoadManifest, LoadTypedoc, Manifest } from '../../types.ts';
import type RouterService from '@ember/routing/router-service';

export type SetupOptions = Parameters<DocsService['setup']>[0];

interface ScopeMap {
  [identifier: string]: unknown;
}

export function docsManager() {
  return createStore(document.body, DocsService);
}

class DocsService {
  @service declare router: RouterService;

  private get apiDocs() {
    return typedocLoader();
  }

  _docs: Manifest | undefined;

  loadManifest: LoadManifest = () => Promise.resolve({ groups: [] });

  setup = async (options: {
    /**
     * The module of the manifest virtual module.
     * This should be set to `await import('kolay/manifest:virtual')
     */
    manifest?: Promise<{ load: LoadManifest }>;

    /**
     * The module of the api docs virtual module.
     * This should be set to `await import('kolay/api-docs:virtual')
     */
    apiDocs?: Promise<{ packageNames: string[]; loadApiDocs: LoadTypedoc }>;

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
    resolve?: ModuleMap;

    /**
     * Provide additional remark plugins to the default markdown compiler.
     *
     * These can be used to add features like notes, callouts, footnotes, etc
     */
    remarkPlugins?: unknown[];
    /**
     * Provide additional rehype plugins to the default html compiler.
     *
     * These can be used to add features syntax-highlighting to pre elements, etc
     */
    rehypePlugins?: unknown[];
  }) => {
    const [manifest, apiDocs] = await Promise.all([options.manifest, options.apiDocs]);

    if (manifest) {
      this.loadManifest = manifest.load;
    }

    if (apiDocs) {
      this.apiDocs._packages = apiDocs.packageNames;
      this.apiDocs.loadApiDocs = apiDocs.loadApiDocs;
    }

    const md = {
      remarkPlugins: options.remarkPlugins ?? [],
      rehypePlugins: options.rehypePlugins ?? [],
    };

    const scope = {
      ...options.topLevelScope,
      Shadowed,
      APIDocs,
      CommentQuery,
      ComponentSignature,
      ModifierSignature,
      HelperSignature,
    };

    await Promise.all([
      (async () => {
        this._docs = await this.loadManifest();
      })(),
      // eslint-disable-next-line @typescript-eslint/await-thenable
      setupCompiler(this, {
        options: {
          md,
          gmd: {
            scope,
            ...md,
          },
          hbs: {
            scope,
          },
        },
        modules: {
          kolay: () => import('../index.ts'),
          'kolay/components': () => import('../components.ts'),
          'kolay/typedoc': () => import('../typedoc/index.ts'),
          ...options.resolve,
        },
      }),
    ]);

    // type-narrowed version of _docs, above
    return this.manifest;
  };

  get docs() {
    assert(
      `Docs' manifest was not loaded. Be sure to call setup() before accessing anything on the docs service.`,
      this._docs
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
    const [, /* leading slash */ first] = this.router.currentURL?.split('/') || [];

    if (!first) return 'root';

    if (!this.availableGroups.includes(first)) return 'root';

    return first;
  }

  selectGroup = (group: string) => {
    assert(
      `Expected group name, ${group}, to be one of ${this.availableGroups.join(', ')}`,
      this.availableGroups.includes(group)
    );

    if (group === 'root') {
      this.router.transitionTo('/');

      return;
    }

    this.router.transitionTo(`/${group}`);
  };

  get availableGroups() {
    const groups = this.manifest?.groups ?? [];

    return groups.map((group) => group.name);
  }

  @cached
  get currentGroup() {
    return this.groupFor(this.selectedGroup);
  }

  groupFor = (groupName: string) => {
    const groups = this.manifest?.groups ?? [];

    const group = groups.find((group) => group.name === groupName);

    assert(
      `Could not find group in manifest under the name ${groupName}. The available groups are: ${groups.map((group) => group.name).join(', ')}`,
      group
    );

    return group;
  };

  /**
   * Will return false if a url doesn't exist in any group,
   * or the name of the group that contains the page if the url does exist.
   */
  groupForURL = (url: string): false | string => {
    for (const groupName of this.availableGroups) {
      const group = this.groupFor(groupName);
      const page = group.list.find((page) => page.path === url);

      if (page) {
        return groupName;
      }
    }

    return false;
  };
}
