export default function findOpticalRecognitionPoint(clusters) {
  let idx = findOpticalRecognitionPointIndex(clusters);

  return {
    left:   clusters.slice(0, idx),
    orp:    (clusters.length == 0 ? '' : clusters[idx]),
    right:  clusters.slice(idx+1)
  };
}

function findOpticalRecognitionPointIndex(clusters) {
  let len = clusters.length;
  if (len <= 1) {
    return 0;
  } else if (len <= 5) {
    return 1;
  } else if (len <= 9) {
    return 2;
  } else if (len <= 13) {
    return 3;
  } else {
    return 4;
  }
}
