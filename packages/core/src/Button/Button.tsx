import * as stylex from '@stylexjs/stylex';
import type {ButtonHTMLAttributes} from 'react';

import {semanticTokens} from '../authoring.stylex.js';
import {SpinnerVisual} from '../Spinner/index.js';

const styles = stylex.create({
  base: {
    alignItems: 'center',
    boxSizing: 'border-box',
    borderRadius: semanticTokens.radiusElement,
    borderStyle: semanticTokens.borderStyle,
    borderWidth: semanticTokens.borderWidth,
    cursor: 'pointer',
    display: 'inline-flex',
    fontFamily: semanticTokens.fontFamilyBody,
    fontWeight: semanticTokens.fontWeightMedium,
    gap: semanticTokens.spacingSm,
    justifyContent: 'center',
    lineHeight: semanticTokens.lineHeightBody,
    position: 'relative',
    transitionDuration: semanticTokens.durationFast,
    transitionProperty: 'background-color, border-color, color',
    transitionTimingFunction: semanticTokens.easingStandard,
    ':disabled': {
      backgroundColor: semanticTokens.colorDisabledSurface,
      borderColor: semanticTokens.borderDisabled,
      color: semanticTokens.colorDisabledText,
      cursor: 'default',
    },
    ':focus-visible': {
      outlineColor: semanticTokens.colorFocus,
      outlineOffset: semanticTokens.focusOffset,
      outlineStyle: semanticTokens.borderStyle,
      outlineWidth: semanticTokens.focusWidth,
    },
  },
  // A button wears a label, and a label is set at the label size: the console
  // sets its buttons a step below the body copy they sit among, so the row
  // reads as a sentence with an action at the end rather than two competing
  // voices. Only the largest size comes up to body size.
  sm: {
    fontSize: semanticTokens.fontSizeSm,
    letterSpacing: semanticTokens.letterSpacingLabel,
    height: semanticTokens.sizeControlSm,
    paddingInline: semanticTokens.spacingSm,
  },
  md: {
    fontSize: semanticTokens.fontSizeSm,
    letterSpacing: semanticTokens.letterSpacingLabel,
    height: semanticTokens.sizeControlMd,
    paddingInline: semanticTokens.spacingMd,
  },
  lg: {
    fontSize: semanticTokens.fontSizeMd,
    letterSpacing: semanticTokens.letterSpacingLabel,
    height: semanticTokens.sizeControlLg,
    paddingInline: semanticTokens.spacingLg,
  },
  // The signature: ink ground, paper letters. The emphatic button is a seal
  // pressed on the sheet, not a brand-coloured rectangle — the accent's jobs
  // are the focus ring, the selection mark and a link on hover, all of them
  // thin, and filling a control with it is the one way to make this system
  // look like somebody else's. Ink is already the darkest thing on the page,
  // so the pointer states run down the ranks of ink rather than deeper; the
  // overlay wash the coloured variants use is invisible over a fill this dark
  // in light mode and this pale in dark mode.
  primary: {
    backgroundColor: semanticTokens.colorText,
    borderColor: semanticTokens.colorText,
    color: semanticTokens.colorTextOnAccent,
    ':hover:not(:disabled):not(:active)': {
      backgroundColor: semanticTokens.colorTextSecondary,
      borderColor: semanticTokens.colorTextSecondary,
    },
    ':active:not(:disabled)': {
      backgroundColor: semanticTokens.colorTextMuted,
      borderColor: semanticTokens.colorTextMuted,
    },
  },
  secondary: {
    backgroundColor: semanticTokens.colorSurface,
    borderColor: semanticTokens.borderStrong,
    color: semanticTokens.colorText,
    ':hover:not(:disabled):not(:active)': {
      backgroundColor: semanticTokens.colorOverlayHover,
      borderColor: semanticTokens.borderInteractive,
    },
    ':active:not(:disabled)': {
      backgroundColor: semanticTokens.colorOverlayActive,
      borderColor: semanticTokens.borderInteractive,
    },
  },
  // A ghost is the subordinate action in whatever row it appears in, so it
  // takes the available rank of ink and comes up to full ink under the pointer.
  // Reaching for `colorText` at rest made it argue with the button beside it.
  ghost: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    color: semanticTokens.colorTextSecondary,
    ':hover:not(:disabled):not(:active)': {
      backgroundColor: semanticTokens.colorOverlayHover,
      color: semanticTokens.colorText,
    },
    ':active:not(:disabled)': {
      backgroundColor: semanticTokens.colorOverlayActive,
      color: semanticTokens.colorText,
    },
  },
  destructive: {
    backgroundColor: semanticTokens.statusDangerSurface,
    borderColor: semanticTokens.statusDangerText,
    color: semanticTokens.statusDangerText,
    ':hover:not(:disabled):not(:active)': {
      backgroundImage: `linear-gradient(${semanticTokens.colorOverlayHover}, ${semanticTokens.colorOverlayHover})`,
    },
    ':active:not(:disabled)': {
      backgroundImage: `linear-gradient(${semanticTokens.colorOverlayActive}, ${semanticTokens.colorOverlayActive})`,
    },
  },
  // A loading button is disabled, so the waiting cursor has to be declared
  // against the same state the disabled cursor is, or it never wins.
  loading: {cursor: 'progress', ':disabled': {cursor: 'progress'}},
  iconOnly: {paddingInline: 0},
  iconSm: {width: semanticTokens.sizeControlSm},
  iconMd: {width: semanticTokens.sizeControlMd},
  iconLg: {width: semanticTokens.sizeControlLg},
  iconHitTarget: {
    '::before': {
      content: '',
      height: semanticTokens.sizeHitTarget,
      insetBlockStart: '50%',
      insetInlineStart: '50%',
      position: 'absolute',
      transform: 'translate(-50%, -50%)',
      width: semanticTokens.sizeHitTarget,
    },
  },
});

const iconSizes = {
  sm: styles.iconSm,
  md: styles.iconMd,
  lg: styles.iconLg,
} satisfies Record<ControlSize, (typeof styles)[keyof typeof styles]>;

/** Visual sizes shared by native action controls. */
export type ControlSize = 'sm' | 'md' | 'lg';

/** Semantic emphasis variants shared by native action controls. */
export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive';

/** Props for a text-labelled native action button. */
export interface ButtonProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'className'
> {
  readonly loading?: boolean;
  readonly size?: ControlSize;
  readonly variant?: ButtonVariant;
}

interface ActionControlProps extends ButtonProps {
  readonly iconOnly?: boolean;
}

/** @internal Shared native implementation for Button and IconButton. */
export function ActionControl({
  'aria-busy': ariaBusy,
  children,
  disabled,
  iconOnly = false,
  loading = false,
  size = 'md',
  type = 'button',
  variant = 'primary',
  ...props
}: ActionControlProps) {
  return (
    <button
      {...props}
      aria-busy={loading ? 'true' : ariaBusy}
      disabled={disabled || loading}
      {...stylex.props(
        styles.base,
        styles[size],
        styles[variant],
        loading && styles.loading,
        iconOnly && styles.iconOnly,
        iconOnly && iconSizes[size],
        iconOnly && styles.iconHitTarget,
      )}
      type={type}
    >
      {loading ? <SpinnerVisual /> : null}
      {iconOnly && loading ? null : children}
    </button>
  );
}

export function Button(props: ButtonProps) {
  return <ActionControl {...props} />;
}
