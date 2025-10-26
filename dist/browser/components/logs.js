
import Component from '@glimmer/component';
import { registerDestructor } from '@ember/destroyable';
import { Scroller } from 'ember-primitives/components/scroller';
import { TrackedArray } from 'tracked-built-ins';
import { precompileTemplate } from '@ember/template-compilation';
import { setComponentTemplate } from '@ember/component';
import templateOnly from '@ember/component/template-only';

/* eslint-disable no-console */
const original = {
  log: console.log,
  warn: console.warn,
  error: console.error,
  debug: console.debug,
  info: console.info
};
const LEVELS = Object.keys(original);
const formatter = new Intl.DateTimeFormat('en-GB', {
  hour: 'numeric',
  minute: 'numeric',
  second: 'numeric',
  fractionalSecondDigits: 2
});
const format = date => formatter.format(date);
const LogList = setComponentTemplate(precompileTemplate("\n  <Scroller class=\"kolay__log-list__scroll\" as |x|>\n    {{#each @logs as |logEntry|}}\n      <div class=\"kolay__log-list__level {{logEntry.level}}\">\n        <span class=\"kolay__log-list__time\">{{format logEntry.timestamp}}</span>\n        <span>{{logEntry.message}}</span>\n      </div>\n      {{(x.scrollToBottom)}}\n    {{/each}}\n  </Scroller>\n\n  {{!-- prettier-ignore-start --}}\n  <style>\n    .kolay__log-list__scroll {\n      position: relative;\n      overflow: auto;\n      max-height: 10rem;\n      filter: invert(1);\n      .kolay__log-list__level {\n        display: flex;\n        gap: 0.5rem;\n      }\n      .kolay__log-list__time {\n        border-right: 1px solid;\n        padding-right: 0.5rem;\n      }\n    }\n  </style>\n  {{!-- prettier-ignore-end --}}\n", {
  strictMode: true,
  scope: () => ({
    Scroller,
    format
  })
}), templateOnly());
class Logs extends Component {
  logs = new TrackedArray();
  constructor(...args) {
    super(...args);
    registerDestructor(this, () => LEVELS.forEach(level => console[level] = original[level]));
    for (const level of LEVELS) {
      console[level] = (...messageParts) => {
        // If our thing fails, we want the normal
        // log to still happen, just in case.
        // Makes debugging easier
        original[level](...messageParts);
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        (async () => {
          // We need to await here, so
          // we don't break {{log thing}} usage
          await Promise.resolve();
          this.logs.push({
            level,
            message: messageParts.join(' '),
            timestamp: new Date()
          });
        })();
      };
    }
  }
  static {
    setComponentTemplate(precompileTemplate("\n    <div class=\"kolay__in-viewport__logs\">\n      <LogList @logs={{this.logs}} />\n    </div>\n    {{!-- prettier-ignore-start --}}\n    <style>\n      .kolay__in-viewport__logs {\n        position: fixed;\n        bottom: 0;\n        left: 0;\n        right: 0;\n        padding: 0.5rem;\n        border: 1px solid gray;\n        background: currentColor;\n        filter: invert(1);\n      }\n    </style>\n    {{!-- prettier-ignore-end --}}\n  ", {
      strictMode: true,
      scope: () => ({
        LogList
      })
    }), this);
  }
}

export { Logs };
//# sourceMappingURL=logs.js.map
