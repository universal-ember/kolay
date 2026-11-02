import { existsSync } from 'node:fs';
import { dirname, join, relative, sep } from 'node:path';

import { readJSONC } from './markdown-pages/parse.js';

/**
 * The repository root containing `dir`: the nearest ancestor with a
 * `.git` entry (a directory — or a file, for worktrees and submodules).
 *
 * @param {string} dir
 * @returns {string | undefined}
 */
export function findRepoRoot(dir) {
  let current = dir;

  while (true) {
    if (existsSync(join(current, '.git'))) {
      return current;
    }

    const parent = dirname(current);

    if (parent === current) {
      return undefined;
    }

    current = parent;
  }
}

const HOST_SHORTHANDS = {
  github: 'https://github.com/',
  gitlab: 'https://gitlab.com/',
  bitbucket: 'https://bitbucket.org/',
};

/**
 * package.json's `repository` (string or object form) → a browsable
 * https URL.
 *
 * @param {string | { type?: string; url?: string } | undefined} repository
 * @returns {string | undefined}
 */
export function repositoryUrl(repository) {
  let url = typeof repository === 'string' ? repository : repository?.url;

  if (!url) return undefined;

  url = url.replace(/^git\+/, '').replace(/\.git$/, '');

  for (const [shorthand, host] of Object.entries(HOST_SHORTHANDS)) {
    if (url.startsWith(`${shorthand}:`)) {
      return host + url.slice(shorthand.length + 1);
    }
  }

  // git@github.com:user/repo — scp-style ssh
  const scp = url.match(/^git@([^:]+):(.+)$/);

  if (scp) {
    return `https://${scp[1]}/${scp[2]}`;
  }

  url = url.replace(/^(git|ssh):\/\/(git@)?/, 'https://');

  if (url.startsWith('https://') || url.startsWith('http://')) {
    return url;
  }

  // npm's bare `user/repo` shorthand means github
  if (/^[^/]+\/[^/]+$/.test(url)) {
    return `https://github.com/${url}`;
  }

  return undefined;
}

/**
 * The meta for one docs() source:
 * - `url`: the repository URL, from the `repository` field of the
 *   package.json at the repository root
 * - `docsPath`: the repo-relative path to the source's docs
 * - anything else from a `meta.jsonc` (or `meta.json`) at the root of
 *   the source, mixed in (user keys win)
 *
 * @param {string} sourceCwd
 * @returns {Promise<Record<string, unknown>>}
 */
export async function sourceMeta(sourceCwd) {
  const derived = {};
  const repoRoot = findRepoRoot(sourceCwd);

  if (repoRoot) {
    derived.docsPath = relative(repoRoot, sourceCwd).split(sep).join('/');

    const packagePath = join(repoRoot, 'package.json');

    if (existsSync(packagePath)) {
      const rootPackage = await readJSONC(packagePath);
      const url = repositoryUrl(rootPackage?.repository);

      if (url) {
        derived.url = url;
      }
    }
  }

  for (const candidate of ['meta.jsonc', 'meta.json']) {
    const configPath = join(sourceCwd, candidate);

    if (existsSync(configPath)) {
      return { ...derived, ...(await readJSONC(configPath)) };
    }
  }

  return derived;
}
