'use strict';

// The all-links crawl runs in its own browser session, because it cannot share
// one with the rest of the suite: compiling every page leaves ember-repl's
// module-level compiler unable to serve another test app, so whichever runs
// second gets 120s timeouts. Alone and first, the crawl finishes in about 3s.
if (typeof module !== 'undefined') {
  module.exports = {
    ...require('./testem.cjs'),
    test_page: 'tests/index.html?hidepassed&filter=All Links',
  };
}
