import * as stylex from '@stylexjs/stylex';
import type {HTMLAttributes} from 'react';

import {semanticTokens} from '../authoring.stylex.js';

const styles = stylex.create({
  // Rule 44's figure, and nothing else. No size and no colour: `Code` keeps a
  // ratio size for the same reason — "a ratio, not a size: inline code tracks
  // whatever it is set inside". A figure inside a 30px metric is 30px and the
  // same figure in a 12.5px table row is 12.5px, so the scale and the ink
  // stay with whatever the figure is set inside; only the face changes.
  base: {
    fontFamily: semanticTokens.fontFamilyMono,
    fontVariantNumeric: 'tabular-nums',
    letterSpacing: semanticTokens.letterSpacingMono,
  },
});

/** Props for a figure set in the mono face. */
export type NumeralProps = Omit<HTMLAttributes<HTMLSpanElement>, 'className'>;

/**
 * Sets a figure — a count, a metric, a duration, a page number — in the mono
 * face with tabular numerals, so a column of them lines up on the same stems.
 * Named `Numeral` rather than `Figure` because `figure` already means an
 * image with a caption in HTML.
 */
export function Numeral({children, ...props}: NumeralProps) {
  return (
    <span {...props} {...stylex.props(styles.base)}>
      {children}
    </span>
  );
}
