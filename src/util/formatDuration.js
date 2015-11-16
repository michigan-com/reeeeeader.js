function pad2(n) {
  if (n < 10) {
    return '0' + n;
  } else {
    return '' + n;
  }
}

export default function formatDuration(millis) {
  let sec = Math.round(millis / 1000);
  let min = Math.floor(sec / 60);
  sec -= min * 60;
  return `${min}:${pad2(sec)}`;
}
