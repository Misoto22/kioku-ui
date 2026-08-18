import * as stylex from '@stylexjs/stylex';
import {useId, type ReactNode} from 'react';

import {semanticTokens} from '../authoring.stylex.js';
import {useInternationalization} from '../i18n/index.js';
import {Icon} from '../Icon/index.js';
import {IconButton} from '../IconButton/index.js';
import {Overlay} from '../Overlay/index.js';

const styles = stylex.create({
  surface: {
    display: 'flex',
    flexDirection: 'column',
    gap: semanticTokens.spacingSm,
    maxHeight: '100%',
    outline: 'none',
  },
  header: {
    alignItems: 'center',
    color: semanticTokens.colorTextOnAccent,
    display: 'flex',
    gap: semanticTokens.spacingMd,
    justifyContent: 'space-between',
  },
  title: {
    color: semanticTokens.colorTextOnAccent,
    fontFamily: semanticTokens.fontFamilyBody,
    fontSize: semanticTokens.fontSizeMd,
    margin: 0,
  },
  media: {
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'center',
    minHeight: 0,
    overflow: 'auto',
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
