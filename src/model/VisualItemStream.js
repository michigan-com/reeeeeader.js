
export default class VisualItemStream {

  constructor(source) {
    this._source = source;
    this._idx = 0;
  }

  setReconfiguredSource(source) {
    this._source = source;
  }

  hasMore() {
    return this._idx < this._source.length;
  }

  isAtStart() {
    return this._idx;
  }

  current() {
    return (this.hasMore() ? this._source.itemAt(this._idx) : null);
  }

  context() {
    return this._source.contextAt(this._idx);
  }

  totalWeightBefore() {
    return this._source.totalWeightBefore(this._idx);
  }

  shift() {
    ++this._idx;
  }

  _moveTo(idx) {
    this._idx = idx;
  }

  moveToPreviousParagraph() {
    let idx = this._source.indexOfParagraphStartBefore(this._idx);
    if (idx >= 0) {
      this._moveTo(idx);
      return true;
    } else {
      return false;
    }
  }

  moveToNextParagraph() {
    let idx = this._source.indexOfParagraphStartAfter(this._idx);
    if (idx >= 0) {
      this._moveTo(idx);
      return true;
    } else {
      return false;
    }
  }

}
