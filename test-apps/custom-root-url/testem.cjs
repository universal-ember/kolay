"use strict";

if (typeof module !== "undefined") {
  module.exports = {
    // The app is built with base/rootURL "/my-github-project/", so serve the
    // test page under that prefix and route the prefix back to `dist` —
    // otherwise the base-prefixed asset URLs 404 and the app never boots.
    test_page: "my-github-project/tests/index.html?hidepassed",
    routes: {
      "/my-github-project": ".",
    },
    cwd: "dist",
    disable_watching: true,
    launch_in_ci: ["Chrome"],
    launch_in_dev: ["Chrome"],
    browser_start_timeout: 120,
    browser_args: {
      Chrome: {
        ci: [
          // --no-sandbox is needed when running Chrome inside a container
          process.env.CI ? "--no-sandbox" : null,
          "--headless",
          "--disable-dev-shm-usage",
          "--disable-software-rasterizer",
          "--mute-audio",
          "--remote-debugging-port=0",
          "--window-size=1440,900",
        ].filter(Boolean),
      },
    },
  };
}
