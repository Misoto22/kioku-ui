import * as stylex from '@stylexjs/stylex';
import type {HTMLAttributes, ReactNode} from 'react';

import {semanticTokens} from '../authoring.stylex.js';
import type {StatusTone} from '../Badge/index.js';

const styles = stylex.create({
  anchor: {display: 'inline-flex', position: 'relative'},
  // The ring is painted in the surface behind the control, so the mark reads
  // as sitting on top of it rather than fused to its edge.
  badge: {
    alignItems: 'center',
    borderColor: semanticTokens.colorSurface,
    borderRadius: semanticTokens.radiusFull,
    borderStyle: semanticTokens.borderStyle,
    borderWidth: semanticTokens.focusWidth,
    display: 'inline-flex',
    fontFamily: semanticTokens.fontFamilyMono,
    fontSize: semanticTokens.fontSizeXs,
    fontVariantNumeric: 'tabular-nums',
    fontWeight: semanticTokens.fontWeightMedium,
    insetBlockStart: 0,
    insetInlineEnd: 0,
    justifyContent: 'center',
    letterSpacing: semanticTokens.letterSpacingMono,
    lineHeight: 1,
    minWidth: semanticTokens.spacingMd,
    paddingInline: semanticTokens.spacingXs,
    position: 'absolute',
    transform: 'translate(35%, -35%)',
  },
  dot: {
    height: semanticTokens.spacingSm,
    minWidth: semanticTokens.spacingSm,
    paddingInline: 0,
    width: semanticTokens.spacingSm,
  },
  info: {
    backgroundColor: semanticTokens.statusInfoText,
    color: semanticTokens.colorTextOnAccent,
  },
  success: {
    backgroundColor: semanticTokens.statusSuccessText,
    color: semanticTokens.colorTextOnAccent,
  },
  warning: {
    backgroundColor: semanticTokens.statusWarningText,
    color: semanticTokens.colorTextOnAccent,
  },
  danger: {
    backgroundColor: semanticTokens.statusDangerText,
    color: semanticTokens.colorTextOnAccent,
  },
});

/** Props for a count or dot attached to another control. */
export interface IndicatorProps extends Omit<
  HTMLAttributes<HTMLSpanElement>,
  'children' | 'className'
> {
  readonly children: ReactNode;
  readonly count?: number;
  readonly label: string;
  readonly max?: number;
  readonly tone?: StatusTone;
}

/**
 * Attaches a count or a dot to the control it wraps. The label is what a
 * screen reader hears, because "3" beside an icon means nothing on its own.
 */
export function Indicator({
  children,
  count,
  label,
  max = 99,
  tone = 'danger',
  ...props
}: IndicatorProps) {
  const showCount = count !== undefined;
  const display = showCount && count > max ? `${max}+` : String(count ?? '');

  return (
    <span {...props} {...stylex.props(styles.anchor)}>
      {children}
      <span
        aria-label={label}
        role="status"
        {...stylex.props(styles.badge, styles[tone], !showCount && styles.dot)}
      >
        {showCount ? display : null}
      </span>
    </span>
  );
}
