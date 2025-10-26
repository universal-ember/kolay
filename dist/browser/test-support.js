
function setupKolay(hooks, config) {
  hooks.beforeEach(async function () {
    const docs = this.owner.lookup('service:kolay/docs');
    const userConfig = config ? await config() : {};
    const [apiDocs, manifest] = await Promise.all([import('kolay/api-docs:virtual'), import('kolay/manifest:virtual')]);
    await docs.setup({
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      apiDocs,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      manifest,
      ...userConfig
    });
  });
}

/**
 * For changing which sub-context is loaded as the primary set of docs
 *
 * @param {{ owner: { lookup: (registryName: string) => any }}} context
 */
function selectGroup(context, groupName = 'root') {
  const docs = context.owner.lookup('service:kolay/docs');
  docs.selectGroup(groupName);
}

export { selectGroup, setupKolay };
//# sourceMappingURL=test-support.js.map
