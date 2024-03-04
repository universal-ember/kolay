# Build Plugins

Kolay requires some build-time static analysis to function.

[`markdownPages(...)`][plugin-md] is the only required plugin. This generates the navigation and information about how Kolay's runtime code will fetch the markdown documents deployed with the app's static assets.

Additionally, you may want [`apiDocs(...)`][plugin-apiDocs] to render JSDoc information generated from your library's type declarations. Rendering these uses the [Signature Components][ui-signature] or [`APIDocs`][ui-apiDocs] components.

[plugin-md]: /plugins/markdown-pages.md
[plugin-apiDocs]: /plugins/api-docs.md
[ui-signature]: /Runtime/components/component-signature.md
[ui-apiDocs]: /Runtime/components/api-docs.md
