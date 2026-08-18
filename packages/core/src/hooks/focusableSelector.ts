const controlSelectors = [
  'a[href]',
  'audio[controls]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'video[controls]',
  '[contenteditable]:not([contenteditable="false"])',
];

/** Matches elements the browser will place in the sequential focus order. */
export const focusableSelector = [
  ...controlSelectors,
  '[tabindex]:not([tabindex="-1"])',
].join(',');

/**
 * Matches elements focus can reach programmatically, including the ones a
 * roving-tabindex collection has deliberately taken out of the tab order.
 */
export const reachableSelector = [...controlSelectors, '[tabindex]'].join(',');

function isHidden(element: HTMLElement) {
  if (element.hidden) {
    return true;
  }

  // Layout boxes are unreliable outside a real browser, so read the declared
  // visibility instead of measuring the element.
  const style = element.ownerDocument.defaultView?.getComputedStyle(element);
  return style?.display === 'none' || style?.visibility === 'hidden';
}

function collect(
  root: HTMLElement,
  selector: string,
  requireTabOrder: boolean,
): HTMLElement[] {
  return [...root.querySelectorAll<HTMLElement>(selector)].filter(
    (element) =>
      (!requireTabOrder || element.tabIndex >= 0) &&
      !element.hasAttribute('inert') &&
      element.getAttribute('aria-hidden') !== 'true' &&
      !isHidden(element),
  );
}

/**
 * Lists the focusable descendants of `root` in document order, skipping the
 * ones a reader cannot reach because they are hidden, inert, or held out of
 * the tab order by a negative tabIndex.
 */
export function focusableElements(root: HTMLElement): HTMLElement[] {
  return collect(root, focusableSelector, true);
}

/**
 * Lists the descendants a roving-focus collection can move between. Unlike
 * `focusableElements` this keeps `tabindex="-1"` items, because that is how
 * such a collection marks the stops it owns rather than the ones it hides.
 */
export function reachableElements(root: HTMLElement): HTMLElement[] {
  return collect(root, reachableSelector, false);
}
