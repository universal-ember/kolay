import APIDocs from './services/kolay/api-docs.ts';
import Compiler from './services/kolay/compiler.ts';
import Docs from './services/kolay/docs.ts';
import Selected from './services/kolay/selected.ts';

export function registry(prefix: string) {
  return {
    [`${prefix}/services/kolay/api-docs`]: APIDocs,
    [`${prefix}/services/kolay/compiler`]: Compiler,
    [`${prefix}/services/kolay/docs`]: Docs,
    [`${prefix}/services/kolay/selected`]: Selected,
  } as const;
}
