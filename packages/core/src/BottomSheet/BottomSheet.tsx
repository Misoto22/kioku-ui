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
    insetBlockEnd: 0,
    // The sheet is lifted off the side edges rather than welded to them: it is
    // one more sheet of paper laid over the page, not a second page.
    insetInline: semanticTokens.spacingXl,
    maxHeight: '85vh',
    // Each band owns its own padding so a row can still bleed to the edge.
    overflow: 'hidden',
    // The panel pins itself to the viewport edge rather than settling into the
    // scrim's centred flex box, which is where every other modal surface sits.
    position: 'fixed',
  },
  handle: {
    display: 'flex',
    justifyContent: 'center',
    paddingBlockEnd: semanticTokens.spacingXs,
    paddingBlockStart: semanticTokens.spacingSm,
  },
  // Three pixels, like every other corner. A capsule here would be the one
  // rounded shape in the system that is neither a dot nor a knob.
  grip: {
    backgroundColor: semanticTokens.borderStrong,
    borderRadius: semanticTokens.radiusInner,
    height: semanticTokens.spacingXs,
    width: semanticTokens.spacing2xl,
  },
  title: {
    color: semanticTokens.colorText,
    fontFamily: semanticTokens.fontFamilyDisplay,
    fontSize: semanticTokens.fontSizeLg,
    fontWeight: semanticTokens.fontWeightMedium,
    letterSpacing: semanticTokens.letterSpacingHeading,
    lineHeight: semanticTokens.lineHeightHeading,
    margin: 0,
    paddingBlockEnd: semanticTokens.spacingSm,
    paddingBlockStart: semanticTokens.spacingXs,
    paddingInline: semanticTokens.spacingLg,
  },
  content: {
    minHeight: 0,
    overflowY: 'auto',
    paddingBlockEnd: semanticTokens.spacingLg,
    paddingInline: semanticTokens.spacingLg,
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
        <div aria-hidden="true" {...stylex.props(styles.handle)}>
          <span {...stylex.props(styles.grip)} />
        </div>
        <h2 id={titleId} {...stylex.props(styles.title)}>
          {title}
        </h2>
        <div {...stylex.props(styles.content)}>{children}</div>
      </div>
    </Overlay>
  );
}
