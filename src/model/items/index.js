import {tokenizeString} from '../../textutil';
import annotateTokens from './annotate';

export function annotateString(string, options) {
  let tokens = tokenizeString(string);
  return annotateTokens(tokens, options);
}
