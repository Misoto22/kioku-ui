/**
 * Where a sticky rail comes to rest.
 *
 * The site banner is itself sticky and opaque, so anything else that sticks
 * has to stop *below* it rather than under it. Four rails and every jumped-to
 * heading share one measurement, and it is written as a relationship — one
 * control plus its padding plus its hairline — rather than as the 41px it
 * happens to be in the kioku pack today. Change the density and it follows.
 */
export const bannerHeight = `calc(
  var(--kioku-ui-size-control-md) + 2 * var(--kioku-ui-spacing-sm) +
    var(--kioku-ui-border-width)
)`;

/** The banner, plus the breathing room a rail would have had on its own. */
export const railOffset = `calc(${bannerHeight} + var(--kioku-ui-spacing-xl))`;

/**
 * How a rail scrolls when its list outgrows the window.
 *
 * The scrollbar is the one thing on these pages the system had not drawn: the
 * platform's own is a different width, a different colour and a different
 * radius from everything beside it. `thin` plus the strong border rank puts it
 * on the same ladder as the hairlines it runs alongside, and the fade at each
 * end lets the list recede rather than end on a cut. A rail whose list already
 * fits shows nothing at all, because `auto` is not `scroll`.
 */
const railFade =
  'linear-gradient(to bottom, transparent 0, #000 var(--kioku-ui-spacing-lg), #000 calc(100% - var(--kioku-ui-spacing-lg)), transparent 100%)';

export const railScroll = {
  maskImage: railFade,
  overflowY: 'auto',
  scrollbarColor: 'var(--kioku-ui-border-strong) transparent',
  scrollbarWidth: 'thin',
  WebkitMaskImage: railFade,
} as const;
