import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { findRepoRoot, repositoryUrl, sourceMeta } from './source-meta.js';

const here = dirname(fileURLToPath(import.meta.url));

describe('repositoryUrl', () => {
  it.each([
    [
      'git+https://github.com/universal-ember/kolay.git',
      'https://github.com/universal-ember/kolay',
    ],
    ['https://github.com/universal-ember/kolay', 'https://github.com/universal-ember/kolay'],
    ['git://github.com/user/repo.git', 'https://github.com/user/repo'],
    ['git@github.com:user/repo.git', 'https://github.com/user/repo'],
    ['ssh://git@github.com/user/repo.git', 'https://github.com/user/repo'],
    ['github:user/repo', 'https://github.com/user/repo'],
    ['gitlab:user/repo', 'https://gitlab.com/user/repo'],
    ['bitbucket:user/repo', 'https://bitbucket.org/user/repo'],
    ['user/repo', 'https://github.com/user/repo'],
  ])('%s → %s', (input, output) => {
    expect(repositoryUrl(input)).toBe(output);
  });

  it('handles the object form', () => {
    expect(
      repositoryUrl({ type: 'git', url: 'git+https://github.com/universal-ember/kolay.git' })
    ).toBe('https://github.com/universal-ember/kolay');
  });

  it('is undefined when there is nothing usable', () => {
    expect(repositoryUrl(undefined)).toBeUndefined();
    expect(repositoryUrl({})).toBeUndefined();
    expect(repositoryUrl('gist:abc123')).toBeUndefined();
  });
});

const repoRoot = findRepoRoot(here) ?? '<not found>';

describe('findRepoRoot', () => {
  it('finds this repository (a worktree: .git is a file)', () => {
    expect(here.startsWith(repoRoot)).toBe(true);
  });
});

describe('sourceMeta', () => {
  it('derives url and docsPath, and mixes in the source-root meta file', async () => {
    // the runtime docs source of this very repository — its meta.json
    // (ordering) is user content and comes along
    const meta = await sourceMeta(join(repoRoot, 'docs'));

    expect(meta).toMatchInlineSnapshot(`
      {
        "docsPath": "docs",
        "order": [
          "rendering",
          "navigation",
          "utilities",
          "demo-support",
        ],
        "url": "https://github.com/universal-ember/kolay",
      }
    `);
  });
});
