import Component from '@glimmer/component';
import { Page } from 'kolay/components';

/**
 * Wrapper component that renders a kolay Page component for dynamic documentation
 */
export default class KolayPage extends Component {
  <template>
    <Page />
  </template>
}
