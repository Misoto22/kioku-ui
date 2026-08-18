import * as stylex from '@stylexjs/stylex';
import {useRef, useState, type ReactNode} from 'react';

import {semanticTokens} from '../authoring.stylex.js';
import {focusableElements} from '../hooks/focusableSelector.js';
import {useListFocus} from '../hooks/useListFocus.js';
import {Icon} from '../Icon/index.js';
import {Popover} from '../Popover/index.js';
import type {Alignment, Placement} from '../hooks/useAnchoredPosition.js';

const styles = stylex.create({
  trigger: {
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderRadius: semanticTokens.radiusElement,
    borderStyle: 'none',
    borderWidth: 0,
    color: semanticTokens.colorTextSecondary,
    cursor: 'pointer',
    display: 'inline-flex',
    fontFamily: semanticTokens.fontFamilyBody,
    fontSize: semanticTokens.fontSizeMd,
    gap: semanticTokens.spacingXs,
    paddingBlock: semanticTokens.spacingXs,
    paddingInline: semanticTokens.spacingSm,
    ':focus-visible': {
      outlineColor: semanticTokens.colorFocus,
      outlineOffset: semanticTokens.focusOffset,
      outlineStyle: semanticTokens.borderStyle,
      outlineWidth: semanticTokens.focusWidth,
    },
    ':hover': {
      backgroundColor: semanticTokens.colorOverlayHover,
      color: semanticTokens.colorText,
    },
  },
  open: {color: semanticTokens.colorText},
  marker: {
    transitionDuration: semanticTokens.durationFast,
    transitionProperty: 'transform',
    transitionTimingFunction: semanticTokens.easingStandard,
  },
  markerOpen: {transform: 'rotate(180deg)'},
  panel: {
    display: 'flex',
    flexDirection: 'column',
    gap: semanticTokens.spacingXs,
    minWidth: '14rem',
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
      <span ref={anchorRef} style={{display: 'inline-flex'}}>
        <button
          aria-expanded={open}
          onClick={() => {
            setOpen((value) => !value);
          }}
          type="button"
          {...stylex.props(styles.trigger, open && styles.open)}
        >
          {label}
          <span {...stylex.props(styles.marker, open && styles.markerOpen)}>
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
