# ember-mobile-menu

[Documentation](https://nickschot.github.io/ember-mobile-menu) · [GitHub](https://github.com/nickschot/ember-mobile-menu)

ember-mobile-menu supplies the app shell of this site. It is a mobile menu that the reader can drag, and it passes the desktop layout through. It makes the side nav a drawer on a small screen, and you keep only one navigation implementation.

The complete shell is one wrapper in the application template:

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

The parts:

- `mmw.MobileMenu` is the drawer. `@mode="push"` moves the page content to the side. There are other transition modes. On a touch screen, the reader can also open and close the drawer with a swipe.
- `mmw.Content` is everything that is not the drawer, which is the normal page.
- `mmw.Toggle` is the hamburger button. It does something only when the drawer is available.
- The same `SideNav` component renders two times: one time in the drawer, and one time in the desktop layout. The CSS decides which one is visible, so there is only one nav implementation.
- `mm.actions.close` closes the drawer. It is a click listener on the nav in the drawer. A click on a link then does not leave the menu open above the new page.

Import the theme one time. This site uses the android theme, which also brings in the structural styles of the addon:

```js
import "ember-mobile-menu/themes/android";
```
