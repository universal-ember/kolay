import type { Manifest } from '@universal-ember/kolay-ui/services/kolay/types';

/**
 * Loads the list and tree data for the discovered pages from the markdownDocs plugin
 *
 */
export const load: () => Promise<Manifest>;
