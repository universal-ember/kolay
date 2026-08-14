import Component from "@glimmer/component";
import { cached, tracked } from "@glimmer/tracking";
import { on } from "@ember/modifier";
import { action } from "@ember/object";
import { service } from "@ember/service";

import { docsManager } from "kolay";
import { getPromiseState } from "reactiveweb/get-promise-state";

import type RouterService from "@ember/routing/router-service";
import type { SearchResult } from "kolay";

interface Signature {
  Args: {
    model: { query: string };
  };
}

export default class SearchPage extends Component<Signature> {
  @service declare router: RouterService;
  // THIS IS A BAD ANTIPATTERN DO NOT COPY THIS.
  // SEE docs-app for how to do this for real
  // eslint-disable-next-line ember/no-tracked-properties-from-args
  @tracked query = this.args.model.query;

  @cached
  get search(): Promise<SearchResult[]> {
    return docsManager(this).search(this.args.model.query);
  }

  get results() {
    return getPromiseState(this.search).resolved ?? [];
  }

  @action update(event: Event) {
    this.query = (event.target as HTMLInputElement).value;
  }

  @action submit(event: SubmitEvent) {
    event.preventDefault();
    this.router.transitionTo("search", { queryParams: { q: this.query } });
  }

  <template>
    <h1>Search</h1>
    <form {{on "submit" this.submit}}>
      <input name="q" value={{this.query}} aria-label="Search" {{on "input" this.update}} />
      <button type="submit">Search</button>
    </form>
    <ul>
      {{#each this.results as |result|}}
        <li class="search-result"><a href={{result.path}}>{{result.title}}</a></li>
      {{/each}}
    </ul>
  </template>
}
