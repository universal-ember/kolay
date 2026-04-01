/**
 * Taken from https://github.com/sveltejs/vite-plugin-svelte/blob/170bacc73d95d268e3673a5ec339da187adb82e0/packages/vite-plugin-svelte/src/utils/id.js#L174
 */
export function buildIdFilter(options?: {}): {
    id: {
        include: any[];
        exclude: any[];
    };
};
export function extFilter(ext: any): {
    id: {
        include: any[];
        exclude: any[];
    };
};
//# sourceMappingURL=utils.d.ts.map