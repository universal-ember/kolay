
function isReference(x) {
  if (!x) return false;
  return x.type === 'reference';
}
function isLiteral(x) {
  if (!x) return false;
  if (typeof x !== 'object') return false;
  if (x === null) return false;
  if (!('type' in x)) return false;
  return x.type === 'literal';
}

export { isLiteral, isReference };
//# sourceMappingURL=narrowing.js.map
