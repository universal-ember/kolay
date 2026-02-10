import 'ember-mobile-menu/themes/android';

import { on } from '@ember/modifier';

import { pascalCase, sentenceCase } from 'change-case';
// @ts-expect-error no types for the mobile-menu
import MenuWrapper from 'ember-mobile-menu/components/mobile-menu-wrapper';
import { pageTitle } from 'ember-page-title';
import Route from 'ember-route-template';
import { GroupNav, PageNav } from 'kolay/components';
import { ExternalLink } from 'nvp.ui';

import { abbreviatedSha } from '~build/git';

import type { TOC } from '@ember/component/template-only';
import type { Page } from 'kolay';

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

      .big-layout {
        grid-template-columns: max-content 1fr;
        gap: 2rem;

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
  // We defined componentName via json file

  if ('componentName' in x) {
    return `${x.componentName}`;
  }

  if (x.path.includes('/components/')) {
    return `<${pascalCase(x.name)} />`;
  }

  return sentenceCase(x.name);
}
