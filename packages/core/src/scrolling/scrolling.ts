import * as stylex from '@stylexjs/stylex';

import {semanticTokens} from '../authoring.stylex.js';

/**
 * @internal How anything in this system scrolls.
 *
 * The scrollbar was the one surface the pack had never drawn: a census across
 * `packages/core/src` found ten scrolling regions and not a single
 * `scrollbar-width` or `scrollbar-color` between them, so every one of them
 * wore the platform's bar — a different width, a different colour and a
 * different radius from every hairline it ran beside, and 15–17px wide against
 * regions that had budgeted three.
 *
 * `thin` plus the strong border rank puts it on the same ladder as the rules it
 * runs alongside, and a transparent track keeps the well it sits in unbroken. A
 * region whose content already fits shows nothing at all, because these are all
 * `auto` rather than `scroll`.
 */
export const scrolling = stylex.create({
  region: {
    scrollbarColor: `${semanticTokens.borderStrong} transparent`,
    scrollbarWidth: 'thin',
  },
});
