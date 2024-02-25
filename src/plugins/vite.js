import { apiDocs as unApiDocs } from './api-docs/index.js';
import { copyFile as unCopyFile } from './copy-file.js';
import { copyToPublic as unCopyToPublic } from './copy-to-public.js';
import {
  createManifest as unCreateManifest,
  markdownPages as unMarkdownPages,
} from './create-manifest/index.js';

export const copyFile = unCopyFile.vite;
export const copyToPublic = unCopyToPublic.vite;
export const createManifest = unCreateManifest.vite;
export const apiDocs = unApiDocs.vite;
export const markdownPages = unMarkdownPages.vite;
