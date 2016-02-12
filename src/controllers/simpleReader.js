import _bindAll from 'lodash/function/bindAll';
import _assign from 'lodash/object/assign';

import * as M from '../model';

import DisplayWordView from '../views/DisplayWordView';
import renderPopup from '../compiled-views/simplePopup';

import querySelectorOrThrow from '../util/querySelectorOrThrow';
import formatDuration from '../util/formatDuration';

var DEFAULT_OPTS = {
  onComplete: () => {}
};

export default class SimpleReader {
  /**
   * @constructs
   * @param {Object} el - HTML element in which the speed reader will be drawn.
   *    If no element is specified, one will be appended to the <body>
   */
  constructor(el=null, opts={}) {
    this.el = el || document.createElement('div');
    this.el.className = 'michspeed';
    this.el.innerHTML = renderPopup();

    this.opts = _assign({}, DEFAULT_OPTS, opts);

    if (!el) document.body.appendChild(this.el);

    _bindAll(this, 'close', 'togglePause', 'moveToPreviousParagraph', 'moveToNextParagraph', 'handleOptionsChange', 'toggleConfiguring');

    this.model = new M.ReaderModel();
    this.model.on('optionsDidChange', this.handleOptionsChange);

    this.infolineLeftEl = this.el.querySelector('.michspeed-infoline .michspeed-left');
    this.infolineRightEl = this.el.querySelector('.michspeed-infoline .michspeed-right');
    this.display = new DisplayWordView(querySelectorOrThrow(this.el, '.michspeed-display'));

    this.timer = null;
    this.setSource(null);
    this.setReadingSpeed(~~(localStorage.getItem('wpm') || 200));
    this.setConfiguring(!!localStorage.getItem('configuring') || false, 'initial');

    this._advancementTimerElapsed = this._advancementTimerElapsed.bind(this);
  }

  setConfigurationEnabled(enabled) {
    if (!enabled) {
      this.setConfiguring(false, 'disallowed');
    }
  }

  handleOptionsChange() {
    console.log('handleOptionsChange: %s', JSON.stringify(this.model.options));

    if (this.source) {
      this._resetTimerIfUnpaused(() => {
        this.source = this.source.reconfigure(this.model.options);
        if (this.stream) {
          this.stream.setReconfiguredSource(this.source);
        }
      });
    }
  }

  close() {
    this.pause();
    if (this.el.parentElement) {
      this.el.parentElement.removeChild(this.el);
    }
  }

  setArticle({ id, body, headline }) {
    this.setSource(new M.Source(body, { _id: id, headline: headline }));
  }

  setSimpleSlowMode() {
    const maxSpeed = 300;
    const defaultSpeed = 60;

    // a better default
    if (this.readingSpeed >= 200 && !localStorage.getItem('wpmAdjusted')) {
      localStorage.setItem('wpmAdjusted', 'true');
      this.setReadingSpeed(defaultSpeed, 'initial-adjustment');
    }
  }

  restart() {
    this.pause();
    this.setSource(this.source);
  }

  togglePause() {
    if (this.paused) {
      this.resumeOrRestart();
    } else {
      this.pause();
    }
  }

  resumeOrRestart() {
    if (!this.stream || !this.stream.hasMore()) {
      this.restart();
    }
    this.resume();
  }

  resume() {
    if (this.paused) {
      this.paused = false;
      this.el.classList.add('michspeed-hide-context');
      this.renderCurrentItemAndAdvanceUnlessPaused();
    }
  }

  pause() {
    if (!this.paused) {
      this.paused = true;
      this.el.classList.remove('michspeed-hide-context');
      if (this.timer) {
        clearTimeout(this.timer);
        this.timer = null;
      }
      this.renderPauseContext();
      this.renderCurrentItemAndAdvanceUnlessPaused();
    }

    return this.currentContext;
  }

  _resetTimerIfUnpaused(f) {
    if (!this.paused) {
      this.pause();
      if (f) {
        f();
      }
      this.resume();
    } else {
      if (f) {
        f();
      }
      this.renderPauseContext();
      this.renderCurrentItemAndAdvanceUnlessPaused();
    }
  }

  moveToPreviousParagraph() {
    if (this.stream.moveToPreviousParagraph()) {
      this._resetTimerIfUnpaused();
    }
  }

  moveToNextParagraph() {
    if (this.stream.moveToNextParagraph()) {
      this._resetTimerIfUnpaused();
    }
  }

  setSource(source) {
    this.source = source;
    this.paused = true;
    this.ended = false;
    this.currentItem = null;
    this.currentContext = null;
    this.currentWeight = 0;
    if (source) {
      this.stream = new M.VisualItemStream(source, this.model.options);
    }

    setTimeout(() => {
      this.renderCurrentItemAndAdvanceUnlessPaused();
    }, 0);
  }

  weightToTime(weight) {
    return this.readingDelay * weight;
  }

  setReadingSpeed(speed, reason) {
    this.readingSpeed = speed;
    this.readingDelay = Math.round(60000 / speed)
    if (reason === 'slider' || reason === 'initial-adjustment') {
      localStorage.setItem('wpm', speed);
    }

    this.currentWeight = (this.stream ? this.stream.totalWeightBefore() : 0);
  }

  toggleConfiguring() {
    this.setConfiguring(!this.configuring, 'button');
  }

  setConfiguring(value, reason) {
    this.configuring = value;
    if (reason !== 'initial') {
      if (reason !== 'disallowed') {
        localStorage.setItem('configuring', value ? 'true' : 'false');
      }
      this.updateClasses();
    }
  }

  renderCurrentItemAndAdvanceUnlessPaused() {
    if (!this.stream || !this.stream.hasMore()) {
      this.currentItem = null;
      this.currentContext = ['', '', ''];
      this.currentWeight = (this.source ? this.source.totalWeight : 0);
      this.paused = true;
      this.ended = true;
      this.renderCurrentItem();
      return;
    }

    var item = this.currentItem = this.stream.current();
    this.currentContext = this.stream.context();
    this.currentWeight = this.stream.totalWeightBefore();

    let effectiveDelay = Math.round(this.readingDelay * item.multiplier);
    if (!this.paused) {
      this.stream.shift();
      if (!this.timer) {
        this.timer = setTimeout(this._advancementTimerElapsed, effectiveDelay);
      }
    }

    console.log('Word: %s (%s:%s:%s:%s:%s)  delay: %d * %f = %d', item.text, item.prefix, item.left, item.orp, item.right, item.suffix, this.readingDelay, item.multiplier, effectiveDelay);
    setTimeout(() => {
      this.renderCurrentItem();
    }, 0);
  }

  _advancementTimerElapsed() {
    this.timer = null;
    this.renderCurrentItemAndAdvanceUnlessPaused();
  }

  renderCurrentItem() {
    if (this.ended) {
      this.opts.onComplete();
    } else if (this.currentItem) {
      this.display.renderComponents(this.currentItem);
    }
    this.renderPauseContext();
  }

  renderPauseContext() {
    if (!this.paused) {
      return;
    }

    // TODO pass this to the client
    // this.display.renderContext(this.currentContext);
  }

  getRemainingTime() {
    return formatDuration(this.weightToTime(this.source.totalWeight - this.currentWeight));
  }
}
