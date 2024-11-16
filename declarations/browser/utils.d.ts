import type { Collection, Page } from '../types.ts';
export declare function isCollection(x: Page | Collection): x is Collection;
export declare function isIndex(x: Page | Collection): boolean;
export declare function getIndexPage(x: Collection): Page | undefined;
