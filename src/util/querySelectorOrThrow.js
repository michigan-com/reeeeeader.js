export default function querySelectorOrThrow(el, selector) {
  let child = el.querySelector(selector);
  if (!child) {
    console.error(`${selector} not found in `, el);
    throw new Error(`${selector} not found in ${el}`);
  }
  return child;
}
