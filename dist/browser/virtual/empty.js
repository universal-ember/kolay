/** @type {string[]} */
const packageNames = [];
const loadApiDocs = new Proxy({}, {
  get() {
    const placeholder = () => {
      throw new Error('runtime implementation should not be seen. The build has failed');
    };
    return placeholder;
  }
});
const load = () => Promise.resolve({});
const setup = () => {
  throw new Error(`runtime implementation should not be seen. The build has failed`);
};
const setupKolay = setup;

export { load, loadApiDocs, packageNames, setup, setupKolay };
//# sourceMappingURL=empty.js.map
