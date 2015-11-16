import querySelectorOrThrow from '../util/querySelectorOrThrow';
import escapeHtml from 'escape-html';

export default class DisplayWordView {

  constructor(el) {
    this.el = el;

    this.prefixEl = querySelectorOrThrow(el, '.michspeed-prefix');
    this.leftEl   = querySelectorOrThrow(el, '.michspeed-left');
    this.orpEl    = querySelectorOrThrow(el, '.michspeed-orp');
    this.rightEl  = querySelectorOrThrow(el, '.michspeed-right');
    this.suffixEl = querySelectorOrThrow(el, '.michspeed-suffix');
  }

  renderComponents(components) {
    this._render(this.prefixEl, components.prefix);
    this._render(this.leftEl, components.left);
    this._render(this.orpEl, components.orp);
    this._render(this.rightEl, components.right);
    this._render(this.suffixEl, components.suffix);
  }

  _render(el, text) {
    el.innerHTML = escapeHtml(text).replace(/ /g, '&nbsp;');
  }

}
