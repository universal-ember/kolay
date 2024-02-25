import { apiDocs as unApiDocs } from './api-docs/index.js';
import { copyFile as unCopyFile } from './copy-file.js';
import { copyToPublic as unCopyToPublic } from './copy-to-public.js';
import { markdownPages as unMarkdownPages } from './markdown-pages/index.js';

export const copyFile = unCopyFile.vite;
export const copyToPublic = unCopyToPublic.vite;
export const apiDocs = unApiDocs.vite;
export const markdownPages = unMarkdownPages.vite;
