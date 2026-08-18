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
const menuMinWidth = `calc(${semanticTokens.spacing2xl} * 5)`;

const styles = stylex.create({
  menu: {
    display: 'flex',
    flexDirection: 'column',
    gap: semanticTokens.spacingXs,
    minWidth: menuMinWidth,
  },
  item: {
    backgroundColor: 'transparent',
    borderRadius: semanticTokens.radiusElement,
    borderStyle: 'none',
    borderWidth: 0,
    color: semanticTokens.colorText,
    cursor: 'pointer',
    fontFamily: semanticTokens.fontFamilyBody,
    fontSize: semanticTokens.fontSizeMd,
    letterSpacing: semanticTokens.letterSpacingBody,
    lineHeight: semanticTokens.lineHeightBody,
    paddingBlock: semanticTokens.spacingXs,
    paddingInline: semanticTokens.spacingSm,
    textAlign: 'start',
    transitionDuration: semanticTokens.durationFast,
    transitionProperty: 'background-color, color',
    transitionTimingFunction: semanticTokens.easingStandard,
    width: '100%',
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
