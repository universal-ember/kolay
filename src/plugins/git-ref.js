import { execSync } from 'node:child_process';

export function gitRef() {
  const scriptOutput = execSync('git rev-parse --short HEAD', {
    encoding: 'utf-8',
  });

  return scriptOutput.trim();
}
