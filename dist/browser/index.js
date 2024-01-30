import Component from '@glimmer/component';
import { TrackedArray } from 'tracked-built-ins';
import { registerDestructor } from '@ember/destroyable';
import { precompileTemplate } from '@ember/template-compilation';
import { setComponentTemplate } from '@ember/component';
import templateOnly from '@ember/component/template-only';

const original = {
  log: console.log,
  warn: console.warn,
  error: console.error,
  debug: console.debug,
  info: console.info
};
const LEVELS = Object.keys(original);
class Logs extends Component {
  logs = new TrackedArray();
  constructor(...args1) {
    super(...args1);
    registerDestructor(this, () => LEVELS.forEach(level1 => console[level1] = original[level1]));
    for (let level1 of LEVELS) {
      console[level1] = (...messageParts1) => {
        // If our thing fails, we want the normal
        // log to still happen, just in case.
        // Makes debugging easier
        original[level1](...messageParts1);
        this.logs.push({
          level: level1,
          message: messageParts1.join(' '),
          timestamp: new Date()
        });
      };
    }
  }
  static {
    setComponentTemplate(precompileTemplate("<div class=\"kolay__in-viewport__logs\"><LogList @logs={{this.logs}} /></div> <style> .kolay__in-viewport__logs {\n        position: fixed;\n        bottom: 0;\n        left: 0;\n        right: 0;\n        padding: 0.5rem;\n        border: 1px solid gray;\n      } </style>", {
      scope: () => ({
        LogList
      }),
      strictMode: true
    }), this);
  }
}
let frame;
function scrollToBottom() {
  if (frame) {
    cancelAnimationFrame(frame);
  }
  frame = requestAnimationFrame(() => {
    let el1 = document.querySelector('.kolay__log-list__scroll');
    el1.scrollTo({
      top: el1.scrollHeight,
      left: 0,
      behavior: 'smooth'
    });
  });
}
let formatter = new Intl.DateTimeFormat('en-GB', {
  hour: "numeric",
  minute: "numeric",
  second: "numeric",
  fractionalSecondDigits: 2
});
const format = date1 => formatter.format(date1);
const LogList = setComponentTemplate(precompileTemplate("<div class=\"kolay__log-list__scroll\">{{#each @logs as |logEntry|}}<div class=\"kolay__log-list__level {{logEntry.level}}\"><span class=\"kolay__log-list__time\">{{format logEntry.timestamp}}</span> <span>{{logEntry.message}}</span></div> {{(scrollToBottom)}}{{/each}}</div> <style> .kolay__log-list__scroll {\n      position: relative;\n      overflow: auto;\n      max-height: 10rem;\n\n      .kolay__log-list__level {\n        display: flex;\n        gap: 0.5rem;\n      }\n\n      .kolay__log-list__time {\n        border-right: 1px solid;\n        padding-right: 0.5rem;\n      }\n    } </style>", {
  scope: () => ({
    format,
    scrollToBottom
  }),
  strictMode: true
}), templateOnly());

export { Logs };
//# sourceMappingURL=index.js.map
