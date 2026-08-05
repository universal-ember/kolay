export default {
  // These demonstrate (and acceptance-test) kolay's redirects — see
  // /development/redirects for the feature's docs.
  redirects: [
    // a moved subtree
    { from: 'guides/*', to: 'development/*' },
    // a single moved page
    { from: 'legacy-install', to: 'install/index.md' },
  ],
};
