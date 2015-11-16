export default class ReadingOptions {
  constructor() {
    this.options = {};
  }

  get(name) {
    return this.options(name);
  }
}
