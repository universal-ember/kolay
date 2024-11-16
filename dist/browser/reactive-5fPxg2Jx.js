import { resourceFactory, resource } from 'ember-resources';

function Compiled(textFn) {
  return resource(({
    owner
  }) => {
    let compiler = owner.lookup('service:kolay/compiler');
    let text = typeof textFn === 'function' ? textFn() : textFn;
    return compiler.compileMD(text);
  });
}

// template-only support
resourceFactory(Compiled);

export { Compiled as C };
//# sourceMappingURL=reactive-5fPxg2Jx.js.map
