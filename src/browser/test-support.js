// @ts-ignore
export function setupKolay(hooks, config) {
  hooks.beforeEach(async function () {
    // @ts-ignore
    let docs = this.owner.lookup('service:kolay/docs');

    let userConfig = await config();

    await docs.setup(userConfig);
  });
}
