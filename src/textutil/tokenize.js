import XRegExp from 'xregexp';

const WHITESPACE = XRegExp('(\\s+)');
const NON_WORD = XRegExp('^[^\\p{L}\\p{N}]+$');
const INCLUDES_NON_WORD = XRegExp('[^\\p{L}\\p{N}]');

export function includesNonAlphaNumericCharacters(word) {
  return INCLUDES_NON_WORD.exec(word);
}

export default function tokenizeString(text) {
  let paragraphs = text.split("\n").map((p) => p.trim()).filter((p) => p.length > 0);
  let tokens = [];

  for (let paragraph of paragraphs) {
    let words = [];
    let lastWhitespace = '';
    XRegExp.split(paragraph, WHITESPACE).forEach((word) => {
      if (word.length == 0) {
        return;
      }
      if (WHITESPACE.exec(word)) {
        lastWhitespace = word;
        return;
      }

      if ((words.length > 0) && NON_WORD.exec(word)) {
        let lastWord = words.pop();
        word = lastWord + lastWhitespace + word;
      }
      words.push(word);

      lastWhitespace = '';
    });

    if (words.length > 0) {
      tokens.push.apply(tokens, words);
      tokens.push("\n");
    }
  }
  tokens.pop();  // last paragraph separator
  return tokens;
}
