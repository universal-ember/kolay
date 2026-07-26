import 'ember-mobile-menu/themes/android';

import Component from '@glimmer/component';
import { on } from '@ember/modifier';
import { service } from '@ember/service';

import { pascalCase, sentenceCase } from 'change-case';
// @ts-expect-error no types for the mobile-menu
import MenuWrapper from 'ember-mobile-menu/components/mobile-menu-wrapper';
import { pageTitle } from 'ember-page-title';
import Route from 'ember-route-template';
import { GroupNav, PageNav } from 'kolay/components';
import rememberDocumentScroll from 'memory-scroll/modifiers/remember-document-scroll';
import { ExternalLink } from 'nvp.ui';

import { abbreviatedSha } from '~build/git';

import type { TOC } from '@ember/component/template-only';
import type Owner from '@ember/owner';
import type RouterService from '@ember/routing/router-service';
import type { Page } from 'kolay';
import type MemoryScrollService from 'memory-scroll/services/memory-scroll';

/**
 * Navigating to a page scrolls to the top; going back (or forward)
 * restores that history entry's scroll position.
 *
 * Each history entry has its own uuid (stamped by Ember's location),
 * so a link click produces a fresh key — memory-scroll finds no saved
 * position and scrolls to 0 — while back/forward reuses the entry's
 * key and restores. Positions are recorded live by the modifier's
 * scroll listener.
 */
class ScrollBehavior extends Component {
  @service declare router: RouterService;
  @service('memory-scroll') declare memory: MemoryScrollService;

  constructor(owner: Owner, args: Record<string, unknown>) {
    super(owner, args);

    // keep the browser-restored position on reload: seed the initial
    // entry's memory before the modifier's first restore runs
    this.memory.memory.set(this.key, document.documentElement.scrollTop);
  }

  get key(): string {
    // reading currentURL makes this recompute on every navigation
    const url = this.router.currentURL;
    const state = window.history.state as { uuid?: string } | null;

    return String(state?.uuid ?? url);
  }

  <template>
    <div aria-hidden="true" {{rememberDocumentScroll key=this.key}}></div>
  </template>
}

/**
 * The same arrow nvp.ui's <ExternalLink> shows: these entries take the
 * reader out of the group, and should look like it.
 */
const LinkEntryIcon: TOC<{ Element: SVGElement }> = <template>
  <svg aria-hidden="true" viewBox="0 0 512 512" class="link-entry-icon" ...attributes><path
      fill="currentColor"
      d="M320 0c-17.7 0-32 14.3-32 32s14.3 32 32 32h82.7L201.4 265.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L448 109.3V192c0 17.7 14.3 32 32 32s32-14.3 32-32V32c0-17.7-14.3-32-32-32H320zM80 32C35.8 32 0 67.8 0 112V432c0 44.2 35.8 80 80 80H400c44.2 0 80-35.8 80-80V320c0-17.7-14.3-32-32-32s-32 14.3-32 32V432c0 8.8-7.2 16-16 16H80c-8.8 0-16-7.2-16-16V112c0-8.8 7.2-16 16-16H192c17.7 0 32-14.3 32-32s-14.3-32-32-32H80z"
    ></path></svg>
</template>;

const Menu: TOC<{ Element: SVGElement }> = <template>
  <svg x="0px" y="0px" viewBox="0 0 50 50" style="fill:currentColor" ...attributes><path
      d="M 0 7.5 L 0 12.5 L 50 12.5 L 50 7.5 Z M 0 22.5 L 0 27.5 L 50 27.5 L 50 22.5 Z M 0 37.5 L 0 42.5 L 50 42.5 L 50 37.5 Z"
    ></path></svg>
</template>;

const SideNav: TOC<{ Element: HTMLElement }> = <template>
  <aside>
    <PageNav ...attributes>
      <:page as |x|>
        <x.Link>
          {{nameFor x.page}}
          {{#if x.page.href}}
            <LinkEntryIcon />
          {{/if}}
        </x.Link>
      </:page>
      <:collection as |x|>
        {{#if x.index}}
          <x.index.Link>
            {{sentenceCase x.collection.name}}
          </x.index.Link>
        {{else}}
          {{sentenceCase x.collection.name}}
        {{/if}}
      </:collection>
    </PageNav>
  </aside>
</template>;

function removeLoader() {
  requestAnimationFrame(() => {
    document.querySelector('#kolay__loading')?.remove();
  });
}

export default Route(
  <template>
    {{(removeLoader)}}

    {{pageTitle "Docs :: " abbreviatedSha}}

    <MenuWrapper as |mmw|>
      <mmw.MobileMenu @mode="push" @maxWidth={{200}} as |mm|>
        <SideNav {{on "click" mm.actions.close}} />
      </mmw.MobileMenu>

      <mmw.Content class="container">
        <ScrollBehavior />
        <header>
          <div>
            <mmw.Toggle><Menu /></mmw.Toggle>
            <GroupNav />
          </div>
          <div>
            <ExternalLink href="https://github.com/universal-ember/kolay">GitHub</ExternalLink>
          </div>
        </header>

        <div class="big-layout">
          <SideNav />

          <main style="padding-top: 1rem;">
            {{outlet}}
          </main>
        </div>
      </mmw.Content>
    </MenuWrapper>

    {{!-- prettier-ignore --}}
    <style>
      .mobile-menu-wrapper__content,
      .mobile-menu__tray {
        background: none;
      }

      header {
        border-bottom: 1px solid currentColor;
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        gap: 1rem;

        div:first-child {
          display: flex; gap: 1rem;
          align-items: baseline;
        }
      }

      header button.mobile-menu__toggle {
        padding: 0.25rem 0.5rem;
        background: none;
        color: currentColor;
        width: 48px;
        height: 44px;
        display: inline-flex;
        align-self: center;
        align-items: center;
        justify-content: center;
        margin: 0;
      }

      @media (min-width: 768px) {
        .big-layout { display: grid; }
        header button.mobile-menu__toggle {
          display: none;
        }
      }

      @media (max-width: 768px) {
        .big-layout { display: flex; }
        .big-layout aside { display: none; }
      }

      /* The whole viewport is the page: short docs still fill it, so the
       * groups' full-height designs hold their shape */
      .mobile-menu-wrapper__content.container {
        min-height: 100dvh;
        display: flex;
        flex-direction: column;
      }

      .big-layout {
        /* fixed nav column: flipping between groups (whose page lists
         * differ in width) must not shift the content */
        grid-template-columns: 16rem 1fr;
        gap: 2rem;
        flex: 1;

        main {
          max-width: 100%;
          display: flex;
          flex-direction: column;
          overflow-x: hidden;
        }
      }

      .mobile-menu__tray, .big-layout {
        overflow-x: hidden;

        nav {
          ul {
            padding-left: 0.5rem;
            list-style: none;
            line-height: 1.75rem;
          }
        }
      }
    </style>
  </template>
);

export function nameFor(x: Page) {
  // The link text, defined via a json file next to the page
  if (x.title) {
    return x.title;
  }

  if (x.path.includes('/components/')) {
    return `<${pascalCase(x.name)} />`;
  }

  return sentenceCase(x.name);
}
