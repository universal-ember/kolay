/**
 * @typedef {object} Group
 * @property {string} name
 * @property {string} src
 * @property {string | undefined} [ include ]
 * @property {string[] | undefined} [ exclude ]
 * @property {boolean | undefined} [ onlyDirectories ]
 *
 * @typedef {object} Options
 * @property {string | undefined} [ src ]
 * @property {Group[] | undefined} [ groups ]
 *
 * @param {Options} options
 * @return {Promise<import('../../../types.ts').Manifest>}
 */
export function discover({ groups, src }: Options): Promise<import("../../../types.ts").Manifest>;
export type Group = {
    name: string;
    src: string;
    include?: string | undefined;
    exclude?: string[] | undefined;
    onlyDirectories?: boolean | undefined;
};
export type Options = {
    src?: string | undefined;
    groups?: Group[] | undefined;
};
export type PathsForOptions = {
    include: string;
    exclude: string[];
    cwd: string;
    onlyDirectories: boolean;
    prefix?: string;
};
