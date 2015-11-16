import escapeHtml from 'escape-html';

export default class DisplayContextView {

  constructor(el) {
    this.el = el;
  }

  setContext(context) {
    let [prefix, focus, suffix] = context;

    let p = escapeHtml(prefix);
    let f = escapeHtml(focus);
    let s = escapeHtml(suffix);
    this.el.innerHTML = `${p} <em>${f}</em> ${s}`;
  }

}
