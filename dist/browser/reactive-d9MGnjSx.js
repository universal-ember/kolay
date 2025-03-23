import { resourceFactory, resource } from 'ember-resources';

function Compiled(textFn) {
  return resource(({
    owner
  }) => {
    const compiler = owner.lookup('service:kolay/compiler');
    const text = typeof textFn === 'function' ? textFn() : textFn;
    return compiler.compileMD(text);
  });
}

// template-only support
resourceFactory(Compiled);

export { Compiled as C };
//# sourceMappingURL=reactive-d9MGnjSx.js.map
