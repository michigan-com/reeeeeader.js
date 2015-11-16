import {ok, equal, deepEqual} from 'assert';
import {tokenizeString} from '../src/textutil';

describe('textutil/tokenize', function() {
  o("Hello world", ["Hello", "world"]);
  o("Hello, world!", ["Hello,", "world!"]);
  o("(Hello, world.)", ["(Hello,", "world.)"]);
  o("(Hello, -- world.)", ["(Hello, --", "world.)"]);
  o("(Hello, --world.)", ["(Hello,", "--world.)"]);
  o("Hello, 20 worlds.", ["Hello,", "20", "worlds."]);
  o("Hello, 2nd world.", ["Hello,", "2nd", "world."]);
  o("Johnson & Johnson", ["Johnson &", "Johnson"]);
  o("U.S.", ["U.S."]);

  o("Foo\nBar", ["Foo", "\n", "Bar"]);
  o("Foo\n\nBar", ["Foo", "\n", "Bar"]);
  o("\nFoo\n\n\nBar\n\n", ["Foo", "\n", "Bar"]);

  o("Liebe ist für alle da", ["Liebe", "ist", "für", "alle", "da"]);
  o("Хуй сосите у поросенка Мити", ["Хуй", "сосите", "у", "поросенка", "Мити"]);  // favorite Skype testing sentence of Mr. Platov, someone I used to work with a long time ago.

  // don't publish this publicly until/unless you understand what the above says, exactly
});

function o(string, words) {
  it(`should tokenize ${JSON.stringify(string)} as ${words.join(' + ')}`, function() {
    deepEqual(tokenizeString(string), words);
  });
}
