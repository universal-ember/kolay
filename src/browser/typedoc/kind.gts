import { isReference } from './narrowing.ts';

import type { TOC } from '@ember/component/template-only';
import type { Reflection, SomeType } from 'typedoc';

/**
 * What a type *is*, when it is something invokable from a template.
 *
 * The types that say so -- `ComponentLike`, `HelperLike`, `TOC`,
 * `WithBoundArgs`, and friends -- are Glint plumbing that readers shouldn't
 * have to know. The kind is the part they actually need: whether the thing
 * they've been handed is a component, a modifier, a helper, or a function.
 */
export type Kind = 'component' | 'modifier' | 'helper' | 'function';

const LABELS: Record<Kind, string> = {
  component: 'Component',
  modifier: 'Modifier',
  helper: 'Helper',
  function: 'Function',
};

/**
 * The Glint (and template-only) types whose whole purpose is to say what kind
 * of thing they wrap. The kind label says the same thing in plainer words, so
 * these names are never worth rendering themselves.
 */
const BY_NAME: Record<string, Kind> = {
  ComponentLike: 'component',
  Invokable: 'component',
  TemplateOnlyComponent: 'component',
  TOC: 'component',
  ModifierLike: 'modifier',
  HelperLike: 'helper',
};

export function isKindWrapper(name: string | undefined): boolean {
  return name !== undefined && name in BY_NAME;
}

/**
 * The base classes that make a class one of these, e.g.
 * `class Foo extends Component<Signature>`
 */
function kindFromBaseClass(reflection: Reflection): Kind | undefined {
  const extended = (reflection as { extendedTypes?: SomeType[] }).extendedTypes?.[0];

  if (!isReference(extended)) return;

  if (extended.package === '@glimmer/component') return 'component';
  if (extended.package === 'ember-modifier') return 'modifier';

  if (extended.package === 'ember-source' && extended.qualifiedName?.includes('/helper')) {
    return 'helper';
  }

  return BY_NAME[extended.name];
}

/**
 * Alias chains are short (`type Foo = ComponentLike<...>`), but a depth limit
 * keeps a surprising one from looping.
 */
const MAX_DEPTH = 5;

export function kindOf(type: SomeType | undefined, depth = 0): Kind | undefined {
  if (!type || depth > MAX_DEPTH) return;

  /**
   * `typeof Foo`
   */
  if (type.type === 'query') return kindOf(type.queryType, depth + 1);

  /**
   * `(value: string) => void`
   */
  if (type.type === 'reflection') {
    return type.declaration?.signatures?.length ? 'function' : undefined;
  }

  if (!isReference(type)) return;

  const byName = BY_NAME[type.name];

  if (byName) return byName;

  const reflection = type.reflection;

  if (!reflection) return;

  const fromBaseClass = kindFromBaseClass(reflection);

  if (fromBaseClass) return fromBaseClass;

  /**
   * `export type Foo = ComponentLike<Signature>`
   */
  if ('type' in reflection && reflection.type) {
    return kindOf(reflection.type as SomeType, depth + 1);
  }

  return;
}

export const Kind: TOC<{ Args: { kind: Kind } }> = <template>
  <span class='typedoc__kind'>{{label @kind}}</span>
</template>;

function label(kind: Kind) {
  return LABELS[kind];
}
