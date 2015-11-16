import { splitIntoClusters, joinClusters } from './clusters';
import trimAffixes from './trimAffixes';
import findOpticalRecognitionPoint from './orp';
import classify from './classify';

export function trimAffixesFromString(string) {
  let clusters = splitIntoClusters(string);
  let affixes = trimAffixes(clusters);
  return {
    prefix:  joinClusters(affixes.prefix),
    trimmed: joinClusters(affixes.trimmed),
    suffix:  joinClusters(affixes.suffix)
  };
}

export function findOpticalRecognitionPointInString(string) {
  let clusters = splitIntoClusters(string);
  let affixes = trimAffixes(clusters);
  let lor = findOpticalRecognitionPoint(affixes.trimmed);
  return {
    left:    joinClusters(lor.left),
    orp:     lor.orp,
    right:   joinClusters(lor.right)
  }
}

export function classifyString(string) {
  let clusters = splitIntoClusters(string);
  let affixes = trimAffixes(clusters);
  let tags = classify(string, affixes);
  return tags;
}

export function analyzeString(string) {
  let clusters = splitIntoClusters(string);
  let affixes = trimAffixes(clusters);
  let lor = findOpticalRecognitionPoint(affixes.trimmed);
  let tags = classify(string, affixes);
  return {
    prefix:  joinClusters(affixes.prefix),
    trimmed: joinClusters(affixes.trimmed),
    suffix:  joinClusters(affixes.suffix),

    left:    joinClusters(lor.left),
    orp:     lor.orp,
    right:   joinClusters(lor.right),

    tags:    tags
  };
}
