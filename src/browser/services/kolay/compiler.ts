import Service, { service } from '@ember/service';

import { compile, getCompiler } from 'ember-repl';

import { getDefaultOptions } from './compiler/import-map.ts';

import type DocsService from './docs.ts';

export default class Compiler extends Service {
  @service('kolay/docs') declare docs: DocsService;

  compileMD = (code: string | undefined | null) => {
    const defaults = getDefaultOptions();

    const state = compile(getCompiler(this), code, {
      ...defaults,
      /**
       * Documentation can only be in markdown.
       */
      format: 'glimdown',
    });

    return state;
  };
}
