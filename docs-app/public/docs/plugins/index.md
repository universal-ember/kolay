# Build Plugins

Kolay requires some build-time static analysis to function.

[`createManifest(...)`](/plugins/create-manifest.md) is the only required plugin. This generates the navigation and information about how Kolay's runtime code will fetch the markdown documents deployed with the app's static assets.

Additionally, you may want [`apiDocs(...)`](/plugins/api-docs.md) to render JSDoc information generated from your library's type declarations. Rendering these uses the [Signature Components]() or [`APIDocs`]() components.

There are also a couple utility plugins that may or may not be useful as you build your documentation app.

- [copyFile(...)](/plugins/copy-file.md)
- [copyFileToPublic(...)](/plugins/copy-file-to-public.md)
