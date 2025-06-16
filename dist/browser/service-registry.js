
import DocsService$1 from './services/kolay/api-docs.js';
import Compiler from './services/kolay/compiler.js';
import DocsService from './services/kolay/docs.js';
import Selected from './services/kolay/selected.js';

function registry(prefix) {
  return {
    [`${prefix}/services/kolay/api-docs`]: DocsService$1,
    [`${prefix}/services/kolay/compiler`]: Compiler,
    [`${prefix}/services/kolay/docs`]: DocsService,
    [`${prefix}/services/kolay/selected`]: Selected
  };
}

export { registry };
//# sourceMappingURL=service-registry.js.map
