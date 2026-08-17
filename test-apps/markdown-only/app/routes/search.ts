import Route from "@ember/routing/route";

export default class SearchRoute extends Route {
  queryParams = { q: { refreshModel: true } };

  model({ q }: { q?: string }) {
    return { query: q ?? "" };
  }
}
