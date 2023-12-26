const { execSync } = require('child_process');

module.exports = {
  gitRef() {
    const scriptOutput = execSync('git rev-parse --short HEAD', {
      encoding: 'utf-8',
    });

    return scriptOutput.trim();
  },
};
