import { analyzeString } from '../../textutil';
import mergeAffixes from './merge';

let MULTIPLIERS = {
  paragraphBreakMultiplier:  3.5,
  sentenceBreakMultiplier:   3.5,
  commaBreakMultiplier:      1.5,

  xxlMultiplier: 3.5,
  xlMultiplier:  2.5,
  lMultiplier:   2,
  mMultiplier:   1.3,

  longWordMultiplier: 1
}

export default function annotateTokens(tokens, options=MULTIPLIERS) {
  let items = tokens.map(toItem);
  items = mergeAffixes(items);
  annotatePairs(items);
  items.forEach(annotate.bind(null, options));
  return items;
}

function toItem(token) {
  let item;
  if (token == "\n") {
    item = analyzeString("");
    item.text = "";
    item.tags.parabreak = true;
  } else {
    item = analyzeString(token);
    item.text = token;
  }
  item.words = 1;
  return item;
}

function annotatePairs(items) {
  let prevItem = null;
  for (let item of items.concat(null)) {
    annotatePair(prevItem, item);
    prevItem = item;
  }
}

function annotatePair(a, b) {
  if (a && !a.tags.parabreak) {
    if (!b || b.tags.parabreak || (a.tags.stop && b.tags.cap)) {
      a.tags.eos = true;
    }

    if (!b || b.tags.parabreak) {
      a.tags.eop = true;
    }
  }

  if (b && !b.tags.parabreak) {
    if (!a || a.tags.parabreak) {
      b.tags.bop = true;
    }
    if (!a || a.tags.parabreak || a.tags.eos) {
      b.tags.bos = true;
    }
  }
}

function annotate(multipliers, item) {
  item.multiplier = multiplier(item, multipliers);
  if (typeof item.multiplier !== 'number') {
    console.error('item(%s) multiplier is %s: %s', item.text, typeof item.multiplier, item.multiplier);
  }
}

function multiplier(item, multipliers) {
  let tags = item.tags;

  let result = 1;
  let resultReason = null;
  
  function emit(m, reason) {
    if (m > result) {
      result = m;
      resultReason = reason;
    }
  }

  if (tags.parabreak) {
    emit(multipliers.paragraphBreakMultiplier, 'paragraph break');
  }
  if (tags.eos && !tags.eop) {
    emit(multipliers.sentenceBreakMultiplier, 'end of sentence');
  }

  if (tags.pause) {
    emit(multipliers.commaBreakMultiplier, 'punctuation');
  }
  if (tags.punct) {
    emit(multipliers.lMultiplier, 'unusual punctuation');
  }
  
  if (item.words == 2) {
    if (!item.cap) {
      emit(multipliers.mMultiplier, 'two simple words');
    } else {
      emit(multipliers.xlMultiplier, 'two complex words');
    }
  } if (item.words > 2) {
    emit(multipliers.xxlMultiplier, 'multiple words');
  } else {
    let len = item.text.length;
    emit(1 + Math.min((multipliers.longWordMultiplier-1), Math.max(0, len-6) / 12), 'word length');
  }

  if (tags.junk) {
    emit(multipliers.xlMultiplier, 'not a normal word');
  }

  if (tags.cap) {
    emit(multipliers.mMultiplier, 'uppercase letters');
  }

  // console.log('multiplier(%s) = %s  reason: %s', JSON.stringify(item.text), result, resultReason);

  return result;
}
