function isCollection(x) {
  return 'pages' in x;
}
function isIndex(x) {
  if (isCollection(x)) return false;
  return x.path.endsWith('index.md');
}
function getIndexPage(x) {
  let page = x.pages.find(isIndex);
  if (page && isCollection(page)) return;
  return page;
}

export { getIndexPage, isCollection, isIndex };
//# sourceMappingURL=utils.js.map
