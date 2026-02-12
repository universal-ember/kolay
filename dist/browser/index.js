import './kolay.css';
export { A as APIDocs, C as CommentQuery, b as Compiled, c as ComponentSignature, H as HelperSignature, M as ModifierSignature, g as getIndexPage, a as isCollection, i as isIndex, t as typedocLoader } from './modifier-Ctl1mPnl.js';
import { assert } from '@ember/debug';
import { getOwner } from '@ember/owner';
import { d as docsManager } from './docs-CuwjwiTo.js';
export { s as selected } from './docs-CuwjwiTo.js';

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
