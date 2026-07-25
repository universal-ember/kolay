# ember-mobile-menu

[Documentation](https://nickschot.github.io/ember-mobile-menu) · [GitHub](https://github.com/nickschot/ember-mobile-menu)

ember-mobile-menu provides the app shell this site lives in: a draggable, performant mobile menu with the desktop layout as a pass-through. It's what makes the side nav a swipe-in drawer on small screens without maintaining a second navigation implementation.

The whole shell is one wrapper in the application template:

```gjs
import MenuWrapper from "ember-mobile-menu/components/mobile-menu-wrapper";

<template>
  <MenuWrapper as |mmw|>
    <mmw.MobileMenu @mode="push" @maxWidth={{200}} as |mm|>
      <SideNav {{on "click" mm.actions.close}} />
    </mmw.MobileMenu>

    <mmw.Content>
      <header>
        <mmw.Toggle><HamburgerIcon /></mmw.Toggle>
        <GroupNav />
      </header>

      <div class="big-layout">
        <SideNav />
        <main>{{outlet}}</main>
      </div>
    </mmw.Content>
  </MenuWrapper>
</template>
```

The pieces:

- `mmw.MobileMenu` is the drawer. `@mode="push"` slides the page content aside (several other transition modes exist); it can also be swiped open and closed on touch screens.
- `mmw.Content` is everything that isn't the drawer — the normal page.
- `mmw.Toggle` is the hamburger button; it only does anything when the drawer is relevant.
- The same `SideNav` component renders twice: once inside the drawer, once in the desktop layout. CSS decides which one is visible, so there is exactly one nav implementation.
- `mm.actions.close` closes the drawer — attached as a click listener on the drawer's nav so following a link doesn't leave the menu open over the new page.

Import the theme once (this site uses the android theme, which also pulls in the addon's structural styles):

```js
import "ember-mobile-menu/themes/android";
```
