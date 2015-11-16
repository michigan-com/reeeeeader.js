import {ok, equal, deepEqual} from 'assert';
import {analyzeString} from '../src/textutil';

describe('textutil/analyzeString', function() {
  o("(“Fubar.”)", {
    prefix:   "(“",
    suffix:   ".”)",
    trimmed:  "Fubar",

    left:     "F",
    orp:      "u",
    right:    "bar",

    tags: {cap: true, stop: true}
  });
});

function o(input, expected) {
  it(`should successfully analyze ${JSON.stringify(input)}`, function() {
    let actual = analyzeString(input);
    deepEqual(actual, expected);
  });
}
