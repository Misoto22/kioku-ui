import * as stylex from '@stylexjs/stylex';
import {
  useEffect,
  useRef,
  type ButtonHTMLAttributes,
  type ReactNode,
  type RefObject,
} from 'react';

import {semanticTokens} from '../authoring.stylex.js';
import {focusableElements} from '../hooks/focusableSelector.js';
import {useListFocus} from '../hooks/useListFocus.js';
import type {Alignment, Placement} from '../hooks/useAnchoredPosition.js';
import {Item} from '../Item/index.js';
import {Popover} from '../Popover/index.js';

// A menu stays wide enough for a two-word action plus its shortcut; the scale
// stops at 38px, so the floor is a named multiple of it rather than a literal.
// The bleed is added back because the list negates the popover's padding.
const menuBleed = `calc(-1 * ${semanticTokens.spacingMd})`;
const menuMinWidth = `calc(${semanticTokens.spacing2xl} * 5 + ${semanticTokens.spacingMd} * 2)`;

// The same bookmark the sidebar draws beside the reader's page: two hairlines
// wide, short of the row's full height so it reads as a stroke laid on the
// row rather than as a rule dividing it.
const markWidth = `calc(2 * ${semanticTokens.borderWidth})`;
const markHeight = '64%';

const styles = stylex.create({
  // The list negates the popover's padding exactly and puts it back on each
  // row, so a hover wash runs the full width of the plate instead of floating
  // as a rectangle inside it. Rows sit flush: a gap between actions reads as
  // separate controls rather than as one menu.
  menu: {
    display: 'flex',
    flexDirection: 'column',
    marginBlock: menuBleed,
    marginInline: menuBleed,
    minWidth: menuMinWidth,
    paddingBlock: semanticTokens.spacingXs,
  },
  // A row inside a plate is a solid block, not a small outlined box: no
  // hairline, no radius of its own, the state carried entirely by the fill.
  // At rest it holds the second rank of ink, because every row in a menu is
  // merely available; the one under the pointer rises to the first and takes
  // the bookmark, so the pointer is marked twice over and filled never.
  item: {
    backgroundColor: 'transparent',
    borderStyle: 'none',
    borderWidth: 0,
    color: semanticTokens.colorTextSecondary,
    cursor: 'pointer',
    fontFamily: semanticTokens.fontFamilyBody,
    fontSize: semanticTokens.fontSizeMd,
    letterSpacing: semanticTokens.letterSpacingBody,
    lineHeight: semanticTokens.lineHeightBody,
    paddingBlock: semanticTokens.spacingXs,
    paddingInline: semanticTokens.spacingMd,
    position: 'relative',
    textAlign: 'start',
    transitionDuration: semanticTokens.durationFast,
    transitionProperty: 'background-color, color',
    transitionTimingFunction: semanticTokens.easingStandard,
    width: '100%',
    '::before': {
      backgroundColor: semanticTokens.colorAccent,
      content: '',
      height: {default: 0, ':hover:not(:disabled)': markHeight},
      insetBlockStart: '50%',
      insetInlineStart: 0,
      position: 'absolute',
      transform: 'translateY(-50%)',
      transitionDuration: semanticTokens.durationModerate,
      transitionProperty: 'height',
      transitionTimingFunction: semanticTokens.easingStandard,
      width: markWidth,
    },
    ':disabled': {
      color: semanticTokens.colorDisabledText,
      cursor: 'default',
    },
    ':focus-visible': {
      outlineColor: semanticTokens.colorFocus,
      outlineOffset: semanticTokens.focusOffset,
      outlineStyle: semanticTokens.borderStyle,
      outlineWidth: semanticTokens.focusWidth,
    },
    ':hover:not(:disabled)': {
      backgroundColor: semanticTokens.colorOverlayHover,
      color: semanticTokens.colorText,
    },
  },
});

/** Props for a menu of actions anchored to a trigger. */
export interface DropdownMenuProps {
  readonly alignment?: Alignment;
  readonly anchorRef: RefObject<HTMLElement | null>;
  readonly children: ReactNode;
  readonly label: string;
  readonly onDismiss?: () => void;
  readonly open: boolean;
  readonly placement?: Placement;
}

/**
 * Presents a list of actions beside its trigger. The menu is one tab stop:
 * arrow keys, Home, and End move between items, and Escape closes it.
 */
export function DropdownMenu({
  alignment = 'start',
  anchorRef,
  children,
  label,
  onDismiss,
  open,
  placement = 'bottom',
}: DropdownMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const {onKeyDown} = useListFocus(menuRef, {orientation: 'vertical'});

  useEffect(() => {
    if (!open) {
      return;
    }

    // Waiting a frame lets the portalled surface mount before focus moves.
    const frame = requestAnimationFrame(() => {
      const menu = menuRef.current;
      if (menu) {
        focusableElements(menu)[0]?.focus({preventScroll: true});
      }
    });

    return () => {
      cancelAnimationFrame(frame);
    };
  }, [open]);

  return (
    <Popover
      alignment={alignment}
      anchorRef={anchorRef}
      {...(onDismiss ? {onDismiss} : {})}
      open={open}
      placement={placement}
      role="presentation"
    >
      <div
        aria-label={label}
        onKeyDown={onKeyDown}
        ref={menuRef}
        role="menu"
        {...stylex.props(styles.menu)}
      >
        {children}
      </div>
    </Popover>
  );
}

/** Props for one action inside a `DropdownMenu`. */
export interface DropdownMenuItemProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'className' | 'role'
> {
  readonly description?: ReactNode;
  readonly leading?: ReactNode;
  readonly trailing?: ReactNode;
}

/** Renders one menu action with the shared leading/label/trailing rhythm. */
export function DropdownMenuItem({
  children,
  description,
  leading,
  trailing,
  type = 'button',
  ...props
}: DropdownMenuItemProps) {
  return (
    <button
      {...props}
      role="menuitem"
      type={type}
      {...stylex.props(styles.item)}
    >
      <Item
        {...(description === undefined ? {} : {description})}
        {...(leading === undefined ? {} : {leading})}
        {...(trailing === undefined ? {} : {trailing})}
      >
        {children}
      </Item>
    </button>
  );
}
