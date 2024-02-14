import { tracked } from '@glimmer/tracking';
import Service, { service } from '@ember/service';

import { use } from 'ember-resources';
import { RemoteData } from 'reactiveweb/remote-data';

import type Selected from './selected';
import type { Manifest } from './types';
import type RouterService from '@ember/routing/router-service';

const DEFAULT_MANIFEST = '/docs/manifest.json';
const DEFAULT_API_DOCS = '/api-docs.json';

export default class DocsService extends Service {
  @service declare router: RouterService;
  @service('kolay/selected') declare selected: Selected;

  @tracked manifestLocation = DEFAULT_MANIFEST;
  @tracked apiDocsLocation = DEFAULT_API_DOCS;
  @tracked additionalResolves?: Record<string, unknown>;
  @tracked additionalTopLevelScope?: Record<string, unknown>;
  @tracked remarkPlugins?: unknown[];

  @use docs = RemoteData<Manifest>(() => `/docs/manifest.json`);

  setup = (options: {
    /**
     * The location of the manifest JSON file created with
     * the `createManifest` plugin.
     *
     * This must be allowed by CORS, as it is requested via `fetch`
     *
     * The default is '/docs/manifest.json'
     */
    manifest?: string;

    /**
     * The location of the typedoc output JSON file created with 
     * the `typedoc` plugin.
     *
     * This must be allowed by CORS, as it is requested via `fetch`
     *
     * The default is '/api-docs.json'
     */
    typedoc?: string;

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
    topLevelScope?: Record<string, unknown>;

    /**
     * Additional modules you'd like to be able to import from.
     * This is in addition the the default modules provided by ember,
     * and allows you to have access to private libraries without 
     * needing to publish those libraries to NPM.
     */
    resolve?: Record<string, unknown>;

    /**
     * Provide additional remark plugins to the default markdown compiler.
     *
     * These can be used to add fetaures like notes, callouts, footnotes, etc
     */
    remarkPlugins?: unknown[];
  }) => {
    if (options.manifest) {
      this.manifestLocation = options.manifest;
    }

    if (options.typedoc) {
      this.apiDocsLocation = options.typedoc;
    }

    if (options.resolve) {
      this.additionalResolves = options.resolve;
    }

    if (options.topLevelScope) {
      this.additionalTopLevelScope = options.topLevelScope;
    }
  };

  /**
  * The flat list of all pages.
  * Each page knows the name of its immediate parent.
  */
  get pages() {
    return this.docs.value?.list ?? [];
  }

  /**
  * The full page hierachy
  */
  get tree() {
    return this.docs.value?.tree ?? {};
  }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your services.
declare module '@ember/service' {
  interface Registry {
    'kolay/docs': DocsService;
  }
}
