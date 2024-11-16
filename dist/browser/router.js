function addRoutes(context) {
  /**
   * We need a level of nesting for every `/` in the URL so that we don't over-refresh / render the whole page
   */
  context.route('page', {
    path: '/*page'
  }, function () {});
}

export { addRoutes };
//# sourceMappingURL=router.js.map
