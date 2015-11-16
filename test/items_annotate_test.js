import {ok, equal, deepEqual} from 'assert';
import {annotateString} from '../src/model/items';
import _pick from 'lodash/object/pick';
import _pluck from 'lodash/collection/pluck';

const ANNOTATIONS = 'bop eop bos eos parabreak'.split(/\s+/);

describe('model/items/annotate', function() {
  o("");
  o("Foo", 'Foo:bop:bos:eop:eos');
  o("Foo bar", 'Foo:bop:bos', 'bar:eop:eos');
  o("Foo bar boz", 'Foo:bop:bos', 'bar', 'boz:eop:eos');
  o("Foo bar. Boz biz.", 'Foo:bop:bos', 'bar.:eos', 'Boz:bos', 'biz.:eop:eos');
  o("Foo bar.\nBoz biz.", 'Foo:bop:bos', 'bar.:eop:eos', ':parabreak', 'Boz:bop:bos', 'biz.:eop:eos');

  o("Around 10 p.m. Saturday.", 'Around:bop:bos', '10 p.m.', 'Saturday.:eop:eos');
  o("Saturday, Aug. 15 in Garden City.", 'Saturday,:bop:bos', 'Aug.', '15', 'in', 'Garden', 'City.:eop:eos');
  oo("Mrs O’Keefe’s Livonia garden", 'Mrs O’Keefe’s', 'Livonia', 'garden');
  o("In Prof. Wright's thesis", 'In:bop:bos', "Prof. Wright's", 'thesis:eop:eos');
  o("In Prof. Dr. Mühlheußer's thesis", 'In:bop:bos', "Prof. Dr. Mühlheußer's", 'thesis:eop:eos');
});

function o(input, ...expected) {
  let expectedString = expected.join('|');

  it(`should annotate ${JSON.stringify(input)} as ${expectedString}`, function() {
    let items = annotateString(input);
    let actual = items.map(describeItem).join('|');

    deepEqual(actual, expectedString);
  });
}

function oo(input, ...expected) {
  let expectedString = expected.join('|');

  it(`should parse ${JSON.stringify(input)} as ${expectedString}`, function() {
    let items = annotateString(input);
    let actual = _pluck(items, 'text').join('|');

    deepEqual(actual, expectedString);
  });
}

function describeItem(item) {
  let tags = Object.keys(_pick(item.tags, ANNOTATIONS)).map((tag) => `:${tag}`).sort().join('')
  return `${item.text}${tags}`;
}
