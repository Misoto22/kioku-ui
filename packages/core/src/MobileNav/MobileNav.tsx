import * as stylex from '@stylexjs/stylex';
import {useId, useState, type ReactNode} from 'react';

import {semanticTokens} from '../authoring.stylex.js';
import {useFocusTrap} from '../hooks/useFocusTrap.js';
import {useScrollLock} from '../hooks/useScrollLock.js';
import {Icon} from '../Icon/index.js';
import {IconButton} from '../IconButton/index.js';
import {Layer} from '../Layer/index.js';

const styles = stylex.create({
  scrim: {
    backgroundColor: semanticTokens.colorOverlayActive,
    display: 'flex',
    inset: 0,
    position: 'fixed',
  },
  drawer: {
    backgroundColor: semanticTokens.colorSurface,
    borderEndEndRadius: semanticTokens.radiusPage,
    borderStartEndRadius: semanticTokens.radiusPage,
    boxShadow: semanticTokens.elevationHigh,
    display: 'flex',
    flexDirection: 'column',
    gap: semanticTokens.spacingMd,
    maxWidth: '20rem',
    outline: 'none',
    overflowY: 'auto',
    padding: semanticTokens.spacingLg,
    width: '85%',
  },
  header: {
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'space-between',
  },
  title: {
    color: semanticTokens.colorText,
    fontFamily: semanticTokens.fontFamilyHeading,
    fontSize: semanticTokens.fontSizeLg,
    fontWeight: semanticTokens.fontWeightStrong,
    margin: 0,
  },
});

/** Props for the navigation drawer used on narrow viewports. */
export interface MobileNavProps {
  readonly children: ReactNode;
  readonly closeLabel?: string;
  readonly label: string;
  readonly title?: ReactNode;
}

/**
 * Holds navigation behind a trigger on narrow viewports. It owns its open
 * state and traps focus inside the drawer while it is open.
 */
export function MobileNav({
  children,
  closeLabel = 'Close navigation',
  label,
  title,
}: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const [drawer, setDrawer] = useState<HTMLDivElement | null>(null);
  const titleId = useId();

  useFocusTrap(drawer, open);
  useScrollLock(open);

  return (
    <>
      <IconButton
        aria-expanded={open}
        aria-label={label}
        onClick={() => {
          setOpen(true);
        }}
        variant="ghost"
      >
        <Icon>
          <path
            d="M4 7h16M4 12h16M4 17h16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
        </Icon>
      </IconButton>
      {open ? (
        <Layer>
          <div
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                setOpen(false);
              }
            }}
            {...stylex.props(styles.scrim)}
          >
            <div
              aria-labelledby={titleId}
              aria-modal="true"
              onKeyDown={(event) => {
                if (event.key === 'Escape') {
                  setOpen(false);
                }
              }}
              ref={setDrawer}
              role="dialog"
              tabIndex={-1}
              {...stylex.props(styles.drawer)}
            >
              <div {...stylex.props(styles.header)}>
                <p id={titleId} {...stylex.props(styles.title)}>
                  {title ?? label}
                </p>
                <IconButton
                  aria-label={closeLabel}
                  onClick={() => {
                    setOpen(false);
                  }}
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
              {children}
            </div>
          </div>
        </Layer>
      ) : null}
    </>
  );
}
