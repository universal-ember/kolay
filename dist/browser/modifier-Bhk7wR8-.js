import { Heading } from 'ember-primitives/components/heading';
import { precompileTemplate } from '@ember/template-compilation';
import { setComponentTemplate } from '@ember/component';
import templateOnly from '@ember/component/template-only';
import Component from '@glimmer/component';
import { assert } from '@ember/debug';
import { Provide, Consume } from 'ember-primitives/dom-context';
import { resourceFactory, resource, use } from 'ember-resources';
import { getPromiseState } from 'reactiveweb/get-promise-state';
import { keepLatest } from 'reactiveweb/keep-latest';
import { ConsoleLogger, Deserializer, FileRegistry } from 'typedoc/browser';
import { createStore } from 'ember-primitives/store';
import { isDestroying, isDestroyed, registerDestructor } from '@ember/destroyable';
import { g, i } from 'decorator-transforms/runtime';
import { hash } from '@ember/helper';
import { getOwner } from '@ember/owner';
import { compile, getCompiler } from 'ember-repl';
import { ExternalLink } from 'ember-primitives/components/external-link';

// import { lru } from '../../utils.ts';

function compileText(owner, text) {
  // return lru(text, () =>
  return compile(getCompiler(owner), text, {
    /**
     * Documentation can only be in markdown.
     */
    format: 'glimdown'
  });
  // );
}
function Compiled(textFn) {
  return resource(({
    owner
  }) => {
    const text = typeof textFn === 'function' ? textFn() : textFn;
    return compileText(owner, text);
  });
}

// template-only support
resourceFactory(Compiled);

function isReference$1(x) {
  if (!x) return false;
  return x.type === 'reference';
}
function isLiteral(x) {
  if (!x) return false;
  if (typeof x !== 'object') return false;
  if (x === null) return false;
  if (!('type' in x)) return false;
  return x.type === 'literal';
}

const SECRET = Symbol.for('__kolay__secret__context__');

/**
 * same logic in the setup.js plugin
 */
function setupSecret(owner) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
  const secret = window[SECRET] ||= {};
  secret.owners ||= new Set();
  secret.owners.add(owner);
  registerDestructor(owner, () => secret.owners.delete(owner));
}
function getKey(_owner) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
  const secret = window[SECRET];
  for (const owner of secret.owners) {
    const isDanger = isDestroying(owner) || isDestroyed(owner);
    if (!isDanger) return owner;
  }
  assert(`Expected to have had setupKolay called from 'kolay/setup'. Be sure to call setupKolay before trying to use any of Kolay's components`);
}

function typedocLoader(context) {
  const owner = getKey();
  return createStore(owner, DocsLoader);
}
class DocsLoader {
  _packages = [];
  loadApiDocs = {};
  get packages() {
    assert(`packages was never set. Did you forget to import 'kolay/api-docs:virtual' and set it to 'apiDocs' when calling docs.setup()?`, this._packages);
    return this._packages;
  }
  load = name => {
    assert(`loadApiDocs was never set, did you forget to pass it do docs.setup?`, this.loadApiDocs);
    const loader = this.loadApiDocs[name];
    assert(`Could load API Docs for ${name}. 'loadApiDocs' did not now how to find ${name}. Was '${name}' including in the build config?`, loader);
    return loader();
  };
}

function findChildDeclaration(info, name) {
  if (!info.isDeclaration()) {
    return;
  }
  return info.children?.find(child => child.variant === 'declaration' && child.name === name);
}
const infoFor = (project, module, name) => {
  const moduleDoc = project.getChildByName([module]);
  assert(`Could not find module by name: ${module}. Make sure that the d.ts file is present in the generated api docs.`, moduleDoc);
  const found = moduleDoc.getChildByName([name]);
  return found;
};
const Query = setComponentTemplate(precompileTemplate("{{#let (infoFor @info @module @name) as |info|}}\n  {{#if info}}\n    {{yield info}}\n  {{else}}\n    {{yield to=\"notFound\"}}\n  {{/if}}\n{{/let}}", {
  strictMode: true,
  scope: () => ({
    infoFor
  })
}), templateOnly());
const cache = new Map();
class Load extends Component {
  get #apiDocs() {
    return typedocLoader();
  }
  get request() {
    return getPromiseState(this.#createProject);
  }
  static {
    g(this.prototype, "resolved", [use], function () {
      return keepLatest({
        value: () => this.request.resolved,
        when: () => this.request.isLoading
      });
    });
  }
  #resolved = (i(this, "resolved"), void 0);
  get #createProject() {
    const {
      package: pkg
    } = this.args;
    if (!pkg) {
      throw new Error(`A @package must be specified to load.`);
    }
    const seen = cache.get(pkg);
    if (seen) {
      return seen;
    }
    const loadNew = async () => {
      const req = await this.#apiDocs.load(pkg);
      const json = await req.json();
      const logger = new ConsoleLogger();
      const deserializer = new Deserializer(logger);
      const project = deserializer.reviveProject('API Docs', json, {
        projectRoot: '/',
        registry: new FileRegistry()
      });
      return project;
    };
    cache.set(pkg, loadNew);
    return loadNew;
  }
  static {
    setComponentTemplate(precompileTemplate("{{#if this.request.isLoading}}\n  Loading api docs...\n{{/if}}\n\n{{#if this.request.error}}\n  {{errorFor this.request.error}}\n{{/if}}\n\n{{#if this.request.resolved}}\n  <section>\n    <Query @info={{this.request.resolved}} @module={{@module}} @name={{@name}} as |type|>\n      <Provide @data={{this.request.resolved}} @key=\"project\">\n        {{yield type this.request.resolved}}\n      </Provide>\n    </Query>\n  </section>\n{{/if}}", {
      strictMode: true,
      scope: () => ({
        errorFor,
        Query,
        Provide
      })
    }), this);
  }
}
function errorFor(error) {
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

const not$1 = x => !x;
const isComponent = kind => kind === 'component';
/**
 * Only components' args are prefixed with a `@`,
 * because only components have template-content.
 */
const Args = setComponentTemplate(precompileTemplate("{{#if @info}}\n  <Heading class=\"typedoc__heading\">Arguments</Heading>\n  {{#each (listifyArgs @info) as |child|}}\n    <span class=\"typedoc__{{@kind}}-signature__arg\">\n      <span class=\"typedoc__{{@kind}}-signature__arg-info\">\n        <pre class=\"typedoc__name\">{{if (isComponent @kind) \"@\"}}{{child.name}}</pre>\n        {{#if (isIntrinsic child.type)}}\n          <Type @info={{child.type}} />\n        {{else if (isNamedTuple child)}}\n          <Type @info={{child.element}} />\n        {{/if}}\n      </span>\n\n      {{#if (getFlags child.flags)}}\n        {{!-- we can potentially display more flags here in the future --}}\n        <Flags @flags={{child.flags}} />\n      {{/if}}\n\n      {{#if (not (isIntrinsic child.type))}}\n        <Type @info={{child.type}} />\n      {{else if (isNamedTuple child)}}\n        <Type @info={{child.element}} />\n      {{else}}\n        <Comment @info={{child}} />\n      {{/if}}\n    </span>\n  {{/each}}\n{{/if}}", {
  strictMode: true,
  scope: () => ({
    Heading,
    listifyArgs,
    isComponent,
    isIntrinsic,
    Type,
    isNamedTuple,
    getFlags,
    Flags,
    not: not$1,
    Comment
  })
}), templateOnly());
function listifyArgs(info) {
  if (!info) return [];
  if (Array.isArray(info)) {
    return info;
  }
  /**
  * This object *may* have Named and Positional on them,
  * in which case, we want to create [...Positional, Named]
  */
  if ('children' in info && Array.isArray(info.children)) {
    if (info.children.length <= 2) {
      const flattened = flattenArgs(info.children);
      if (flattened.length > 0) {
        return flattened;
      }
    }
    return info.children;
  }
  let declaration = null;
  if ('type' in info && info.type && 'declaration' in info.type && info.type.declaration) {
    declaration = info.type.declaration;
  }
  if ('type' in info && info.type && info.type.type === 'reference') {
    declaration = info.project.getReflectionById(info.type['_target']);
  }
  if (declaration) {
    return listifyArgs(declaration);
  }
  console.warn('unhandled', info);
  return [];
}
function flattenArgs(args) {
  const named = args.find(x => x.name === 'Named');
  const positional = args.find(x => x.name === 'Positional');
  const result = [];
  if (positional) {
    result.push(positional.type?.elements);
  }
  if (named) {
    result.push(named);
  }
  return result.flat();
}
/**
 * Returns args for either a function or signature
 */
function getArgs(info) {
  if (!info) return [];
  if ('parameters' in info) {
    return info.parameters;
  }
  if (Array.isArray(info)) {
    return info.find(item => item.name === 'Args');
  }
  if ('children' in info) {
    return getArgs(info.children);
  }
}
const Flags = setComponentTemplate(precompileTemplate("<span class=\"typedoc__arg-flags\">\n  {{#each (getFlags @flags) as |flag|}}\n    <span class=\"typedoc__flag\">{{flag}}</span>\n  {{/each}}\n</span>", {
  strictMode: true,
  scope: () => ({
    getFlags
  })
}), templateOnly());
function getFlags(flags) {
  // extremely simplified logic to determine flags, for now we only interested in `isOptional`
  return [flags?.isOptional && 'optional'].filter(Boolean);
}

const mdnElement = typeName => {
  const element = typeName.replace('HTML', '').replace('Element', '').toLowerCase();
  return `https://developer.mozilla.org/en-US/docs/Web/HTML/Element/${element}`;
};
function hasName(info) {
  return Boolean(info.type?.name);
}
const Element = setComponentTemplate(precompileTemplate("{{#if @info}}\n  <section>\n    <Heading class=\"typedoc__heading typedoc__{{@kind}}-signature__element-header\">\n      <span class=\"typedoc__name\">{{@info.name}}</span>\n      <span class=\"typedoc__{{@kind}}-signature__element-type\">\n        {{#if (hasName @info)}}\n          <ExternalLink href={{mdnElement @info.type.name}} class=\"typedoc__type-link\">\n            {{@info.type.name}}\n            \u279A\n          </ExternalLink>\n        {{else if (isLiteral @info.type)}}\n          {{String @info.type.value}}\n        {{/if}}\n      </span>\n    </Heading>\n  </section>\n  <span class=\"typedoc__{{@kind}}-signature__element\">\n    <Comment @info={{@info}} />\n  </span>\n{{/if}}", {
  strictMode: true,
  scope: () => ({
    Heading,
    hasName,
    ExternalLink,
    mdnElement,
    isLiteral,
    String,
    Comment
  })
}), templateOnly());

function getSignatureType$1(info, project) {
  /**
  * export const Foo: TOC<{ signature here }> = <template> ... </template>
  */
  if (info.isDeclaration()) {
    if (isReference$1(info.type) && info.type?.typeArguments?.[0]?.type === 'reflection') {
      return info.type.typeArguments[0].declaration;
    }
    /**
    * export class Foo extends Component<{ signature here }> { ... }
    */
    const extendedType = info.extendedTypes?.[0];
    if (extendedType?.type === 'reference' && extendedType?.package === '@glimmer/component') {
      const typeArg = extendedType.typeArguments?.[0];
      if (typeArg) {
        if (typeArg?.type === 'reflection') {
          return typeArg.declaration;
        }
        /**
        * export interface Signature { ... }
        *
        * export class Foo extends Component<Signature>
        */
        if ('_target' in typeArg) {
          const id = typeArg._target;
          return project.getReflectionById(id);
        }
      }
    }
    /**
    * export interface Signature { ... }
    * export const Foo: TOC<Signature> = <template> ... </template>
    */
    if (info.type?.type === 'reference') {
      const typeArg = info.type?.typeArguments?.[0];
      if (typeArg && '_target' in typeArg) {
        const id = typeArg._target;
        return project.getReflectionById(id);
      }
    }
  }
  /**
  * export interface Signature { ... }
  */
  return info;
}
function getSignature$2(info, project) {
  if (!info) return;
  const type = getSignatureType$1(info, project);
  if (!type) return;
  const Element = findChildDeclaration(type, 'Element');
  const Args = findChildDeclaration(type, 'Args');
  const Blocks = findChildDeclaration(type, 'Blocks');
  const hasAny = Element || Args || Blocks;
  if (!hasAny) return;
  return {
    Element,
    Args,
    Blocks
  };
}
const ComponentSignature = setComponentTemplate(precompileTemplate("<Load @package={{@package}} @module={{@module}} @name={{@name}} as |declaration project|>\n  {{#let (getSignature declaration project) as |info|}}\n    <ComponentDeclaration @signature={{info}} />\n  {{/let}}\n</Load>", {
  strictMode: true,
  scope: () => ({
    Load,
    getSignature: getSignature$2,
    ComponentDeclaration
  })
}), templateOnly());
const ComponentDeclaration = setComponentTemplate(precompileTemplate("<Element @kind=\"component\" @info={{@signature.Element}} />\n<Args @kind=\"component\" @info={{@signature.Args}} />\n<Blocks @info={{@signature.Blocks}} />", {
  strictMode: true,
  scope: () => ({
    Element,
    Args,
    Blocks
  })
}), templateOnly());
const Blocks = setComponentTemplate(precompileTemplate("{{#if @info}}\n  <section>\n    <Heading class=\"typedoc__heading\">Blocks</Heading>\n    {{#each @info.type.declaration.children as |child|}}\n      <span class=\"typedoc__component-signature__block\">\n        <pre class=\"typedoc__name\">&lt;:{{child.name}}&gt;</pre>\n        {{!-- <span class='typedoc-category'>Properties </span> --}}\n        <div class=\"typedoc__property\">\n          <Type @info={{child.type}} />\n          <Comment @info={{child}} />\n        </div>\n      </span>\n    {{/each}}\n  </section>\n{{/if}}", {
  strictMode: true,
  scope: () => ({
    Heading,
    Type,
    Comment
  })
}), templateOnly());

// Glint broke glint-directives... _but_ this file is a mess anyway
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

const APIDocs = setComponentTemplate(precompileTemplate("<Load @module={{@module}} @name=\"{{@name}}\" @package={{@package}} as |info|>\n  <Declaration @info={{info}} />\n</Load>", {
  strictMode: true,
  scope: () => ({
    Load,
    Declaration
  })
}), templateOnly());
/**
 * Used for referencing the comment on a const or class.
 *
 * For example:
 * ```
 * /*
 *  * Comment block here is what is targeted
 *  *\/
 * export const CommentQuery ...
 * ```
 *
 * Usage:
 * ```hbs
 * <CommentQuery @name="CommentQuery" ... />
 * ```
 */
const CommentQuery = setComponentTemplate(precompileTemplate("<Load @package={{@package}} @module={{@module}} @name={{@name}} as |info|>\n  <Comment @info={{info}} />\n</Load>", {
  strictMode: true,
  scope: () => ({
    Load,
    Comment
  })
}), templateOnly());
class Comment extends Component {
  get compiled() {
    const summary = this.args.info?.comment?.summary;
    if (!summary) return null;
    const input = summary.map(x => x.text).join('\n');
    const owner = getOwner(this);
    assert(`[Bug]: owner is missing`, owner);
    return compileText(owner, input);
  }
  static {
    setComponentTemplate(precompileTemplate("{{#if this.compiled.isReady}}\n  <div class=\"typedoc-rendered-comment\">\n    <this.compiled.component />\n  </div>\n{{/if}}", {
      strictMode: true
    }), this);
  }
}
const isIgnored = name => ['__type', 'TOC', 'TemplateOnlyComponent'].includes(name);
const isConst = x => x.flags.isConst;
const not = x => !x;
const or = (...args) => args.find(x => !!x);
const Declaration = setComponentTemplate(precompileTemplate("{{#if @info}}\n  <div class=\"typedoc__declaration\">\n    {{#if (not (isIgnored @info.name))}}\n      <span class=\"typedoc__declaration-name\">{{@info.name}}</span>\n    {{/if}}\n\n    {{#if (isConst @info)}}\n      <Comment @info={{@info}} />\n    {{/if}}\n\n    {{#if @info.type}}\n      <div class=\"typedoc__declaration-type\">\n        <Type @info={{@info.type}} />\n      </div>\n    {{/if}}\n\n    {{#if @info.children}}\n      <ul class=\"typedoc__declaration-children\">\n        {{#each @info.children as |child|}}\n          <li><Declaration @info={{child}} /></li>\n        {{/each}}\n      </ul>\n    {{/if}}\n\n    {{#if @info.signatures}}\n      <ul class=\"typedoc__declaration-signatures\">\n        {{#each @info.signatures as |child|}}\n          {{!-- @glint-expect-error --}}\n          <li><Type @info={{child}} /></li>\n        {{/each}}\n      </ul>\n    {{/if}}\n\n    {{#if (not (isConst @info))}}\n      {{#if @info.comment.summary}}\n        <Comment @info={{@info}} />\n      {{/if}}\n    {{/if}}\n  </div>\n{{/if}}", {
  strictMode: true,
  scope: () => ({
    not,
    isIgnored,
    isConst,
    Comment,
    Type,
    Declaration
  })
}), templateOnly());
const Reflection = setComponentTemplate(precompileTemplate("<Declaration @info={{@info.declaration}} />", {
  strictMode: true,
  scope: () => ({
    Declaration
  })
}), templateOnly());
const isReference = x => x?.type === 'reference';
const isReflection = x => x?.type === 'reflection';
const isQuery = x => x?.type === 'query';
const isIntrinsic = x => x?.type === 'intrinsic';
const isTuple = x => x?.type === 'tuple';
const isNamedTuple = x => x?.type === 'namedTupleMember';
const isVoidIntrinsic = x => {
  if (!x) return false;
  if (typeof x !== 'object') return false;
  if (x === null) return false;
  if (!('type' in x)) return false;
  if (typeof x.type === 'object' && x.type !== null) {
    if ('type' in x.type && 'name' in x.type) {
      return x.type.type === 'intrinsic' && x.type.name === 'void';
    }
  }
  return false;
};
const isArray = x => {
  if (!x) return false;
  if (typeof x !== 'object') return false;
  if (x === null) return false;
  if (!('type' in x)) return false;
  return x.type === 'array';
};
const isFn = x => {
  if (!x) return false;
  if (typeof x !== 'object') return false;
  if (x === null) return false;
  if (!('name' in x)) return false;
  if (!('variant' in x)) return false;
  return x.variant === 'signature';
};
const isUnknownType = x => {
  if (!x) return false;
  if (typeof x !== 'object') return false;
  if (x === null) return false;
  if (!('type' in x)) return false;
  return x.type === 'unknown';
};
const isUnion = x => {
  if (!x) return false;
  if (typeof x !== 'object') return false;
  if (x === null) return false;
  if (!('type' in x)) return false;
  return x.type === 'union';
};
// function typeArg(info: DeclarationReference) {
//   let extended = info?.extendedTypes?.[0]
//   if (!extended) return false;
//   return extended.typeArguments[0]
// }
//
const isInvokable = info => info.name === 'Invokable';
const Reference = setComponentTemplate(precompileTemplate("{{#if (isInvokable @info)}}\n  <div class=\"typedoc__unknown__yield\">\n    <Intrinsic @info={{hash name=\"Component\"}} />\n  </div>\n{{else}}\n  <div class=\"typedoc__reference\">\n    {{#if (not (isIgnored @info.name))}}\n      <div class=\"typedoc__reference__name\">{{or @info.reflection.name @info.name}}</div>\n    {{/if}}\n    {{#if @info.typeArguments.length}}\n      <div class=\"typedoc__reference__typeArguments\">\n        &lt;\n        {{#each @info.typeArguments as |typeArg|}}\n          <div class=\"typedoc__reference__typeArgument\">\n            <Type @info={{typeArg}} />\n          </div>\n        {{/each}}\n        &gt;\n      </div>\n    {{/if}}\n  </div>\n{{/if}}", {
  strictMode: true,
  scope: () => ({
    isInvokable,
    Intrinsic,
    hash,
    not,
    isIgnored,
    or,
    Type
  })
}), templateOnly());
const Intrinsic = setComponentTemplate(precompileTemplate("<span class=\"typedoc__intrinsic\">{{or @info.reflection.name @info.name}}</span>", {
  strictMode: true,
  scope: () => ({
    or
  })
}), templateOnly());
const VoidIntrinsic = setComponentTemplate(precompileTemplate("<div class=\"typedoc__void_intrinsic\">\n  {{!-- @glint-expect-error --}}\n  <Function @info={{@info}} />\n</div>", {
  strictMode: true,
  scope: () => ({
    Function
  })
}), templateOnly());
const Tuple = setComponentTemplate(precompileTemplate("{{#each @info.elements as |element|}}\n  <Type @info={{element}} />\n{{/each}}", {
  strictMode: true,
  scope: () => ({
    Type
  })
}), templateOnly());
const NamedTuple = setComponentTemplate(precompileTemplate("<div class=\"typedoc__named-tuple\">\n  <div class=\"typedoc__name\">{{@info.name}}</div>\n  <Type @info={{@info.element}} />\n</div>", {
  strictMode: true,
  scope: () => ({
    Type
  })
}), templateOnly());
const Array$1 = setComponentTemplate(precompileTemplate("<div class=\"typedoc__array\">\n  <div class=\"typedoc__array__indicator\">Array of</div>\n  <Type @info={{@info.elementType}} />\n</div>", {
  strictMode: true,
  scope: () => ({
    Type
  })
}), templateOnly());
const Function = setComponentTemplate(precompileTemplate("<div class=\"typedoc__function\">\n  <div class=\"typedoc__function__type\">\n    <div class=\"typedoc__function__open\">(</div>\n    <div class=\"typedoc__function__parameters\">\n      {{#each @info.parameters as |param|}}\n        <div class=\"typedoc__function__parameter__container\">\n          <div class=\"typedoc__function__parameter\">\n            <div class=\"typedoc__function__parameter__name\">{{param.name}}</div>\n            <div class=\"typedoc__function__parameter__type\">\n              {{!-- @glint-expect-error --}}\n              <Type @info={{param.type}} />\n            </div>\n          </div>\n          <div class=\"typedoc__function__parameter__comment\">\n            <Comment @info={{param}} />\n          </div>\n        </div>\n      {{/each}}\n    </div>\n    <div class=\"typedoc__function__close\">) =></div>\n    <div class=\"typedoc__function__return_type\">\n      {{!-- @glint-expect-error --}}\n      <Type @info={{@info.type}} />\n    </div>\n  </div>\n  <div class=\"typedoc__function_comment\">\n    <Comment @info={{@info}} />\n  </div>\n</div>", {
  strictMode: true,
  scope: () => ({
    Type,
    Comment
  })
}), templateOnly());
const Unknown = setComponentTemplate(precompileTemplate("<div class=\"typedoc__unknown\">\n  {{@info.name}}\n</div>", {
  strictMode: true
}), templateOnly());
const Union = setComponentTemplate(precompileTemplate("<div class=\"typedoc__union\">\n  {{#each @info.types as |type|}}\n    <div class=\"typedoc__union__type\">\n      <Type @info={{type}} />\n    </div>\n  {{/each}}\n</div>", {
  strictMode: true,
  scope: () => ({
    Type
  })
}), templateOnly());
const literalAsString = x => {
  if (typeof x === 'string') {
    return `"${x}"`;
  }
  if (typeof x === 'number' || typeof x === 'boolean' || x === null) {
    return `${x}`;
  }
  return x.toString();
};
const Literal = setComponentTemplate(precompileTemplate("<div class=\"typedoc__literal\">\n  {{literalAsString @info.value}}\n</div>", {
  strictMode: true,
  scope: () => ({
    literalAsString
  })
}), templateOnly());
const Type = setComponentTemplate(precompileTemplate("<Consume @key=\"project\" as |project|>\n  {{#let (getComponentSignature @info.declaration project) as |maybe|}}\n    {{#if maybe}}\n      <ComponentDeclaration @signature={{maybe}} />\n    {{else if (isReference @info)}}\n      {{!-- @glint-expect-error --}}\n      <Reference @info={{@info}} />\n    {{else if (isQuery @info)}}\n      <Type @info={{@info.queryType}} />\n    {{else if (isReflection @info)}}\n      {{!-- @glint-expect-error --}}\n      <Reflection @info={{@info}} />\n    {{else if (isIntrinsic @info)}}\n      {{!-- @glint-expect-error --}}\n      <Intrinsic @info={{@info}} />\n    {{else if (isTuple @info)}}\n      {{!-- @glint-expect-error --}}\n      <Tuple @info={{@info}} />\n    {{else if (isNamedTuple @info)}}\n      <NamedTuple @info={{@info}} />\n    {{else if (isVoidIntrinsic @info)}}\n      {{!-- @glint-expect-error --}}\n      <VoidIntrinsic @info={{@info}} />\n    {{else if (isArray @info)}}\n      <Array @info={{@info}} />\n    {{else if (isFn @info)}}\n      {{!-- @glint-expect-error --}}\n      <Function @info={{@info}} />\n    {{else if (isUnion @info)}}\n      <Union @info={{@info}} />\n    {{else if (isLiteral @info)}}\n      <Literal @info={{@info}} />\n    {{else if (isUnknownType @info)}}\n      <Unknown @info={{@info}} />\n    {{else}}\n      {{!-- template-lint-disable no-log --}}\n      {{log \"Unknown Type\" @info}}\n    {{/if}}\n  {{/let}}\n</Consume>", {
  strictMode: true,
  scope: () => ({
    Consume,
    getComponentSignature: getSignature$2,
    ComponentDeclaration,
    isReference,
    Reference,
    isQuery,
    Type,
    isReflection,
    Reflection,
    isIntrinsic,
    Intrinsic,
    isTuple,
    Tuple,
    isNamedTuple,
    NamedTuple,
    isVoidIntrinsic,
    VoidIntrinsic,
    isArray,
    Array: Array$1,
    isFn,
    Function,
    isUnion,
    Union,
    isLiteral,
    Literal,
    isUnknownType,
    Unknown
  })
}), templateOnly());

function getSignature$1(info, project) {
  if (!info.isDeclaration()) {
    return;
  }
  /**
  * export const Foo: HelperLike<{...}>
  */
  if (info.type?.type === 'reference' && info.type?.package === 'kolay' && info.type.symbolId?.packagePath?.includes('fake-glint-template.d.ts') && info.type?.name === 'HelperLike' && Array.isArray(info.type?.typeArguments) && info.type.typeArguments[0] && 'declaration' in info.type.typeArguments[0]) {
    // There can only be one type argument for a HelperLike
    return info.type.typeArguments[0]?.declaration;
  }
  /**
  * export class MyHelper extends ...
  */
  if (Array.isArray(info.extendedTypes) && info.extendedTypes.length > 0) {
    const firstExtended = info.extendedTypes[0];
    /**
    * import Helper from '@ember/component/helper';
    *
    * export class MyHelper extends Helper<{...}>
    */
    if (firstExtended?.type === 'reference' && firstExtended.package === 'ember-source' && firstExtended.qualifiedName.includes('/helper') && Array.isArray(firstExtended.typeArguments) && firstExtended.typeArguments[0] && 'declaration' in firstExtended.typeArguments[0]) {
      return firstExtended.typeArguments[0].declaration;
    }
    /**
    * import Helper from '@ember/component/helper';
    * But the types for the helper are not present
    *
    * export class MyHelper extends Helper<{...}>
    */
    if (firstExtended?.type === 'reference' && Array.isArray(firstExtended.typeArguments) && firstExtended.typeArguments[0]) {
      const firstTypeArg = firstExtended.typeArguments[0];
      if ('declaration' in firstTypeArg) {
        return firstTypeArg.declaration;
      }
      /**
      * import Helper from '@ember/component/helper';
      *
      * export interface Signature { ... }
      *
      * export class MyHelper extends Helper<Signature>
      */
      if ('_target' in firstTypeArg && '_project' in firstTypeArg) {
        const id = firstTypeArg._target;
        return project.getReflectionById(id);
      }
    }
  }
  /**
  * export function(...): return;
  */
  if (info.signatures) {
    return info.signatures;
  }
  /**
  * alt
  * export function(...): return;
  */
  if (info.type && 'declaration' in info.type && info.type.declaration?.signatures) {
    return info.type.declaration.signatures;
  }
  /**
  * export interface Signature { ... }
  */
  return info;
}
function getReturn(info) {
  if (!info) return;
  if (info.variant === 'signature') {
    return info.type;
  }
  if (Array.isArray(info)) {
    return info.find(item => item.name === 'Return')?.type;
  }
  if ('children' in info) {
    return getReturn(info.children);
  }
}
const Return = setComponentTemplate(precompileTemplate("{{#if @info}}\n  <section class=\"typedoc__helper__return\">\n    <Heading class=\"typedoc__heading\">Return</Heading>\n\n    <Type @info={{@info}} />\n  </section>\n{{/if}}", {
  strictMode: true,
  scope: () => ({
    Heading,
    Type
  })
}), templateOnly());
const HelperSignature = setComponentTemplate(precompileTemplate("<Load @package={{@package}} @module={{@module}} @name={{@name}} as |declaration project|>\n  {{#let (getSignature declaration project) as |info|}}\n    {{#if (Array.isArray info)}}\n      {{#each info as |signature|}}\n        <Args @kind=\"helper\" @info={{getArgs signature}} />\n        <Return @info={{getReturn signature}} />\n      {{/each}}\n    {{else}}\n      {{!-- Whenever we have a \"Full Signature\" or \"HelperLike\" definition --}}\n      <Args @kind=\"helper\" @info={{getArgs info}} />\n      <Return @info={{getReturn info}} />\n    {{/if}}\n\n  {{/let}}\n</Load>", {
  strictMode: true,
  scope: () => ({
    Load,
    getSignature: getSignature$1,
    Array,
    Args,
    getArgs,
    Return,
    getReturn
  })
}), templateOnly());

/** eslint-disable @typescript-eslint/no-unused-vars */
function getSignatureType(info, _project) {
  if (!info.isDeclaration()) {
    return info;
  }
  /**
  * export const Foo: TOC<{ signature here }> = <template> ... </template>
  */
  if (info.type?.type === 'reference' && info.type?.typeArguments?.[0]?.type === 'reflection') {
    return info.type.typeArguments[0].declaration;
  }
  /**
  * import { modifier } from 'ember-modifier';
  *
  * export const foo = modifier<{ ... }>(() => {});
  */ // TODO: need to add ember-modifier's types to the typedoc generator
  /**
  * (implicit signature)
  *
  * import { modifier } from 'ember-modifier';
  *
  * export const foo = modifier(() => {});
  */
  if (info.type && 'package' in info.type) {
    if (info.type.package === 'ember-modifier') ;
    /**
    * import type { ModifierLike } from '@glint/template';
    *
    * export const X: ModifierLike<{ ... }>
    */
    if (info.type?.package === 'kolay' && info.type.symbolId?.packagePath?.includes('fake-glint-template.d.ts') && Array.isArray(info.type?.typeArguments) && info.type.typeArguments.length > 0) {
      const typeArg = info.type?.typeArguments[0];
      if (typeArg && 'declaration' in typeArg) {
        return typeArg.declaration;
      }
    }
  }
  if (info.variant === 'declaration' && 'extendedTypes' in info) {
    const extendedType = info.extendedTypes?.[0];
    if (extendedType?.type === 'reference' && extendedType?.package === 'ember-modifier') {
      const typeArg = extendedType.typeArguments?.[0];
      if (typeArg?.type === 'reflection') {
        return typeArg.declaration;
      }
    }
  }
  /**
  * export interface Signature { ... }
  */
  return info;
}
function getSignature(info, project) {
  const type = getSignatureType(info);
  if (!type) {
    console.warn('Could not finde signature');
    return;
  }
  return {
    Element: findChildDeclaration(type, 'Element'),
    Args: findChildDeclaration(type, 'Args')
  };
}
const ModifierSignature = setComponentTemplate(precompileTemplate("<Load @package={{@package}} @module={{@module}} @name={{@name}} as |declaration project|>\n  {{#let (getSignature declaration project) as |info|}}\n    <Element @kind=\"modifier\" @info={{info.Element}} />\n    <Args @kind=\"modifier\" @info={{info.Args}} />\n  {{/let}}\n</Load>", {
  strictMode: true,
  scope: () => ({
    Load,
    getSignature,
    Element,
    Args
  })
}), templateOnly());

export { APIDocs as A, CommentQuery as C, HelperSignature as H, ModifierSignature as M, Compiled as a, ComponentSignature as b, compileText as c, getKey as g, setupSecret as s, typedocLoader as t };
//# sourceMappingURL=modifier-Bhk7wR8-.js.map
