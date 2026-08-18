import * as stylex from '@stylexjs/stylex';
import {useId, type HTMLAttributes, type ReactNode} from 'react';

import {semanticTokens} from '../authoring.stylex.js';
import {Overlay} from '../Overlay/index.js';

const sheetEnter = stylex.keyframes({
  from: {transform: 'translateY(100%)'},
  to: {transform: 'translateY(0)'},
});

const styles = stylex.create({
  surface: {
    animationDuration: semanticTokens.durationModerate,
    animationName: {
      default: sheetEnter,
      '@media (prefers-reduced-motion: reduce)': 'none',
    },
    animationTimingFunction: semanticTokens.easingEmphasized,
    backgroundColor: semanticTokens.colorSurfaceRaised,
    borderStartEndRadius: semanticTokens.radiusContainer,
    borderStartStartRadius: semanticTokens.radiusContainer,
    boxShadow: semanticTokens.elevationHigh,
    color: semanticTokens.colorText,
    display: 'flex',
    flexDirection: 'column',
    fontFamily: semanticTokens.fontFamilyBody,
    gap: semanticTokens.spacingMd,
    insetBlockEnd: 0,
    insetInline: 0,
    maxHeight: '85vh',
    overflowY: 'auto',
    padding: semanticTokens.spacingLg,
    // The panel pins itself to the viewport edge rather than settling into the
    // scrim's centred flex box, which is where every other modal surface sits.
    position: 'fixed',
  },
  grip: {
    alignSelf: 'center',
    backgroundColor: semanticTokens.borderStrong,
    borderRadius: semanticTokens.radiusFull,
    height: semanticTokens.spacingXs,
    width: semanticTokens.spacing2xl,
  },
  title: {
    color: semanticTokens.colorText,
    fontFamily: semanticTokens.fontFamilyHeading,
    fontSize: semanticTokens.fontSizeLg,
    fontWeight: semanticTokens.fontWeightStrong,
    letterSpacing: semanticTokens.letterSpacingHeading,
    lineHeight: semanticTokens.lineHeightHeading,
    margin: 0,
  },
});

/** Props for a modal panel that enters from the bottom edge. */
export interface BottomSheetProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'children' | 'className' | 'role' | 'title'
> {
  readonly children?: ReactNode;
  readonly onDismiss?: () => void;
  readonly open: boolean;
  readonly title: ReactNode;
}

/**
 * Presents a modal panel anchored to the bottom edge, where a thumb can reach
 * it. It carries the same focus trap and scroll lock as Dialog.
 */
export function BottomSheet({
  children,
  onDismiss,
  open,
  title,
  ...props
}: BottomSheetProps) {
  const titleId = useId();

  return (
    <Overlay {...(onDismiss ? {onDismiss} : {})} open={open}>
      <div
        {...props}
        aria-labelledby={titleId}
        aria-modal="true"
        role="dialog"
        {...stylex.props(styles.surface)}
      >
        <span aria-hidden="true" {...stylex.props(styles.grip)} />
        <h2 id={titleId} {...stylex.props(styles.title)}>
          {title}
        </h2>
        {children}
      </div>
    </Overlay>
  );
}
