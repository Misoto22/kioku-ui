import * as stylex from '@stylexjs/stylex';
import type {HTMLAttributes, ReactNode} from 'react';

import {semanticTokens} from '../authoring.stylex.js';
import type {StatusTone} from '../Badge/index.js';

/*
 * The tones are ink only — a colour, never a matched `status*Surface` fill.
 * That is deliberate and should not be "corrected" to surface pairs. `Field`
 * renders the identical message for the identical job, as `status*Text` on
 * whatever surface the field already sits on, and the two have to agree
 * wherever a form uses both. `Alert` pairs surface with text because it is a
 * block that owns its own area; a field status is one line under a control,
 * and filling it would put a coloured strip under every input on the page.
 *
 * `info` takes `colorTextSecondary` rather than `statusInfoText`: a note is
 * not an outcome. So no unmatched status surface is introduced here, and
 * nothing reaches for `colorAccent`.
 */
const styles = stylex.create({
  message: {
    alignItems: 'baseline',
    display: 'flex',
    fontFamily: semanticTokens.fontFamilyBody,
    fontSize: semanticTokens.fontSizeSm,
    gap: semanticTokens.spacingXs,
    letterSpacing: semanticTokens.letterSpacingLabel,
    lineHeight: semanticTokens.lineHeightBody,
    margin: 0,
  },
  // A note rather than an outcome, so it takes the neutral secondary ink
  // instead of a status colour.
  info: {color: semanticTokens.colorTextSecondary},
  success: {color: semanticTokens.statusSuccessText},
  warning: {color: semanticTokens.statusWarningText},
  danger: {color: semanticTokens.statusDangerText},
});

/** Props for a validation message attached to one control. */
export interface FieldStatusProps extends Omit<
  HTMLAttributes<HTMLParagraphElement>,
  'aria-live' | 'children' | 'className' | 'role'
> {
  readonly children: ReactNode;
  readonly tone?: StatusTone;
}

/**
 * States the outcome of validating one control. A `danger` message announces
 * itself, because a reader who just submitted needs to hear what went wrong;
 * every other tone is posted politely.
 */
export function FieldStatus({
  children,
  tone = 'info',
  ...props
}: FieldStatusProps) {
  const failed = tone === 'danger';

  return (
    <p
      {...props}
      aria-live={failed ? 'assertive' : 'polite'}
      role={failed ? 'alert' : 'status'}
      {...stylex.props(styles.message, styles[tone])}
    >
      {children}
    </p>
  );
}
