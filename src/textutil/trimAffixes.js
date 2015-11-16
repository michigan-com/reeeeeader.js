import { XRegExp } from 'xregexp';

const NON_ALPHANUMERIC = XRegExp('^[^\\p{L}\\p{N}]*$');

function isGraphemeClusterEntirelyNonAlphaNumberic(cluster) {
  return NON_ALPHANUMERIC.test(cluster);
}

export default function trimAffixes(clusters) {
  let trimmed = clusters.slice(0);

  let prefix = [];
  while ((trimmed.length > 0) && isGraphemeClusterEntirelyNonAlphaNumberic(trimmed[0])) {
    prefix.push(trimmed.shift());
  }

  let suffix = [];
  while ((trimmed.length > 0) && isGraphemeClusterEntirelyNonAlphaNumberic(trimmed[trimmed.length-1])) {
    suffix.unshift(trimmed.pop());
  }

  return { prefix, trimmed, suffix };
}
