import * as stylex from '@stylexjs/stylex';
import {useId, useState, type ReactNode} from 'react';

import {semanticTokens} from '../authoring.stylex.js';
import {useFocusTrap} from '../hooks/useFocusTrap.js';
import {useScrollLock} from '../hooks/useScrollLock.js';
import {Icon} from '../Icon/index.js';
import {IconButton} from '../IconButton/index.js';
import {Layer} from '../Layer/index.js';

// Wide enough for a two-word destination and its glyph, narrow enough that the
// page behind it stays visible. Built from the scale, not written as a length.
const drawerMaxWidth = `calc(11 * ${semanticTokens.spacing2xl})`;

const styles = stylex.create({
  // The scrim is the one token that says "the page behind this is out of
  // reach". `overlayActive` says something else entirely — it is the wash a
  // row wears while a finger is down on it, 7% ink, which leaves the page
  // fully legible and fully clickable-looking behind an open drawer.
  scrim: {
    backgroundColor: semanticTokens.colorScrim,
    display: 'flex',
    inset: 0,
    position: 'fixed',
  },
  // A floating surface: elevation and no border, because stacking both draws
  // the same line twice.
  drawer: {
    backgroundColor: semanticTokens.colorSurface,
    borderEndEndRadius: semanticTokens.radiusPage,
    borderStartEndRadius: semanticTokens.radiusPage,
    borderStyle: 'none',
    boxShadow: semanticTokens.elevationHigh,
    color: semanticTokens.colorText,
    display: 'flex',
    flexDirection: 'column',
    fontFamily: semanticTokens.fontFamilyBody,
    maxWidth: drawerMaxWidth,
    outlineStyle: 'none',
    overflowY: 'auto',
    padding: semanticTokens.spacingLg,
    rowGap: semanticTokens.spacingLg,
    width: '85%',
    ':focus-visible': {
      outlineColor: semanticTokens.colorFocus,
      outlineOffset: semanticTokens.focusOffset,
      outlineStyle: semanticTokens.borderStyle,
      outlineWidth: semanticTokens.focusWidth,
    },
  },
  // The drawer's own masthead, parted from the destinations by a rule.
  header: {
    alignItems: 'center',
    borderBlockEndColor: semanticTokens.borderStrong,
    borderBlockEndStyle: semanticTokens.borderStyle,
    borderBlockEndWidth: semanticTokens.borderWidth,
    columnGap: semanticTokens.spacingSm,
    display: 'flex',
    justifyContent: 'space-between',
    paddingBlockEnd: semanticTokens.spacingMd,
  },
  title: {
    color: semanticTokens.colorText,
    fontFamily: semanticTokens.fontFamilyHeading,
    fontSize: semanticTokens.fontSizeLg,
    fontWeight: semanticTokens.fontWeightMedium,
    letterSpacing: semanticTokens.letterSpacingHeading,
    lineHeight: semanticTokens.lineHeightHeading,
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
              {...stylex.props(styles.drawer)}
              tabIndex={-1}
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
