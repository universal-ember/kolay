# How To Contribute

## Installation

```bash
git clone https://github.com/universal-ember/kolay.git
cd kolay
pnpm install
```

## Project structure

This is a pnpm workspace monorepo:

| Path | Description |
|---|---|
| `.` | The `kolay` addon itself |
| `docs-app/` | The documentation site |
| `test-apps/*` | Integration test apps |

## Linting

```bash
pnpm lint
pnpm lint:fix
```

## Building the addon

```bash
pnpm build
```

## Running tests

```bash
cd test-apps/markdown-only   # or any test-app
pnpm test
```

## Running the docs site

```bash
cd docs-app
pnpm start
```

Then visit [http://localhost:4200](http://localhost:4200).
