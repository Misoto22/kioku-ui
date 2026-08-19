import * as stylex from '@stylexjs/stylex';
import {useId, type ReactNode} from 'react';

import {semanticTokens} from '../authoring.stylex.js';
import {useInternationalization} from '../i18n/index.js';
import {Icon} from '../Icon/index.js';
import {IconButton} from '../IconButton/index.js';
import {Overlay} from '../Overlay/index.js';

const styles = stylex.create({
  surface: {
    backgroundColor: semanticTokens.colorSurfaceRaised,
    borderRadius: semanticTokens.radiusContainer,
    boxShadow: semanticTokens.elevationHigh,
    color: semanticTokens.colorText,
    display: 'flex',
    flexDirection: 'column',
    fontFamily: semanticTokens.fontFamilyBody,
    gap: semanticTokens.spacingSm,
    maxHeight: '100%',
    padding: semanticTokens.spacingLg,
  },
  header: {
    alignItems: 'center',
    display: 'flex',
    gap: semanticTokens.spacingMd,
    justifyContent: 'space-between',
  },
  // An eyebrow, not a headline. The media is the subject of this surface and
  // the caption only has to say which one it is.
  title: {
    color: semanticTokens.colorTextSecondary,
    fontFamily: semanticTokens.fontFamilyHeading,
    fontSize: semanticTokens.fontSizeXs,
    letterSpacing: semanticTokens.letterSpacingEyebrow,
    lineHeight: semanticTokens.lineHeightHeading,
    margin: 0,
    textTransform: 'uppercase',
  },
  // The media sits in a well rather than on the plate itself, so a picture
  // with a pale edge still reads as a picture and not as part of the surface.
  media: {
    alignItems: 'center',
    backgroundColor: semanticTokens.colorSurfaceMuted,
    borderRadius: semanticTokens.radiusInner,
    display: 'flex',
    justifyContent: 'center',
    minHeight: 0,
    overflow: 'auto',
    padding: semanticTokens.spacingMd,
  },
});

/** Props for a full-viewport media viewer. */
export interface LightboxProps {
  readonly children: ReactNode;
  readonly closeLabel?: string;
  readonly onDismiss: () => void;
  readonly open: boolean;
  readonly title: ReactNode;
}

/**
 * Shows one piece of media at viewport scale. It is modal, so the page behind
 * stops scrolling and focus stays on the media until it is dismissed.
 */
export function Lightbox({
  children,
  closeLabel,
  onDismiss,
  open,
  title,
}: LightboxProps) {
  const {messages} = useInternationalization();
  const titleId = useId();

  return (
    <Overlay onDismiss={onDismiss} open={open}>
      <div
        aria-labelledby={titleId}
        aria-modal="true"
        role="dialog"
        {...stylex.props(styles.surface)}
      >
        <div {...stylex.props(styles.header)}>
          <p id={titleId} {...stylex.props(styles.title)}>
            {title}
          </p>
          <IconButton
            aria-label={closeLabel ?? messages.close}
            onClick={onDismiss}
            variant="ghost"
          >
            <Icon>
              <path
                d="m6 6 12 12M18 6 6 18"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              />
            </Icon>
          </IconButton>
        </div>
        <div {...stylex.props(styles.media)}>{children}</div>
      </div>
    </Overlay>
  );
}
