# Release Process

[release-plan](https://github.com/embroider-build/release-plan/) does most of the release work in this repository. First, label all of your pull requests correctly, as shown below. Then release-plan opens a pull request for you. That pull request updates `CHANGELOG.md` and `.release-plan.json`. The merge of that pull request prepares the release.

## Preparation

Two tasks are left for you before a release:

- Label **all** pull requests that were merged after the last release.
- Update the pull request titles, so that our users understand them.

[keepachangelog.com](https://keepachangelog.com/en/1.1.0/) explains why this is important.
The principle is this: a changelog is for humans, not for machines.

Use one of these labels on each merged pull request:

- `breaking` — the pull request is a breaking change.
- `enhancement` — the pull request adds a feature.
- `bug` — the pull request corrects a fault from an earlier release.
- `documentation` — the pull request adds or updates documentation.
- `internal` — an internal change, or a change that fits no other category.

**Note:** `release-plan` needs a label on **all** pull requests. If a pull request fits no other category, label it `internal`.

## Release

After the preparation, the release is one step. Merge the open [Plan Release](https://github.com/universal-ember/kolay/pulls?q=is%3Apr+is%3Aopen+%22Prepare+Release%22+in%3Atitle) pull request.
