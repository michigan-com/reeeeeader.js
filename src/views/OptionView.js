import _bindAll from 'lodash/function/bindAll';

class OptionView {

  constructor(el, option, model) {
    this.el = el;
    this.option = option;
    this.model = model;
  }

}

export class CheckboxOptionView extends OptionView {

  constructor(el, option, model) {
    super(el, option, model);
    _bindAll(this, 'handleClick')

    if (model.getOption(option.key)) {
      this.el.setAttribute('checked', 'checked');
    }
    this.el.addEventListener('click', this.handleClick, false);
  }

  handleClick(e) {
    this.model.setOption(this.option.key, this.el.checked);
  }

}

export class SliderOptionView extends OptionView {

  constructor(el, option, model) {
    super(el, option, model);
    _bindAll(this, 'handleSliderInput', 'handleReset')

    this.valueEl = document.getElementById(option.domId+'-value');
    this.resetEl = document.getElementById(option.domId+'-reset');
    this.el.addEventListener('input', this.handleSliderInput, false);
    this.resetEl.addEventListener('click', this.handleReset, false);

    this.renderSliderValue();
    this.renderValue();
  }

  handleSliderInput(e) {
    this.model.setOption(this.option.key, +this.el.value);
    this.renderValue();
  }

  handleReset() {
    this.model.setOption(this.option.key, this.option.defaultValue);
    this.renderSliderValue();
    this.renderValue();
  }

  renderSliderValue() {
    this.el.value = +this.value();
  }

  renderValue() {
    let s = '' + this.value();
    if (s.indexOf('.') < 0) {
      s += '.0';
    }
    this.valueEl.textContent = s;
  }

  value() {
    return this.model.getOption(this.option.key) || this.option.defaultValue;
  }

}
