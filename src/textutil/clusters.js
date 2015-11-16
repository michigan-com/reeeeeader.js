import GraphemeBreaker from 'grapheme-breaker';

export function splitIntoClusters(string) {
  return GraphemeBreaker.break(string);
}

export function joinClusters(clusters) {
  return clusters.join('');
}
