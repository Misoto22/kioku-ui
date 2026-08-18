import * as stylex from '@stylexjs/stylex';
import {
  useState,
  type ChangeEvent,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react';

import {semanticTokens} from '../authoring.stylex.js';

// Selection is a 2px accent bar pressed against the leading edge, never a
// fill or a tinted card. `focusWidth` is this system's 2px, so the bar and
// the focus ring stay the same weight when a theme changes it.
const selectionMark = `inset ${semanticTokens.focusWidth} 0 0 0 ${semanticTokens.colorAccent}`;

const styles = stylex.create({
  label: {
    backgroundColor: semanticTokens.colorSurface,
    borderColor: semanticTokens.borderDefault,
    borderRadius: semanticTokens.radiusContainer,
    borderStyle: semanticTokens.borderStyle,
    borderWidth: semanticTokens.borderWidth,
    color: semanticTokens.colorText,
    cursor: 'pointer',
    display: 'flex',
    fontFamily: semanticTokens.fontFamilyBody,
    gap: semanticTokens.spacingSm,
    padding: semanticTokens.spacingLg,
    transitionDuration: semanticTokens.durationFast,
    transitionProperty: 'background-color, border-color, box-shadow, color',
    transitionTimingFunction: semanticTokens.easingStandard,
  },
  unselected: {
    boxShadow: 'none',
    ':hover:not(:disabled)': {
      backgroundColor: semanticTokens.colorOverlayHover,
      borderColor: semanticTokens.borderInteractive,
    },
  },
  selected: {
    boxShadow: selectionMark,
  },
  disabled: {
    backgroundColor: semanticTokens.colorDisabledSurface,
    borderColor: semanticTokens.borderDisabled,
    boxShadow: 'none',
    color: semanticTokens.colorDisabledText,
    cursor: 'default',
  },
  control: {
    accentColor: semanticTokens.colorAccent,
    blockSize: semanticTokens.spacingMd,
    flexShrink: 0,
    inlineSize: semanticTokens.spacingMd,
    marginBlockStart: semanticTokens.spacingXs,
    ':focus-visible': {
      outlineColor: semanticTokens.colorFocus,
      outlineOffset: semanticTokens.focusOffset,
      outlineStyle: semanticTokens.borderStyle,
      outlineWidth: semanticTokens.focusWidth,
    },
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: semanticTokens.spacingXs,
  },
  title: {
    color: semanticTokens.colorTextSecondary,
    fontSize: semanticTokens.fontSizeMd,
    fontWeight: semanticTokens.fontWeightRegular,
    letterSpacing: semanticTokens.letterSpacingBody,
    lineHeight: semanticTokens.lineHeightBody,
  },
  titleSelected: {
    color: semanticTokens.colorText,
    fontWeight: semanticTokens.fontWeightMedium,
  },
  titleDisabled: {color: semanticTokens.colorDisabledText},
  description: {
    color: semanticTokens.colorTextSecondary,
    fontSize: semanticTokens.fontSizeSm,
    letterSpacing: semanticTokens.letterSpacingBody,
    lineHeight: semanticTokens.lineHeightBody,
  },
  descriptionDisabled: {color: semanticTokens.colorDisabledText},
});

type SharedSelectableCardProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'checked' | 'children' | 'className' | 'defaultChecked' | 'type'
> & {
  readonly description?: ReactNode;
  readonly label: ReactNode;
  readonly multiple?: boolean;
};

type ControlledSelectableCardProps = SharedSelectableCardProps & {
  readonly checked: boolean;
  readonly defaultChecked?: never;
  readonly onChange: (event: ChangeEvent<HTMLInputElement>) => void;
};

type UncontrolledSelectableCardProps = SharedSelectableCardProps & {
  readonly checked?: never;
  readonly defaultChecked?: boolean;
};

/** Props for a card that carries its own selection control. */
export type SelectableCardProps =
  ControlledSelectableCardProps | UncontrolledSelectableCardProps;

/**
 * A card that records a choice. The whole surface is the label, so a click
 * anywhere on it selects, and `multiple` decides whether choices exclude each
 * other. Selection is tracked in state rather than through a `:has()`
 * selector, which the build's StyleX policy does not allow.
 */
export function SelectableCard({
  checked,
  defaultChecked = false,
  description,
  disabled = false,
  label,
  multiple = false,
  onChange,
  ...props
}: SelectableCardProps) {
  const [internalChecked, setInternalChecked] = useState(defaultChecked);
  const isChecked = checked ?? internalChecked;
  const isSelected = isChecked && !disabled;

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    if (checked === undefined) {
      setInternalChecked(event.currentTarget.checked);
    }
    onChange?.(event);
  }

  return (
    <label
      {...stylex.props(
        styles.label,
        disabled
          ? styles.disabled
          : isSelected
            ? styles.selected
            : styles.unselected,
      )}
    >
      <input
        {...props}
        checked={isChecked}
        disabled={disabled}
        onChange={handleChange}
        {...stylex.props(styles.control)}
        type={multiple ? 'checkbox' : 'radio'}
      />
      <span {...stylex.props(styles.content)}>
        <span
          {...stylex.props(
            styles.title,
            isSelected && styles.titleSelected,
            disabled && styles.titleDisabled,
          )}
        >
          {label}
        </span>
        {description === undefined ? null : (
          <span
            {...stylex.props(
              styles.description,
              disabled && styles.descriptionDisabled,
            )}
          >
            {description}
          </span>
        )}
      </span>
    </label>
  );
}
