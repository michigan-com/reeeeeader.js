export default function mergeAffixes(items) {
  let result = [];
  for (let item of items) {
    if (isBase(item)) {
      while ((result.length > 0) && isPrefix(result[result.length-1])) {
        mergePrefix(result.pop(), item);
      }
    } else if (isSuffix(item)) {
      if ((result.length > 0) && isBase(result[result.length-1])) {
        mergeSuffix(result[result.length-1], item);
        item = null;  // merged & consumed
      }
    }

    if (item) {
      result.push(item);
    }
  }
  return result;
}

function mergeSuffix(dst, src) {
  merge(dst, dst, src);
  dst.right = dst.right + dst.suffix + ' ' + src.prefix + src.left + src.orp + src.right;
  dst.suffix = src.suffix;
}
function mergePrefix(src, dst) {
  merge(dst, src, dst);
  dst.left = src.left + src.orp + src.right + src.suffix + ' ' + dst.prefix + dst.left;
  dst.prefix = src.prefix;
}
function merge(dst, a, b) {
  dst.text  = a.text + ' ' + b.text;
  dst.words = a.words + b.words;

  dst.junk   = a.junk || b.junk;
  dst.cap    = a.cap || b.cap;
  dst.punct  = a.punct || b.punct;
  dst.upcase = a.upcase || b.upcase;
}

function isBase(item) {
  return !isPrefix(item) && !isSuffix(item);
}

function isPrefix(item) {
  return item.tags.prefix;
}

function isSuffix(item) {
  return item.tags.suffix;
}
