import { EventEmitter } from 'events';
import { OPTIONS } from './options';

export default class ReaderModel extends EventEmitter {

  constructor() {
    super();
    this._loadOptions();
  }

  getOption(key) {
    return this.options[key];
  }

  setOption(key, value) {
    console.log('setOption(%j, %j)', key, value);
    this.options[key] = value;
    this._saveOptions();
    this.emit('optionsDidChange');
  }

  _loadOptions() {
    this.options = JSON.parse(localStorage.getItem('options') || '{}');
    for (let k in OPTIONS) {
      let option = OPTIONS[k];
      if (!this.options.hasOwnProperty(option.key)) {
        this.options[option.key] = option.defaultValue;
      }
    }
  }

  _saveOptions() {
    localStorage.setItem('options', JSON.stringify(this.options));
  }

}
