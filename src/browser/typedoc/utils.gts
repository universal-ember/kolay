import Component from '@glimmer/component';
import { assert } from '@ember/debug';

import { Provide } from 'ember-primitives/dom-context';
import { use } from 'ember-resources';
import { getPromiseState } from 'reactiveweb/get-promise-state';
import { keepLatest } from 'reactiveweb/keep-latest';
import { ConsoleLogger, Deserializer, FileRegistry, type ProjectReflection } from 'typedoc/browser';

import { typedocLoader } from '../services/api-docs.ts';

import type { TOC } from '@ember/component/template-only';
import type { Reflection } from 'typedoc';

export function findChildDeclaration(info: Reflection, name: string) {
  if (!info.isDeclaration()) {
    return;
  }

  return info.children?.find((child) => child.variant === 'declaration' && child.name === name);
}

export const infoFor = (
  project: ProjectReflection,
  module: string,
  name: string
): Reflection | undefined => {
  const moduleDoc = project.getChildByName([module]);

  assert(
    `Could not find module by name: ${module}. Make sure that the d.ts file is present in the generated api docs.`,
    moduleDoc
  );

  const found = moduleDoc.getChildByName([name]);

  return found;
};

export const Query: TOC<{
  Args: { module: string; name: string; info: ProjectReflection };
  Blocks: { default: [Reflection]; notFound: [] };
}> = <template>
  {{#let (infoFor @info @module @name) as |info|}}
    {{#if info}}
      {{yield info}}
    {{else}}
      {{yield to='notFound'}}
    {{/if}}
  {{/let}}
</template>;

const loaderCache = new Map<string, () => Promise<ProjectReflection>>();

/**
 * Resolved typedoc projects keyed by package name. Mirrors the moduleCache
 * pattern in `services/selected.ts`: once a project is loaded + deserialized
 * we hold onto it so subsequent `<Load>` invocations (and rehydration of any
 * `<APIDocs>` block) skip both the `fetch` and the deserialize step entirely.
 *
 * Without this, every `<Load>` on rehydration starts with `request.isLoading
 * = true` and the SSG-rendered `<section>` gets unmounted for the duration
 * of the fetch — a visible FOUC of about a second on pages that render typedoc.
 *
 * Call {@link prewarmTypedocCache} from your client entry, before booting
 * Ember, to populate this for the packages a page references.
 */
const projectCache = new Map<string, ProjectReflection>();

/**
 * Pre-load and deserialize the typedoc JSON for a given package so the
 * `<APIDocs>` / `<Load>` first render on rehydration is synchronous.
 *
 * Intended to be called from a client entry like:
 *
 * ```ts
 * import { prewarmTypedocCache } from 'kolay';
 * await Promise.all([
 *   prefetchPage(window.location.pathname),
 *   prewarmTypedocCache('kolay'),
 * ]);
 * Application.create(config.APP);
 * ```
 *
 * Safe to call repeatedly: subsequent calls for the same package return the
 * cached project synchronously.
 *
 * @param pkg The package name configured in `apiDocs({ packages: [...] })`
 * @param loader A fetcher that returns the typedoc JSON Response. In most
 *   apps you'll plumb this from `typedocLoader(owner).load`; the helper is
 *   factored out so it can also be driven from a context that doesn't yet
 *   have an Ember owner (e.g. client entry before `Application.create`).
 */
export async function prewarmTypedocCache(
  pkg: string,
  loader: (name: string) => Promise<Response>
): Promise<ProjectReflection | undefined> {
  if (projectCache.has(pkg)) return projectCache.get(pkg);

  try {
    const req = await loader(pkg);
    const json = await req.json();

    const logger = new ConsoleLogger();
    const deserializer = new Deserializer(logger);
    const project = deserializer.reviveProject('API Docs', json, {
      projectRoot: '/',
      registry: new FileRegistry(),
    });

    projectCache.set(pkg, project);

    return project;
  } catch {
    return;
  }
}

export class Load extends Component<{
  Args: {
    module: string;
    name: string;
    package: string;
  };
  Blocks: { default: [Reflection, ProjectReflection] };
}> {
  get #apiDocs() {
    return typedocLoader(this);
  }

  /**
   * Either a synchronous { resolved } state (when the project was already
   * deserialized — common on rehydration thanks to `prewarmTypedocCache`)
   * or a reactive promise state that hydrates a fresh fetch.
   *
   * The branch is important for rehydration: a synchronous resolved state
   * lets `<section>` render on the very first Glimmer pass, matching the
   * SSG-emitted DOM. Going through `getPromiseState` always starts in
   * `isLoading: true` for at least one microtask, which is enough for
   * Glimmer to render the "Loading api docs..." branch instead and unmount
   * everything underneath.
   */
  get request():
    | { isLoading: boolean; error: unknown; resolved: ProjectReflection | undefined } {
    const { package: pkg } = this.args;

    if (pkg) {
      const cached = projectCache.get(pkg);

      if (cached) {
        return { isLoading: false, error: null, resolved: cached };
      }
    }

    return getPromiseState(this.#createProject);
  }

  @use resolved = keepLatest({
    value: () => this.request.resolved,
    when: () => this.request.isLoading,
  });

  get #createProject() {
    const { package: pkg } = this.args;

    if (!pkg) {
      throw new Error(`A @package must be specified to load.`);
    }

    const seen = loaderCache.get(pkg);

    if (seen) {
      return seen;
    }

    const loadNew = async (): Promise<ProjectReflection> => {
      const cachedProject = projectCache.get(pkg);

      if (cachedProject) return cachedProject;

      const req = await this.#apiDocs.load(pkg);
      const json = await req.json();

      const logger = new ConsoleLogger();
      const deserializer = new Deserializer(logger);
      const project = deserializer.reviveProject('API Docs', json, {
        projectRoot: '/',
        registry: new FileRegistry(),
      });

      projectCache.set(pkg, project);

      return project;
    };

    loaderCache.set(pkg, loadNew);

    return loadNew;
  }

  <template>
    {{#if this.request.isLoading}}
      Loading api docs...
    {{/if}}

    {{#if this.request.error}}
      {{errorFor this.request.error}}
    {{/if}}

    {{#if this.request.resolved}}
      <section>
        <Query @info={{this.request.resolved}} @module={{@module}} @name={{@name}} as |type|>
          <Provide @data={{this.request.resolved}} @key='project'>
            {{yield type this.request.resolved}}
          </Provide>
        </Query>
      </section>
    {{/if}}
  </template>
}

function errorFor(error: unknown): string | undefined {
  if (typeof error === 'object' && null !== error) {
    if ('reason' in error && typeof error.reason === 'string') {
      return error.reason;
    }
  }

  if (error instanceof Error) {
    return `Error loading API docs: ${error.message}`;
  }

  return `Error loading API docs: ${String(error)}`;
}
