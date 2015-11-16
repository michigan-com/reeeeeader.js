import {annotateString} from './items';

export default class Source {

  // public var length

  constructor(text, attributes, options) {
    this.text = text;
    this.attributes = attributes;
    this.items = annotateString(text, options);
    this.length = this.items.length;

    let totalWeight = 0;
    for (let item of this.items) {
      item.totalWeightBefore = totalWeight;
      totalWeight += item.multiplier;
    }
    this.totalWeight = totalWeight;

    for (let k in attributes) {
      this[k] = attributes[k];
    }

    this.contextSize = 1;

    console.log("Source length %d items, totalWeight = %s", this.length, this.totalWeight);
  }

  reconfigure(options) {
    return new Source(this.text, this.attributes, options);
  }

  itemAt(idx) {
    if (idx < 0 || idx >= this.length) {
      throw new Error(`Invalid Source index ${idx}, must be >= 0 and < ${this.length}`);
    }

    return this.items[idx];
  }

  totalWeightBefore(idx) {
    if (idx >= this.length) {
      return this.totalWeight;
    } else {
      return this.items[idx].totalWeightBefore;
    }
  }

  indexOfParagraphBreakAtOrBefore(idx) {
    for (; idx >= 0; --idx) {
      if (this.items[idx].tags.parabreak) {
        return idx;
      }
    }
    return -1;
  }

  indexOfParagraphBreakAtOrAfter(idx) {
    let len = this.length;
    for (; idx < len; ++idx) {
      if (this.items[idx].tags.parabreak) {
        return idx;
      }
    }
    return -1;
  }

  indexOfParagraphStartAtOrBefore(idx) {
    if (idx == 0) {
      return 0;
    }

    let brk = this.indexOfParagraphBreakAtOrBefore(idx - 1);
    if (brk < 0) {
      return 0;
    } else {
      return brk + 1;
    }
  }

  indexOfParagraphStartBefore(idx) {
    let start = this.indexOfParagraphStartAtOrBefore(idx);
    if (start === 0) {
      return -1;
    }

    let brk = this.indexOfParagraphBreakAtOrBefore(start);
    if (brk < 0) {
      return -1;
    }
    if (brk === 0) {
      return -1;
    }

    return this.indexOfParagraphStartAtOrBefore(brk - 1);
  }

  indexOfParagraphStartAfter(idx) {
    if (idx+1 >= this.length) {
      return -1;
    }

    let brk = this.indexOfParagraphBreakAtOrAfter(idx + 1);
    if (brk < 0) {
      return -1;
    } else if (brk + 1 < this.length) {
      return brk + 1;
    } else {
      return -1;
    }
  }

  indexOfSentenceStartAtOrBefore(idx) {
    while ((idx >= 0) && !this.items[idx].tags.bos) {
      --idx;
    }
    return idx;
  }

  indexOfSentenceStartBefore(idx) {
    return idx > 0 ? this.indexOfSentenceStartAtOrBefore(idx - 1) : idx;
  }

  indexOfSentenceStartAfter(idx) {
    ++idx;
    let len = this.length;
    while ((idx < len) && !this.items[idx].tags.bos) {
      ++idx;
    }
    return idx;
  }

  contextAt(idx) {
    let paraStart = this.indexOfParagraphStartAtOrBefore(idx);
    let paraBreak = this.indexOfParagraphBreakAtOrAfter(idx + 1);

    let start = this.indexOfSentenceStartAtOrBefore(idx);
    for (let i = 0; i < this.contextSize; ++i) {
      let idx = this.indexOfSentenceStartBefore(start);
      if (idx < paraStart) {
        break;
      }
      start = idx;
    }

    let end = this.indexOfSentenceStartAfter(idx);
    for (let i = 0; i < this.contextSize; ++i) {
      end = this.indexOfSentenceStartAfter(end);
    }

    if ((paraBreak >= 0) && (end > paraBreak)) {
      end = paraBreak;
    }

    let a = this.items.slice(start, idx).map(itemToString);
    let b = itemToString(this.items[idx]);
    let c = this.items.slice(idx+1, end).map(itemToString);
    return [a.join(' '), b, c.join(' ')];
  }

}

function itemToString(item) {
  return item.text;
}
