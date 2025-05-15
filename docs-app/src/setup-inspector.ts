/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import Ember from 'ember';
import * as destroyable from '@glimmer/destroyable';
import * as reference from '@glimmer/reference';
import * as runtime from '@glimmer/runtime';
import * as tracking from '@glimmer/tracking';
import * as validator from '@glimmer/validator';
import { RSVP } from '@ember/-internals/runtime';

import config from './config';

window.define('@glimmer/tracking', () => tracking);
window.define('@glimmer/runtime', () => runtime);
window.define('@glimmer/validator', () => validator);
window.define('@glimmer/reference', () => reference);
window.define('@glimmer/destroyable', () => destroyable);
window.define('rsvp', () => RSVP);
window.define('ember', () => ({ default: Ember }));
window.define('docs-app/config/environment', () => ({ default: config }));
