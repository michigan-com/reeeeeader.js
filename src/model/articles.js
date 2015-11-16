import xr from 'xr';

export function loadArticle(articleId) {
  return xr.get('/articles/:articleId'.replace(':articleId', encodeURIComponent(articleId)));
}

export function loadText(textId) {
  return xr.get('/texts/:textId'.replace(':textId', encodeURIComponent(textId)));
}
