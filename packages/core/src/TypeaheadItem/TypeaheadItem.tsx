import * as stylex from '@stylexjs/stylex';
import type {LiHTMLAttributes, ReactNode} from 'react';

import {semanticTokens} from '../authoring.stylex.js';
import {Item} from '../Item/index.js';

const markWidth = `calc(2 * ${semanticTokens.borderWidth})`;
const markHeight = '64%';

const styles = stylex.create({
  // A suggestion on offer is merely available, so it sits in the second rank;
  // the one the keys point at rises to the first.
  option: {
    color: semanticTokens.colorTextSecondary,
    cursor: 'pointer',
    fontFamily: semanticTokens.fontFamilyBody,
    fontSize: semanticTokens.fontSizeMd,
    letterSpacing: semanticTokens.letterSpacingLabel,
    lineHeight: semanticTokens.lineHeightBody,
    paddingBlock: semanticTokens.spacingXs,
    paddingInline: semanticTokens.spacingMd,
    position: 'relative',
    transitionDuration: semanticTokens.durationFast,
    transitionProperty: 'background-color, color',
    transitionTimingFunction: semanticTokens.easingStandard,
  },
  idle: {
    ':hover': {
      backgroundColor: semanticTokens.colorOverlayHover,
      color: semanticTokens.colorText,
    },
  },
  // Focus stays in the combobox, so the row it points at carries the whole
  // signal itself: the wash, the first rank of ink, and the bookmark at the
  // inline-start edge — never a filled bar.
  // No weight change. This is a list a reader moves through with the arrow
  // keys, and the label is proportional type: a heavier row is a WIDER row, so
  // every press reflowed the line under the cursor. `NavItem` settled the same
  // question the same way — ink alone is enough to find, and it leaves the
  // column still. Weight remains a legal mark elsewhere (design-language §5);
  // it is this case, a moving cursor over proportional text, that it fails.
  active: {
    backgroundColor: semanticTokens.colorOverlayHover,
    color: semanticTokens.colorText,
    '::before': {
      backgroundColor: semanticTokens.colorAccent,
      content: '',
      height: markHeight,
      insetBlockStart: '50%',
      insetInlineStart: 0,
      position: 'absolute',
      transform: 'translateY(-50%)',
      width: markWidth,
    },
  },
  disabled: {color: semanticTokens.colorDisabledText, cursor: 'default'},
});

/** Props for one suggestion inside a typeahead listbox. */
export interface TypeaheadItemProps extends Omit<
  LiHTMLAttributes<HTMLLIElement>,
  'aria-disabled' | 'aria-selected' | 'className' | 'role'
> {
  readonly active?: boolean;
  readonly description?: ReactNode;
  readonly disabled?: boolean;
  readonly leading?: ReactNode;
  readonly trailing?: ReactNode;
}

/**
 * One suggestion, for a caller rendering its own list. It reports
 * `aria-selected` rather than taking focus, because the combobox pattern
 * keeps focus in the input and points at the active option instead.
 */
export function TypeaheadItem({
  active = false,
  children,
  description,
  disabled = false,
  leading,
  trailing,
  ...props
}: TypeaheadItemProps) {
  return (
    <li
      {...props}
      aria-disabled={disabled || undefined}
      aria-selected={active}
      role="option"
      {...stylex.props(
        styles.option,
        disabled ? styles.disabled : active ? styles.active : styles.idle,
      )}
    >
      <Item
        {...(description === undefined ? {} : {description})}
        {...(leading === undefined ? {} : {leading})}
        {...(trailing === undefined ? {} : {trailing})}
      >
        {children}
      </Item>
    </li>
  );
}
