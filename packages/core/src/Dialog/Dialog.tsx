import * as stylex from '@stylexjs/stylex';
import {useId, type HTMLAttributes, type ReactNode} from 'react';

import {semanticTokens} from '../authoring.stylex.js';
import {Overlay} from '../Overlay/index.js';

// The scale stops at 38px, so the three surface widths are named multiples of
// it rather than the rem literals a dialog would otherwise reach for.
const surfaceWidthSm = `calc(${semanticTokens.spacing2xl} * 10)`;
const surfaceWidthMd = `calc(${semanticTokens.spacing2xl} * 14)`;
const surfaceWidthLg = `calc(${semanticTokens.spacing2xl} * 20)`;

const surfaceEnter = stylex.keyframes({
  from: {opacity: 0, transform: 'translateY(4%)'},
  to: {opacity: 1, transform: 'translateY(0)'},
});

const styles = stylex.create({
  surface: {
    animationDuration: semanticTokens.durationModerate,
    animationName: {
      default: surfaceEnter,
      '@media (prefers-reduced-motion: reduce)': 'none',
    },
    animationTimingFunction: semanticTokens.easingEmphasized,
    backgroundColor: semanticTokens.colorSurfaceRaised,
    borderRadius: semanticTokens.radiusContainer,
    boxShadow: semanticTokens.elevationHigh,
    color: semanticTokens.colorText,
    display: 'flex',
    flexDirection: 'column',
    fontFamily: semanticTokens.fontFamilyBody,
    gap: semanticTokens.spacingMd,
    maxHeight: '100%',
    overflowY: 'auto',
    padding: semanticTokens.spacingLg,
    width: '100%',
  },
  sm: {maxWidth: surfaceWidthSm},
  md: {maxWidth: surfaceWidthMd},
  lg: {maxWidth: surfaceWidthLg},
  title: {
    color: semanticTokens.colorText,
    fontFamily: semanticTokens.fontFamilyHeading,
    fontSize: semanticTokens.fontSizeLg,
    fontWeight: semanticTokens.fontWeightStrong,
    letterSpacing: semanticTokens.letterSpacingHeading,
    lineHeight: semanticTokens.lineHeightHeading,
    margin: 0,
  },
  description: {
    color: semanticTokens.colorTextSecondary,
    fontFamily: semanticTokens.fontFamilyBody,
    fontSize: semanticTokens.fontSizeMd,
    letterSpacing: semanticTokens.letterSpacingBody,
    lineHeight: semanticTokens.lineHeightBody,
    margin: 0,
  },
  footer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: semanticTokens.spacingSm,
    justifyContent: 'flex-end',
  },
});

/** Widths a dialog surface can claim. */
export type DialogSize = 'sm' | 'md' | 'lg';

/** Props shared by modal dialog surfaces. */
export interface DialogProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'children' | 'className' | 'role' | 'title'
> {
  readonly children?: ReactNode;
  readonly description?: ReactNode;
  readonly dismissOnOutsideClick?: boolean;
  readonly footer?: ReactNode;
  readonly onDismiss?: () => void;
  readonly open: boolean;
  readonly size?: DialogSize;
  readonly title: ReactNode;
}

/** @internal Shared modal surface for Dialog and AlertDialog. */
export function DialogSurface({
  children,
  description,
  dismissOnOutsideClick = true,
  footer,
  onDismiss,
  open,
  role,
  size = 'md',
  title,
  ...props
}: DialogProps & {readonly role: 'alertdialog' | 'dialog'}) {
  const titleId = useId();
  const descriptionId = useId();

  return (
    <Overlay
      dismissOnOutsideClick={dismissOnOutsideClick}
      {...(onDismiss ? {onDismiss} : {})}
      open={open}
    >
      <div
        {...props}
        aria-describedby={description === undefined ? undefined : descriptionId}
        aria-labelledby={titleId}
        aria-modal="true"
        role={role}
        {...stylex.props(styles.surface, styles[size])}
      >
        <h2 id={titleId} {...stylex.props(styles.title)}>
          {title}
        </h2>
        {description === undefined ? null : (
          <p id={descriptionId} {...stylex.props(styles.description)}>
            {description}
          </p>
        )}
        {children}
        {footer === undefined ? null : (
          <div {...stylex.props(styles.footer)}>{footer}</div>
        )}
      </div>
    </Overlay>
  );
}

/**
 * Interrupts the page with a modal surface. Focus is trapped inside it, the
 * page behind stops scrolling, and Escape closes it through `onDismiss`.
 */
export function Dialog(props: DialogProps) {
  return <DialogSurface {...props} role="dialog" />;
}
