import * as stylex from '@stylexjs/stylex';
import type {HTMLAttributes, ReactNode} from 'react';

import {semanticTokens} from '../authoring.stylex.js';

const styles = stylex.create({
  group: {
    alignItems: 'stretch',
    display: 'flex',
    fontFamily: semanticTokens.fontFamilyBody,
    gap: semanticTokens.spacingXs,
  },
  control: {flexGrow: 1, minWidth: 0},
  // An affix sits at the same depth as the control it flanks, so the two read
  // as one field rather than as a chip beside a box. Its text is an eyebrow —
  // "AUD" or "/month" names the unit without competing with the value, and at
  // label size it was reading as loudly as the figure it qualifies.
  addon: {
    alignItems: 'center',
    backgroundColor: semanticTokens.colorSurfaceMuted,
    borderColor: semanticTokens.borderStrong,
    borderRadius: semanticTokens.radiusElement,
    borderStyle: semanticTokens.borderStyle,
    borderWidth: semanticTokens.borderWidth,
    boxSizing: 'border-box',
    color: semanticTokens.colorTextSecondary,
    display: 'flex',
    flexShrink: 0,
    fontFamily: semanticTokens.fontFamilyHeading,
    fontSize: semanticTokens.fontSizeXs,
    letterSpacing: semanticTokens.letterSpacingEyebrow,
    lineHeight: semanticTokens.lineHeightHeading,
    minHeight: semanticTokens.sizeControlMd,
    paddingInline: semanticTokens.spacingSm,
  },
});

/** Props for a control flanked by fixed affixes. */
export interface InputGroupProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'children' | 'className' | 'prefix'
> {
  readonly children: ReactNode;
  readonly prefix?: ReactNode;
  readonly suffix?: ReactNode;
}

/**
 * Places fixed text or controls beside an input. Affixes are decorative: put
 * anything a reader must know in the field label, not here.
 */
export function InputGroup({
  children,
  prefix,
  suffix,
  ...props
}: InputGroupProps) {
  return (
    <div {...props} {...stylex.props(styles.group)}>
      {prefix === undefined ? null : (
        <span aria-hidden="true" {...stylex.props(styles.addon)}>
          {prefix}
        </span>
      )}
      <span {...stylex.props(styles.control)}>{children}</span>
      {suffix === undefined ? null : (
        <span aria-hidden="true" {...stylex.props(styles.addon)}>
          {suffix}
        </span>
      )}
    </div>
  );
}
