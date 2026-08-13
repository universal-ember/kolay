import { GroupNav, PageNav } from "kolay/components";

import type { TOC } from "@ember/component/template-only";
import type { Page } from "kolay";

export function nameFor(x: Page) {
  if (x.title) {
    return x.title;
  }

  if (x.path.includes("/components/")) {
    return `<${x.name} />`;
  }

  return x.name;
}

const SideNav: TOC<{ Element: HTMLElement }> = <template>
  <aside>
    <PageNav ...attributes>
      <:page as |x|>
        <x.Link>
          {{nameFor x.page}}
        </x.Link>
      </:page>
      <:folder as |x|>
        {{#if x.index}}
          <x.index.Link>
            {{x.folder.name}}
          </x.index.Link>
        {{else}}
          {{x.folder.name}}
        {{/if}}
      </:folder>
    </PageNav>
  </aside>
</template>;

<template>
  <header style="display: flex; align-items: baseline; gap: 1rem;">
    <GroupNav />
  </header>

  <div class="big-layout">
    <SideNav />

    <main style="padding-top: 1rem;">
      {{outlet}}
    </main>
  </div>
</template>
