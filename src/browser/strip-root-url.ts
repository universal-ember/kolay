/**
 * Strip the app's rootURL prefix from a path, yielding an app-relative path
 * (e.g. /pr-previews/pr-1234/Luna/… → /Luna/…). Anchored to the start of the
 * path and to a `/` boundary, so a coincidental mid-string occurrence of the
 * rootURL — or a sibling path that merely starts with the same characters
 * (`/pr-1234-old/…`) — is untouched. The rootURL may be given with or
 * without its trailing slash, matching `rebaseAuthoredLinks`. A no-op when
 * rootURL is the default '/' or the path does not start with it.
 */
export function stripRootURL(path: string, rootURL: string): string;
export function stripRootURL(path: string | null, rootURL: string): string | null;

export function stripRootURL(path: string | null, rootURL: string): string | null {
  if (!path) return path;

  const base = rootURL.replace(/\/$/, '');

  if (!base) return path;

  if (path === base || path === base + '/') return '/';

  if (path.startsWith(base + '/')) return path.slice(base.length);

  return path;
}
