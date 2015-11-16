import {ok, equal, deepEqual} from 'assert';
import {classifyString} from '../src/textutil';

describe('textutil/classify', function() {
  o("",         'junk');
  o("123",      'junk');
  o("$300",     'junk');
  o("me@example.com", 'junk');
  o("@hippie",  'junk');

  o("foo",      '');

  o("foo.",     'stop');
  o("foo...",   'stop');
  o("foo!",     'stop');
  o("foo?",     'stop');
  o("foo.)",    'stop');
  o("foo).",    'stop');
  o("foo!)",    'stop');
  o("foo)!",    'stop');

  o("foo,",     'pause');
  o("foo:",     'pause');
  o("foo;",     'pause');
  o("foo)",     'pause');
  o("(foo",     'pause');
  o("“foo",     'pause');
  o("foo”",     'pause');

  o("foo#%",    'punct');

  o("Foo",      'cap');
  o("(Foo",     'cap pause');
  o("Foo.",     'cap stop');
  o("Foo!",     'cap stop');
  o("(Foo.)",   'cap stop');
  o("(Foo!)",   'cap stop');

  o("mr",       '');
  o("Mr",       'prefix cap');
  o("Mr.",      'prefix cap');
  o("mr.",      'prefix');
  o("a.m.",     'suffix');
  o("p.m.",     'suffix');

  o("store-closing", '');
  o("DES",      'cap upcase');
  o("3DES",     'cap upcase');
  o("U.S.",     'cap stop upcase');
});

function o(input, expectedString) {
  let expected = (expectedString == '' ? [] : expectedString.split(/\s+/));
  let sorted = expected.slice(0).sort();

  it(`should classify ${JSON.stringify(input)} as ${expected.join(', ') || 'normal'}`, function() {
    let tags = Object.keys(classifyString(input));
    tags.sort();

    deepEqual(tags, sorted);
  });
}
