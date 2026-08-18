import * as stylex from '@stylexjs/stylex';
import {useId, useRef, type HTMLAttributes, type ReactNode} from 'react';

import {semanticTokens} from '../authoring.stylex.js';
import {useListFocus} from '../hooks/useListFocus.js';

const styles = stylex.create({
  list: {
    borderBlockEndColor: semanticTokens.borderDefault,
    borderBlockEndStyle: semanticTokens.borderStyle,
    borderBlockEndWidth: semanticTokens.borderWidth,
    display: 'flex',
    gap: semanticTokens.spacingXs,
  },
  tab: {
    backgroundColor: 'transparent',
    borderBlockEndColor: 'transparent',
    borderBlockEndStyle: semanticTokens.borderStyle,
    borderBlockEndWidth: semanticTokens.focusWidth,
    borderInlineStyle: 'none',
    borderInlineWidth: 0,
    borderBlockStartStyle: 'none',
    borderBlockStartWidth: 0,
    color: semanticTokens.colorTextSecondary,
    cursor: 'pointer',
    fontFamily: semanticTokens.fontFamilyBody,
    fontSize: semanticTokens.fontSizeMd,
    fontWeight: semanticTokens.fontWeightMedium,
    marginBlockEnd: `calc(-1 * ${semanticTokens.borderWidth})`,
    paddingBlock: semanticTokens.spacingSm,
    paddingInline: semanticTokens.spacingMd,
    ':disabled': {color: semanticTokens.colorDisabledText, cursor: 'default'},
    ':focus-visible': {
      outlineColor: semanticTokens.colorFocus,
      outlineOffset: semanticTokens.focusOffset,
      outlineStyle: semanticTokens.borderStyle,
      outlineWidth: semanticTokens.focusWidth,
    },
    ':hover:not(:disabled)': {color: semanticTokens.colorText},
  },
  selected: {
    borderBlockEndColor: semanticTokens.colorAccent,
    color: semanticTokens.colorText,
  },
});

/** One selectable tab in a `TabList`. */
export interface TabOption {
  /**
   * The `id` of the panel this tab reveals. Supply it when the panel is in the
   * DOM: `aria-controls` pointing at an element that does not exist is worse
   * than omitting it, because assistive technology follows the reference.
   */
  readonly controls?: string;
  readonly disabled?: boolean;
  readonly id: string;
  readonly label: ReactNode;
}

/** Props for a single-select strip of tabs. */
export interface TabListProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'children' | 'className' | 'onSelect' | 'role'
> {
  readonly label: string;
  readonly onSelect: (id: string) => void;
  readonly selectedId: string;
  readonly tabs: readonly TabOption[];
}

/**
 * Selects one of several panels. The strip is one tab stop: arrow keys move
 * between tabs and selection follows focus, matching the ARIA tabs pattern.
 */
export function TabList({
  label,
  onSelect,
  selectedId,
  tabs,
  ...props
}: TabListProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const {onKeyDown} = useListFocus(listRef, {orientation: 'horizontal'});
  const prefix = useId();

  return (
    <div
      {...props}
      aria-label={label}
      onKeyDown={onKeyDown}
      ref={listRef}
      role="tablist"
      {...stylex.props(styles.list)}
    >
      {tabs.map(({controls, disabled, id, label: tabLabel}) => {
        const selected = id === selectedId;

        return (
          <button
            {...(controls === undefined ? {} : {'aria-controls': controls})}
            aria-selected={selected}
            disabled={disabled ?? false}
            id={`${prefix}-${id}-tab`}
            key={id}
            onClick={() => {
              onSelect(id);
            }}
            onFocus={() => {
              if (!disabled) {
                onSelect(id);
              }
            }}
            role="tab"
            tabIndex={selected ? 0 : -1}
            type="button"
            {...stylex.props(styles.tab, selected && styles.selected)}
          >
            {tabLabel}
          </button>
        );
      })}
    </div>
  );
}
