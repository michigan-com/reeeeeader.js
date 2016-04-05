import XRegExp from 'xregexp';

// "sticky": should stay together with the corresponding word
// "pointee": ends with a point
const STICKY_POINTEE_CAPITALIZED_PREFIXES = dictionarize([
  'mr', 'mrs', 'ms', 'dr', 'prof', 'st', 'sgt',

]);
const POINTEE_CAPITALIZED_ABBREVS = dictionarize([
  // dataset stolen from Punkt sentence tokenizer (Python's NLTK)
  "r.i", "g.k", "r.t", "tenn", "j.r", "chg", "s.c", "ph.d", "n.m",
  "messrs", "pa", "c.v", "inc", "r.a", "t", "r", "ct", "reps", "s.g", "t.j",
  "w.va", "a.c", "s.a.y", "va", "ms", "d.c", "ltd", "a.s", "ft",
  "a.a", "jan", "w.r", "cos", "r.k", "mich", "u.n", "c", "d.h", "ill", "d.w",
  "h.c", "kan", "jr", "col", "corp", "l.f", "rep", "dr", "fla", "sept",
  "u.s.a", "h.m", "r.h", "feb", "nov", "w", "ok", "sep", "g", "j.j", "i.m.s",
  "a.d", "j.c", "ave", "bros", "oct", "minn", "a.m.e", "n.y", "ky", "l", "u.k",
  "ariz", "n.d", "b.f", "sw", "l.a", "m.b.a", "yr", "calif", "h.f", "e.f",
  "j.p", "e.m", "p.a.m", "v", "st", "e.l", "a.g", "u.s", "l.p", "g.d", "wed",
  "ga", "adm", "ala", "colo", "tues", "okla", "f", "n", "cie", "b.v", "co",
  "f.j", "k", "e", "h", "n.h", "e.h", "s.s", ". . ", "u.s.s.r", "c.i.t", "conn",
  "f.g", "p", "fri", "s.p.a", "a.h", "s.a", "dec", "s", "d", "n.j", "sr",
  "m.j", "g.f", "maj", "n.v", "lt", "ore", "wis", "m", "mr", "wash", "aug",
  "bos", "nev", "mg", "vt", "sen", "j.k", "a.t", "mrs", "n.c", "j.b", "vs",
  "r.j", "w.c", "m.d.c", "w.w", "gen",
]);
const STICKY_POINTEE_SUFFIXES = dictionarize(['a.m', 'p.m']);
const STICKY_SUFFIXES = dictionarize(['mph']);
const STICKY_PREFIXES = dictionarize(['a', 'an', 'the']);

export default function classify(string, { prefix, trimmed, suffix }) {
  if (isJunk(string, trimmed)) {
    return {junk: true};
  }

  let trimmedString = trimmed.join('');
  let trimmedLowecaseString = trimmedString.toLowerCase();
  let prefixString = prefix.join('');
  let suffixString = suffix.join('');

  let tags = {};

  let firstLetter = trimmed[0];
  let isCapitalized = (firstLetter.toUpperCase() === firstLetter);

  let hasPeriod = /\./.test(suffixString);
  if (hasPeriod) {
    suffixString = suffixString.replace(/\./g, '');
  }
  let hasTrailer = /[!\?]/.test(suffixString);
  if (hasTrailer) {
    suffixString = suffixString.replace(/[!\?]/g, '');
  }
  let hasSuffixPauseMark = /[,"'“”‘’«»():;—-]/.test(suffixString);
  if (hasSuffixPauseMark) {
    suffixString = suffixString.replace(/[,"'“”‘’«»():;—-]/g, '');
  }
  let hasPrefixPauseMark = /[,"'“”‘’«»():;—-]/.test(prefixString);
  if (hasPrefixPauseMark) {
    prefixString = prefixString.replace(/[,"'“”‘’«»():;—-]/g, '');
  }

  if (isCapitalized) {
    tags.cap = true;
  }

  let isPointeePrefix = ((isCapitalized || hasPeriod) && STICKY_POINTEE_CAPITALIZED_PREFIXES.hasOwnProperty(trimmedLowecaseString));
  // let isPointeeAbbrev = ((isCapitalized || hasPeriod) && POINTEE_CAPITALIZED_ABBREVS.hasOwnProperty(trimmedLowecaseString));
  let isStickyPrefix = STICKY_PREFIXES.hasOwnProperty(trimmedLowecaseString);
  if (isPointeePrefix || isStickyPrefix) {
    tags.prefix = true;
  }

  let isPointeeSuffix = (hasPeriod && STICKY_POINTEE_SUFFIXES.hasOwnProperty(trimmedLowecaseString));
  let isStickySuffix = STICKY_SUFFIXES.hasOwnProperty(trimmedLowecaseString);
  if (isPointeeSuffix || isStickySuffix) {
    tags.suffix = true;
  }

  if (hasTrailer || (hasPeriod && !isPointeePrefix && !isPointeeSuffix)) {
    tags.stop = true;
  } else if (hasSuffixPauseMark || hasPrefixPauseMark) {
    tags.pause = true;
  }

  if (prefixString.length > 0) {
    tags.punct = true;
  } else if (suffixString.length > 0) {
    tags.punct = true;
  }

  if ((trimmedString.toUpperCase() === trimmedString)) {
    tags.upcase = true;
  }

  return tags;
}


const LETTERS = XRegExp('\\p{L}');
const MIDWORDS = XRegExp("[\\p{L}\\p{N}.’'–-]");
function isJunk(string, trimmed) {
  if (trimmed.length === 0) {
    return true;

  // instajunk: Twitter and emails
  } else if (/[@]/.test(string)) {
    return true;

  // must have at least one letter
  } else if (!trimmed.some((c) => LETTERS.test(c))) {
    return true;

  // mustn't have anything but letters and numbers
  } else if (trimmed.some((c) => !MIDWORDS.test(c))) {
    return true;

  } else {
    return false;
  }
}


function dictionarize(array) {
  let object = {};
  for (let i = 0; i < array.length; ++i) {
    object[array[i]] = true;
  }
  return object;
}
