import done from 'promise-done';
import _bindAll from 'lodash/function/bindAll';
import _toArray from 'lodash/lang/toArray';

import * as M from '../model';

import DisplayView from '../views/DisplayView';
import { CheckboxOptionView, SliderOptionView } from '../views/OptionView';
import renderPopup from '../../interim/views/popup';

import querySelectorOrThrow from '../util/querySelectorOrThrow';
import formatDuration from '../util/formatDuration';

import xr from 'xr';


export default class ReadingPopupController {
  constructor() {
    this.el = document.createElement('div');
    this.el.className = 'michspeed';
    this.el.innerHTML = renderPopup({options: M.OPTIONS});
    document.body.appendChild(this.el);

    _bindAll(this, 'close', 'togglePause', 'moveToPreviousParagraph', 'moveToNextParagraph', 'handleOptionsChange', 'toggleConfiguring');

    this.model = new M.ReaderModel();
    this.model.on('optionsDidChange', this.handleOptionsChange);

    this.headlineEl = this.el.querySelector('h1');
    this.playButtonEl = this.el.querySelector('.michspeed-play');
    this.configureButtonEl = this.el.querySelector('.michspeed-configure');
    this.infolineLeftEl = this.el.querySelector('.michspeed-infoline .michspeed-left');
    this.infolineRightEl = this.el.querySelector('.michspeed-infoline .michspeed-right');
    this.display = new DisplayView(querySelectorOrThrow(this.el, '.michspeed-display'));

    for (let el of _toArray(this.el.querySelectorAll('.michspeed-close'))) {
      el.addEventListener('click', this.close, false);
    }

    this.wpmSliderEl = document.querySelector('#michspeed-wpm-slider');
    this.wpmSliderEl.addEventListener('input', () => this.setReadingSpeed(~~this.wpmSliderEl.value, 'slider'), false);
    this.wpmValueEl = document.querySelector('#michspeed-wpm-value');

    this.timer = null;
    this.setSource(null);
    this.setReadingSpeed(~~(localStorage.getItem('wpm') || 200));
    this.setConfiguring(!!localStorage.getItem('configuring') || false, 'initial');

    this._advancementTimerElapsed = this._advancementTimerElapsed.bind(this);

    document.querySelector('.michspeed-play').addEventListener('click', this.togglePause.bind(this), false);
    document.querySelector('.michspeed-restart').addEventListener('click', this.restart.bind(this), false);
    document.querySelector('.michspeed-pp').addEventListener('click', this.moveToPreviousParagraph.bind(this), false);
    document.querySelector('.michspeed-pn').addEventListener('click', this.moveToNextParagraph.bind(this), false);
    this.display.el.addEventListener('click', this.togglePause, false);
    this.configureButtonEl.addEventListener('click', this.toggleConfiguring, false);

    for (let option of M.OPTIONS) {
      this._mountOption(option);
    }

    this.updateClasses();
  }

  _mountOption(option) {
    let el = document.getElementById(option.domId);
    if (option.type === 'bool') {
      new CheckboxOptionView(el, option, this.model);
    } else if (option.type === 'multiplier') {
      new SliderOptionView(el, option, this.model);
    }
  }

  setConfigurationEnabled(enabled) {
    this.configureButtonEl.classList.toggle('michspeed-hidden', !enabled);
    if (!enabled) {
      this.setConfiguring(false, 'disallowed');
    }
  }

  handleOptionsChange() {
    console.log('handleOptionsChange: %s', JSON.stringify(this.model.options));
    this.updateClasses();

    if (this.source) {
      this._resetTimerIfUnpaused(() => {
        this.source = this.source.reconfigure(this.model.options);
        if (this.stream) {
          this.stream.setReconfiguredSource(this.source);
        }
      });
    }
  }

  updateClasses() {
    this.el.classList.toggle('michspeed-enable-orp', this.model.getOption('orpHighlightEnabled'))
    this.el.classList.toggle('michspeed-enable-reticle', this.model.getOption('reticleEnabled'))
    this.el.classList.toggle('michspeed-enable-options', this.configuring)
  }

  close() {
    this.pause();
    if (this.el.parentElement) {
      this.el.parentElement.removeChild(this.el);
    }
  }

  loadArticle(articleId) {
    console.log('Loading article with ID %s', articleId);
    this.headlineEl.textContent = 'Loading...';
    this._loadArticle(articleId).catch(done);
  }

  async _loadArticle(articleId) {
    let article = await M.loadArticle(articleId);
    console.log('Loaded article:', article);
    this.setSource(new M.Source(article.body, { _id: article.id, headline: article.headline }));
  }

  loadText(textId) {
    console.log('Loading text with ID %s', textId);
    this.headlineEl.textContent = 'Loading...';
    this._loadText(textId).catch(done);
  }

  async _loadText(textId) {
    let text = await M.loadText(textId);
    console.log('Loaded text:', text);
    console.log('this.wpmSliderEl =', this.wpmSliderEl);

    const maxSpeed = 300;
    const defaultSpeed = 60;
    this.wpmSliderEl.min = "1";
    this.wpmSliderEl.max = ''+maxSpeed;
    this.wpmSliderEl.step = "1";

    // a better default
    if (this.readingSpeed >= 200 && !localStorage.getItem('wpmAdjusted')) {
      localStorage.setItem('wpmAdjusted', 'true');
      this.setReadingSpeed(defaultSpeed, 'initial-adjustment');
    }

    this.setSource(new M.Source(text.body, { _id: text.id, headline: text.title }));
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
      this._renderPlayButtonTitle();
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
      this._renderPlayButtonTitle();
      this.renderPauseContext();
      this.renderCurrentItemAndAdvanceUnlessPaused();
    }
  }

  _renderPlayButtonTitle() {
    this.playButtonEl.textContent = (this.paused ? 'play' : 'pause');
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

      this.headlineEl.textContent = source.headline;
    }

    this._renderPlayButtonTitle();

    setTimeout(() => {
      this.renderCurrentItemAndAdvanceUnlessPaused();
    }, 0);
  }
  
  weightToTime(weight) {
    return this.readingDelay * weight;
  }

  setReadingSpeed(speed, reason) {
    this.readingSpeed = speed;
    this.readingDelay = Math.round(60000 / speed);
    this.wpmValueEl.textContent = '' + speed;
    if (reason === 'slider' || reason === 'initial-adjustment') {
      localStorage.setItem('wpm', speed);
    } else {
      this.wpmSliderEl.value = speed;
    }

    this.currentWeight = (this.stream ? this.stream.totalWeightBefore() : 0);
    this.renderTime();
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
      this.display.renderEndState();
    } else if (this.currentItem) {
      this.display.renderWordComponents(this.currentItem);
    }
    this.renderPauseContext();
  }

  renderPauseContext() {
    if (!this.paused) {
      return;
    }
    this.display.renderContext(this.currentContext);
    this.renderTime();
  }

  renderTime() {
    let left = '', right = '';
    if (this.stream) {
      let weight = this.currentWeight;
      if (weight > 0) {
        left = 'reading time: ' + formatDuration(this.weightToTime(weight)) + ' of ' + formatDuration(this.weightToTime(this.source.totalWeight));
      } else {
        left = 'reading time: ' + formatDuration(this.weightToTime(this.source.totalWeight));
      }
      let ewpm = Math.round(this.source.length / (this.weightToTime(this.source.totalWeight) / 60000));
      right = `effective speed: ${ewpm}`;
    }
    this.infolineLeftEl.textContent = left;
    this.infolineRightEl.textContent = right;
  }
}
