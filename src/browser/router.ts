import type { RouterDSL } from '@ember/-internals/routing';

export function addRoutes(context: Pick<RouterDSL, 'route'>): void {
  /**
   * We need a level of nesting for every `/` in the URL so that we don't over-refresh / render the whole page
   */
  context.route('page', { path: '/*page' }, function () {});
}
