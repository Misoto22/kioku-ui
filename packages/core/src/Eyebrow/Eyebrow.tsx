import * as stylex from '@stylexjs/stylex';
import type {HTMLAttributes} from 'react';

import {semanticTokens} from '../authoring.stylex.js';

const styles = stylex.create({
  // Rule 50's label of last resort, in one place: the smallest size in the
  // scale, opened right up so the face does not close into a smudge at 11px,
  // in the heading cut and a rank below the thing it names. There is no size
  // axis on purpose — an eyebrow that grew would be a heading.
  base: {
    fontFamily: semanticTokens.fontFamilyHeading,
    fontSize: semanticTokens.fontSizeXs,
    // Regular, and stated rather than inherited. Left open, an eyebrow took
    // the weight of whatever it was dropped into; every hand-rolled copy of
    // this recipe pinned one, and they did not agree with each other. The
    // tracking is what does the work at 11px — weight on top of it turns a
    // quiet label into a second heading.
    fontWeight: semanticTokens.fontWeightRegular,
    letterSpacing: semanticTokens.letterSpacingEyebrow,
    lineHeight: semanticTokens.lineHeightHeading,
  },
  // Three ranks of ink, plus the one case a label carries a warning: the
  // heading over a destructive block has to read as the block it names.
  secondary: {color: semanticTokens.colorTextSecondary},
  muted: {color: semanticTokens.colorTextMuted},
  danger: {color: semanticTokens.statusDangerText},
});

/** Ink ranks an eyebrow can take, secondary being rule 50's own. */
export type EyebrowTone = 'secondary' | 'muted' | 'danger';

/** Props for a small label that names something without competing with it. */
export interface EyebrowProps extends Omit<
  HTMLAttributes<HTMLSpanElement>,
  'className'
> {
  readonly tone?: EyebrowTone;
}

/**
 * Names a thing without competing with it: a card kicker, a rail heading, a
 * metric label. It is a `span` rather than `Text`'s paragraph because an
 * eyebrow is always placed inside somebody else's block.
 */
export function Eyebrow({
  children,
  tone = 'secondary',
  ...props
}: EyebrowProps) {
  return (
    <span {...props} {...stylex.props(styles.base, styles[tone])}>
      {children}
    </span>
  );
}
