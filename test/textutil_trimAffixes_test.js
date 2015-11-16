import {ok, equal, deepEqual} from 'assert';
import { trimAffixesFromString } from '../src/textutil';

describe('textutil/trimAffixes', function() {
  o("foo", ":foo:");
  o("(foo", "(:foo:");
  o("foo)", ":foo:)");
  o("(foo)", "(:foo:)");
  o("(“foo...", "(“:foo:...");
  o("()", "()::");
  o("123", ":123:");
  o("3DES", ":3DES:");
  o("(3DES)", "(:3DES:)");
  o("(Hello, -- ", "(:Hello:, -- ");
  o("(Hello-worldish, -- ", "(:Hello-worldish:, -- ");

  // warning: Unicode contamination detected
  o('Z͑ͫ̓ͪ̂ͫ̽͏̴̙̤̞͉͚̯̞̠͍A̴̵̜̰͔ͫ͗͢L̠ͨͧͩ͘G̴̻͈͍͔̹̑͗̎̅͛́Ǫ̵̹̻̝̳͂̌̌͘!͖̬̰̙̗̿̋ͥͥ̂ͣ̐́́͜͞', ":Z͑ͫ̓ͪ̂ͫ̽͏̴̙̤̞͉͚̯̞̠͍A̴̵̜̰͔ͫ͗͢L̠ͨͧͩ͘G̴̻͈͍͔̹̑͗̎̅͛́Ǫ̵̹̻̝̳͂̌̌͘:!͖̬̰̙̗̿̋ͥͥ̂ͣ̐́́͜͞");

  o("me@example.com", ":me@example.com:");
  o("@someone", "@:someone:");
});

function o(input, expected) {
  let components = expected.split(':');
  if (components.length != 3) {
    throw new Error("expected must have exactly 2 colons");
  }

  it(`should split ${JSON.stringify(input)} into ${components.map((s) => JSON.stringify(s)).join(' + ')}`, function() {
    deepEqual(trimAffixesFromString(input), { prefix: components[0], trimmed: components[1], suffix: components[2] });
  });
}
