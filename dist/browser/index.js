import './kolay.css';
export { A as APIDocs, C as CommentQuery, a as Compiled, b as ComponentSignature, H as HelperSignature, M as ModifierSignature, t as typedocLoader } from './modifier-Bhk7wR8-.js';
import { assert } from '@ember/debug';
import { getOwner } from '@ember/owner';
import { d as docsManager } from './utils-BQ_38CuW.js';
export { g as getIndexPage, a as isCollection, i as isIndex, s as selected } from './utils-BQ_38CuW.js';

function addRoutes(context) {
  /**
   * We need a level of nesting for every `/` in the URL so that we don't over-refresh / render the whole page
   */
  context.route('page', {
    path: '/*page'
  }, function () {});
}

/**
 * Does our target destination exist? if not,
 * redirect to the first page on the namespace
 *
 * For use with addRoutes(), which defines a "page" path matcher
 */
function handlePotentialIndexVisit(context, transition) {
  const docs = docsManager();
  if (transition.to?.localName !== 'index') return;
  const groupName = String(transition.to.parent?.params?.page);
  if (!groupName) return;
  if (!docs.availableGroups.includes(groupName)) return;
  const group = docs.groupFor(groupName);
  const first = group.list[0];
  if (!first) {
    console.warn(`Could not determine first page in group: ${groupName}`);
    return;
  }
  const router = getOwner(context)?.lookup('service:router');
  assert(`Expected to find the router service, but did not`, router);
  router.transitionTo(first.path);
}

export { addRoutes, docsManager, handlePotentialIndexVisit };
//# sourceMappingURL=index.js.map
