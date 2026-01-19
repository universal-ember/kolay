export interface LiveCodeExtractionOptions {
  isLive?: (meta: string, lang: string) => boolean;
  isPreview?: (meta: string) => boolean;
  isBelow?: (meta: string) => boolean;
}

export interface PublicOptions {
  scope?: Record<string, unknown>;
  remarkPlugins?: unknown[];
  rehypePlugins?: unknown[];
}

export type InternalOptions = PublicOptions & LiveCodeExtractionOptions;
