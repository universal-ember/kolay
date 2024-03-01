/** @type {string[]} */
export const packageNames = [];
export const loadApiDocs = new Proxy(
  {},
  {
    get() {
      const placeholder = () => {
        throw new Error('runtime implementation should not be seen. The build has failed');
      };

      return placeholder;
    },
  }
);

export const load = () => Promise.resolve({});
