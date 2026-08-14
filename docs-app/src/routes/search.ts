import Route from '@ember/routing/route';

export default class SearchRoute extends Route {
  queryParams = { q: { refreshModel: true } };
}
