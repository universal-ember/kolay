import { ConsoleLogger, Deserializer, FileRegistry, type ProjectReflection } from 'typedoc/browser';
import { describe, expect, it } from 'vitest';

import { generateTypeDocJSON } from './typedoc.js';

function makeProject(json: any): ProjectReflection {
  const logger = new ConsoleLogger();
  const deserializer = new Deserializer(logger);
  const project = deserializer.reviveProject('API Docs', json, {
    projectRoot: '/',
    registry: new FileRegistry(),
  });

  return project;
}

describe('generateTypeDocJSON', () => {
  it('can find browser declarations', async () => {
    const data = await generateTypeDocJSON({ packageName: 'kolay' });

    const project = makeProject(data);

    expect(project.name).toBe('kolay');
    expect(project.packageName).toBe('kolay');

    const child = project.getChildByName('declarations/browser');

    expect(child).toBeTruthy();

    const grandChild = child?.getChildByName('APIDocs');

    expect(grandChild).toBeTruthy();
  });

  it('can find build declarations', async () => {
    const data = await generateTypeDocJSON({ packageName: 'kolay' });

    const project = makeProject(data);
    const child = project.getChildByName('declarations/build/plugins');

    expect(child).toBeTruthy();

    const grandChild = child?.getChildByName('gitRef');

    expect(grandChild).toBeTruthy();
  });
});
