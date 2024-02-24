declare module 'virtual:kolay/api-docs' {
  export const packageNames: string[];
  export const loadApiDocs: Record<string, () => ReturnType<typeof fetch>>;
}
