/* eslint-disable no-console */
import Component from '@glimmer/component';
import { registerDestructor } from '@ember/destroyable';

import { TrackedArray } from 'tracked-built-ins';

const original = {
  log: console.log,
  warn: console.warn,
  error: console.error,
  debug: console.debug,
  info: console.info,
};

const LEVELS = Object.keys(original);

const LogList = <template>
  <div class='kolay__log-list__scroll'>
    {{#each @logs as |logEntry|}}
      <div class='kolay__log-list__level {{logEntry.level}}'>
        <span class='kolay__log-list__time'>{{format logEntry.timestamp}}</span>
        <span>{{logEntry.message}}</span>
      </div>
      {{(scrollToBottom)}}
    {{/each}}
  </div>

  <style>
    .kolay__log-list__scroll { position: relative; overflow: auto; max-height:
    10rem; filter: invert(1); .kolay__log-list__level { display: flex; gap:
    0.5rem; } .kolay__log-list__time { border-right: 1px solid; padding-right:
    0.5rem; } }
  </style>
</template>;

export class Logs extends Component {
  logs = new TrackedArray();

  constructor(...args) {
    super(...args);

    registerDestructor(this, () =>
      LEVELS.forEach((level) => (console[level] = original[level])),
    );

    for (let level of LEVELS) {
      console[level] = (...messageParts) => {
        // If our thing fails, we want the normal
        // log to still happen, just in case.
        // Makes debugging easier
        original[level](...messageParts);

        this.logs.push({
          level,
          message: messageParts.join(' '),
          timestamp: new Date(),
        });
      };
    }
  }

  <template>
    <div class='kolay__in-viewport__logs'>
      <LogList @logs={{this.logs}} />
    </div>
    <style>
      .kolay__in-viewport__logs { position: fixed; bottom: 0; left: 0; right: 0;
      padding: 0.5rem; border: 1px solid gray; background: currentColor; filter:
      invert(1); }
    </style>
  </template>
}

let frame;

function scrollToBottom() {
  if (frame) {
    cancelAnimationFrame(frame);
  }

  frame = requestAnimationFrame(() => {
    let el = document.querySelector('.kolay__log-list__scroll');

    el.scrollTo({
      top: el.scrollHeight,
      left: 0,
      behavior: 'smooth',
    });
  });
}

let formatter = new Intl.DateTimeFormat('en-GB', {
  hour: 'numeric',
  minute: 'numeric',
  second: 'numeric',
  fractionalSecondDigits: 2,
});

const format = (date) => formatter.format(date);
