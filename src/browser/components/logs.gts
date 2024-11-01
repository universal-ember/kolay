/* eslint-disable no-console */
import Component from '@glimmer/component';
import { registerDestructor } from '@ember/destroyable';

import { Scroller } from 'ember-primitives/components/scroller';
import { TrackedArray } from 'tracked-built-ins';

import type { TOC } from '@ember/component/template-only';
import type Owner from '@ember/owner';

const original = {
  log: console.log,
  warn: console.warn,
  error: console.error,
  debug: console.debug,
  info: console.info,
} as const;

type Levels = keyof typeof original;

const LEVELS = Object.keys(original) as Levels[];

let formatter = new Intl.DateTimeFormat('en-GB', {
  hour: 'numeric',
  minute: 'numeric',
  second: 'numeric',
  fractionalSecondDigits: 2,
});

const format = (date: Date) => formatter.format(date);

interface Log {
  level: string;
  timestamp: Date;
  message: string;
}

const LogList: TOC<{
  Args: {
    logs: Log[];
  };
}> = <template>
  <Scroller class='kolay__log-list__scroll' as |x|>
    {{#each @logs as |logEntry|}}
      <div class='kolay__log-list__level {{logEntry.level}}'>
        <span class='kolay__log-list__time'>{{format logEntry.timestamp}}</span>
        <span>{{logEntry.message}}</span>
      </div>
      {{(x.scrollToBottom)}}
    {{/each}}
  </Scroller>

  {{! prettier-ignore-start }}
  <style>
    .kolay__log-list__scroll { position: relative; overflow: auto; max-height:
    10rem; filter: invert(1); .kolay__log-list__level { display: flex; gap:
    0.5rem; } .kolay__log-list__time { border-right: 1px solid; padding-right:
    0.5rem; } }
  </style>
  {{! prettier-ignore-end }}
</template>;

export class Logs extends Component {
  logs = new TrackedArray<Log>();

  constructor(owner: Owner, args: any) {
    super(owner, args);

    registerDestructor(this, () =>
      LEVELS.forEach((level) => (console[level] = original[level])),
    );

    for (let level of LEVELS) {
      console[level] = (...messageParts) => {
        // If our thing fails, we want the normal
        // log to still happen, just in case.
        // Makes debugging easier
        original[level](...messageParts);

        (async () => {
          // We need to await here, so
          // we don't break {{log thing}} usage
          await Promise.resolve();

          this.logs.push({
            level,
            message: messageParts.join(' '),
            timestamp: new Date(),
          });
        })();
      };
    }
  }

  <template>
    <div class='kolay__in-viewport__logs'>
      <LogList @logs={{this.logs}} />
    </div>
    {{! prettier-ignore-start }}
    <style>
      .kolay__in-viewport__logs { position: fixed; bottom: 0; left: 0; right: 0;
      padding: 0.5rem; border: 1px solid gray; background: currentColor; filter:
      invert(1); }
    </style>
    {{! prettier-ignore-end }}
  </template>
}
