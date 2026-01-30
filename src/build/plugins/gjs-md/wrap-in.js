export function wrapIn(tagName, attributes) {
  return function wrapNode(node, meta) {
    return {
      data: {
        hProperties: {
          ...attributes,
          className: attributes.class,
          'data-meta': meta,
        },
        type: tagName,
        children: [node],
      },
    };
  };
}
