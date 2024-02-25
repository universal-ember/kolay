import { apiDocs as unApiDocs } from './api-docs/index.js';
import { copyFile as unCopyFile } from './copy-file.js';
import { copyToPublic as unCopyToPublic } from './copy-to-public.js';
import { markdownPages as unMarkdownPages } from './markdown-pages/index.js';

export const copyFile = unCopyFile.webpack;
export const copyToPublic = unCopyToPublic.webpack;
export const apiDocs = unApiDocs.webpack;
export const markdownPages = unMarkdownPages.webpack;
