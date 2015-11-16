export var OPTIONS = [
  {
    type: 'bool',
    key: 'orpHighlightEnabled',
    domId: 'michspeed-o-red',
    label: 'Red Letters',
    defaultValue: true,
  },
  {
    type: 'bool',
    key: 'reticleEnabled',
    domId: 'michspeed-o-reticle',
    label: 'Reticle',
    defaultValue: true,
  },

  {
    type: 'multiplier',
    key: 'paragraphBreakMultiplier',
    multiplier: 'paragraphBreak',
    domId: 'michspeed-od-para',
    label: 'Para',
    defaultValue: 3.5,
  },
  {
    type: 'multiplier',
    key: 'sentenceBreakMultiplier',
    multiplier: 'sentenceBreak',
    domId: 'michspeed-od-sentenceBreak',
    label: 'Sent',
    defaultValue: 3.5,
  },
  {
    type: 'multiplier',
    key: 'commaBreakMultiplier',
    multiplier: 'commaBreak',
    domId: 'michspeed-od-commaBreak',
    label: 'Comma',
    defaultValue: 1.5,
  },
  {
    type: 'multiplier',
    key: 'xxlMultiplier',
    multiplier: 'xxl',
    domId: 'michspeed-od-xxl',
    label: 'XXL',
    defaultValue: 3.5,
  },
  {
    type: 'multiplier',
    key: 'xlMultiplier',
    multiplier: 'xl',
    domId: 'michspeed-od-xl',
    label: 'XL',
    defaultValue: 2.5,
  },
  {
    type: 'multiplier',
    key: 'lMultiplier',
    multiplier: 'l',
    domId: 'michspeed-od-l',
    label: 'L',
    defaultValue: 2,
  },
  {
    type: 'multiplier',
    key: 'mMultiplier',
    multiplier: 'm',
    domId: 'michspeed-od-m',
    label: 'M',
    defaultValue: 1.3,
  },
  {
    type: 'multiplier',
    key: 'longWordMultiplier',
    multiplier: 'longWord',
    domId: 'michspeed-od-longWord',
    label: 'Long Words',
    defaultValue: 1,
  },
];

// for (let option in OPTIONS) {
//   option.domId = `michspeed-od-${option.key}`;
// }
