import * as stylex from '@stylexjs/stylex';
import type {HTMLAttributes, ReactNode} from 'react';

import {semanticTokens} from '../authoring.stylex.js';
import {useInternationalization} from '../i18n/index.js';
import {Icon} from '../Icon/index.js';

const styles = stylex.create({
  token: {
    alignItems: 'center',
    backgroundColor: semanticTokens.colorSurfaceMuted,
    borderRadius: semanticTokens.radiusElement,
    color: semanticTokens.colorTextSecondary,
    display: 'inline-flex',
    fontFamily: semanticTokens.fontFamilyBody,
    fontSize: semanticTokens.fontSizeSm,
    gap: semanticTokens.spacingXs,
    letterSpacing: semanticTokens.letterSpacingLabel,
    lineHeight: semanticTokens.lineHeightBody,
    maxWidth: '100%',
    paddingBlock: semanticTokens.spacingXs,
    paddingInline: semanticTokens.spacingSm,
  },
  removable: {paddingInlineEnd: semanticTokens.spacingXs},
  label: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  remove: {
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderRadius: semanticTokens.radiusInner,
    borderStyle: 'none',
    borderWidth: 0,
    color: semanticTokens.colorTextSecondary,
    cursor: 'pointer',
    display: 'inline-flex',
    flexShrink: 0,
    padding: 0,
    position: 'relative',
    transitionDuration: semanticTokens.durationFast,
    transitionProperty: 'color',
    transitionTimingFunction: semanticTokens.easingStandard,
    // The visual box tracks the token; the reachable box stays a full target.
    '::before': {
      content: '',
      height: semanticTokens.sizeHitTarget,
      insetBlockStart: '50%',
      insetInlineStart: '50%',
      position: 'absolute',
      transform: 'translate(-50%, -50%)',
      width: semanticTokens.sizeHitTarget,
    },
    ':focus-visible': {
      outlineColor: semanticTokens.colorFocus,
      outlineOffset: semanticTokens.focusOffset,
      outlineStyle: semanticTokens.borderStyle,
      outlineWidth: semanticTokens.focusWidth,
    },
    ':hover:not(:disabled)': {color: semanticTokens.colorText},
  },
});

/** Props for one discrete value shown as a chip. */
export interface TokenProps extends Omit<
  HTMLAttributes<HTMLSpanElement>,
  'children' | 'className'
> {
  readonly children: ReactNode;
  readonly leading?: ReactNode;
  readonly onRemove?: () => void;
  readonly removeLabel?: string;
}

/**
 * Shows one discrete value the reader has entered or chosen. When it can be
 * removed the control carries its own name, so a keyboard reader knows which
 * token a given button clears.
 */
export function Token({
  children,
  leading,
  onRemove,
  removeLabel,
  ...props
}: TokenProps) {
  const {messages} = useInternationalization();

  return (
    <span
      {...props}
      {...stylex.props(
        styles.token,
        onRemove !== undefined && styles.removable,
      )}
    >
      {leading}
      <span {...stylex.props(styles.label)}>{children}</span>
      {onRemove === undefined ? null : (
        <button
          aria-label={removeLabel ?? messages.remove}
          onClick={onRemove}
          {...stylex.props(styles.remove)}
          type="button"
        >
          <Icon size="sm">
            <path
              d="m6 6 12 12M18 6 6 18"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            />
          </Icon>
        </button>
      )}
    </span>
  );
}
