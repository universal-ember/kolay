# Build Plugins

Kolay requires some build-time static analysis to function.

[`kolay(...)`][plugin-kolay] is the only required plugin. This generates the navigation and information about how Kolay's runtime code will fetch the markdown documents deployed with the app's static assets. Optionally, if a list of packages is provided, apiDocs will be generated from your library's type declarations. Rendering these api docs uses the [Signature Components][ui-signature] or [`APIDocs`][ui-apiDocs] components.

[plugin-kolay]: /plugins/kolay.md
[ui-signature]: /Runtime/components/component-signature.md
[ui-apiDocs]: /Runtime/components/api-docs.md
