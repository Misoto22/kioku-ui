import * as stylex from '@stylexjs/stylex';
import {useRef, useState, type ReactNode} from 'react';

import {semanticTokens} from '../authoring.stylex.js';
import {focusableElements} from '../hooks/focusableSelector.js';
import {useListFocus} from '../hooks/useListFocus.js';
import {Icon} from '../Icon/index.js';
import {Popover} from '../Popover/index.js';
import type {Alignment, Placement} from '../hooks/useAnchoredPosition.js';

// The trigger wears the same mark as the destinations beside it: two
// hairlines at the inline-start edge, hinted on hover and claimed when open.
const markWidth = `calc(2 * ${semanticTokens.borderWidth})`;
const hoverMarkHeight = '40%';
const openMarkHeight = '72%';
const panelMinWidth = `calc(8 * ${semanticTokens.spacing2xl})`;

const styles = stylex.create({
  anchor: {display: 'inline-flex'},
  trigger: {
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderRadius: semanticTokens.radiusElement,
    borderStyle: 'none',
    borderWidth: 0,
    color: semanticTokens.colorTextSecondary,
    columnGap: semanticTokens.spacingXs,
    cursor: 'pointer',
    display: 'inline-flex',
    fontFamily: semanticTokens.fontFamilyBody,
    fontSize: semanticTokens.fontSizeMd,
    letterSpacing: semanticTokens.letterSpacingLabel,
    minHeight: semanticTokens.sizeControlMd,
    paddingBlock: semanticTokens.spacingXs,
    paddingInline: semanticTokens.spacingSm,
    position: 'relative',
    transitionDuration: semanticTokens.durationFast,
    transitionProperty: 'color',
    transitionTimingFunction: semanticTokens.easingStandard,
    '::before': {
      content: '',
      insetBlockStart: '50%',
      insetInlineStart: 0,
      position: 'absolute',
      transform: 'translateY(-50%)',
      transitionDuration: `${semanticTokens.durationFast}, ${semanticTokens.durationModerate}`,
      transitionProperty: 'background-color, height',
      transitionTimingFunction: semanticTokens.easingStandard,
      width: markWidth,
    },
    ':focus-visible': {
      outlineColor: semanticTokens.colorFocus,
      outlineOffset: semanticTokens.focusOffset,
      outlineStyle: semanticTokens.borderStyle,
      outlineWidth: semanticTokens.focusWidth,
    },
  },
  closed: {
    '::before': {
      backgroundColor: semanticTokens.borderStrong,
      height: {default: 0, ':hover': hoverMarkHeight},
    },
    ':hover': {color: semanticTokens.colorText},
  },
  open: {
    color: semanticTokens.colorText,
    '::before': {
      backgroundColor: semanticTokens.colorAccent,
      height: openMarkHeight,
    },
  },
  marker: {
    alignItems: 'center',
    display: 'inline-flex',
    transitionDuration: semanticTokens.durationModerate,
    transitionProperty: 'transform',
    transitionTimingFunction: semanticTokens.easingStandard,
  },
  markerOpen: {transform: 'rotate(180deg)'},
  panel: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: panelMinWidth,
    // A run of destinations tiles one hairline apart, as it does in the rail.
    rowGap: semanticTokens.borderWidth,
  },
});

/** Props for a grouped menu inside the page banner. */
export interface TopNavMenuProps {
  readonly alignment?: Alignment;
  readonly children: ReactNode;
  readonly label: string;
  readonly placement?: Placement;
}

/**
 * A banner menu that owns its open state. It is a disclosure rather than a
 * `menu`: the panel holds links to elsewhere, and calling those `menuitem`
 * would promise a command that runs here.
 */
export function TopNavMenu({
  alignment = 'start',
  children,
  label,
  placement = 'bottom',
}: TopNavMenuProps) {
  const anchorRef = useRef<HTMLSpanElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const {onKeyDown} = useListFocus(panelRef, {orientation: 'vertical'});

  return (
    <>
      <span ref={anchorRef} {...stylex.props(styles.anchor)}>
        <button
          aria-expanded={open}
          onClick={() => {
            setOpen((value) => !value);
          }}
          {...stylex.props(styles.trigger, open ? styles.open : styles.closed)}
          type="button"
        >
          {label}
          <span
            aria-hidden="true"
            {...stylex.props(styles.marker, open && styles.markerOpen)}
          >
            <Icon size="sm">
              <path
                d="m6 9 6 6 6-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              />
            </Icon>
          </span>
        </button>
      </span>
      <Popover
        alignment={alignment}
        anchorRef={anchorRef}
        aria-label={label}
        onDismiss={() => {
          setOpen(false);
        }}
        open={open}
        placement={placement}
        role="group"
      >
        <div
          onKeyDown={onKeyDown}
          ref={(node) => {
            panelRef.current = node;
            if (node) {
              focusableElements(node)[0]?.focus({preventScroll: true});
            }
          }}
          {...stylex.props(styles.panel)}
        >
          {children}
        </div>
      </Popover>
    </>
  );
}
