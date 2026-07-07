/**
 * Strip the app's rootURL prefix from a path, yielding an app-relative path
 * (e.g. /pr-previews/pr-1234/Luna/… → /Luna/…). Anchored to the start of the
 * path so a coincidental mid-string occurrence of the rootURL is untouched.
 * A no-op when rootURL is the default '/' or the path does not start with it.
 */
export function stripRootURL(path: string, rootURL: string): string;
export function stripRootURL(path: string | null, rootURL: string): string | null;

export function stripRootURL(path: string | null, rootURL: string): string | null {
  if (path && rootURL !== '/' && path.startsWith(rootURL)) {
    return '/' + path.slice(rootURL.length);
  }

  return path;
}
