function setupKolay(hooks, config) {
  hooks.beforeEach(async function () {
    const docs = this.owner.lookup('service:kolay/docs');
    const userConfig = config ? await config() : {};

    // TODO: figure this out later
    await docs.setup(userConfig);
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
