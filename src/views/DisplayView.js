import DisplayWordView from './DisplayWordView';
import DisplayContextView from './DisplayContextView';
import querySelectorOrThrow from '../util/querySelectorOrThrow';

export default class DisplayView {

  constructor(el) {
    if (!el) {
      throw new Error('DisplayView.el is required');
    }
    this.el = el;

    this.word = new DisplayWordView(querySelectorOrThrow(el, '.michspeed-word'));
    this.context = new DisplayContextView(querySelectorOrThrow(el, '.michspeed-context'));
  }

  renderWordComponents(components) {
    this.word.renderComponents(components);
  }

  renderEndState() {
    this.word.renderComponents({ prefix: '', left: 'THE', orp: ' ', right: 'END', suffix: '' });
  }

  renderContext(context) {
    this.context.setContext(context);
  }

}
