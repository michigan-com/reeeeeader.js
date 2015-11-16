import {ok, equal, deepEqual} from 'assert';
import {findOpticalRecognitionPointInString} from '../src/textutil';

describe('textutil/findOpticalRecognitionPoint', function() {
  o("i", ":i:");
  o("as", "a:s:");
  o("dog", "d:o:g");
  o("heap", "h:e:ap");
  o("clock", "c:l:ock");
  o("bridge", "br:i:dge");
});

function o(input, expected) {
  let components = expected.split(':');
  if (components.length != 3) {
    throw new Error(`${JSON.stringify(expected)} must have exactly 2 colons`);
  }

  it(`should split ${JSON.stringify(input)} into ${components.map((s) => JSON.stringify(s)).join(' + ')}`, function() {
    let result = findOpticalRecognitionPointInString(input);
    deepEqual(result, { left: components[0], orp: components[1], right: components[2] });
  });
}
