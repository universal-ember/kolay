import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { on } from '@ember/modifier';

export default class Counter extends Component {
  @tracked count = 0;

  increment = () => this.count++;

  <template>
    <button type="button" data-demo="counter" {{on "click" this.increment}}>
      Clicked
      {{this.count}}
      times
    </button>
  </template>
}
