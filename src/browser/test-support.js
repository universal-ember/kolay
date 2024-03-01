// @ts-ignore
export function setupKolay(hooks, config) {
  hooks.beforeEach(async function () {
    // @ts-ignore
    let docs = this.owner.lookup('service:kolay/docs');

    let userConfig = await config();

    await docs.setup(userConfig);
  });
}

/**
 * For changing which sub-context is loaded as the primary set of docs
 *
 * @param {{ owner: { lookup: (registryName: string) => any }}} context
 */
export function selectGroup(context, groupName = 'root') {
  let docs = context.owner.lookup('service:kolay/docs');

  docs.selectGroup(groupName);
}
