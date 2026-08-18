import * as stylex from '@stylexjs/stylex';
import type {LiHTMLAttributes, ReactNode} from 'react';

import {semanticTokens} from '../authoring.stylex.js';
import {Item} from '../Item/index.js';

const styles = stylex.create({
  option: {
    color: semanticTokens.colorText,
    cursor: 'pointer',
    fontFamily: semanticTokens.fontFamilyBody,
    fontSize: semanticTokens.fontSizeMd,
    paddingBlock: semanticTokens.spacingXs,
    paddingInline: semanticTokens.spacingSm,
  },
  active: {backgroundColor: semanticTokens.colorOverlayHover},
  disabled: {color: semanticTokens.colorDisabledText, cursor: 'default'},
});

/** Props for one suggestion inside a typeahead listbox. */
export interface TypeaheadItemProps extends Omit<
  LiHTMLAttributes<HTMLLIElement>,
  'className' | 'role'
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
        active && !disabled && styles.active,
        disabled && styles.disabled,
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
