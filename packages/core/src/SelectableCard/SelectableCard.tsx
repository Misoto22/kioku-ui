import * as stylex from '@stylexjs/stylex';
import {
  useState,
  type ChangeEvent,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react';

import {semanticTokens} from '../authoring.stylex.js';

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
    ':focus-within': {
      outlineColor: semanticTokens.colorFocus,
      outlineOffset: semanticTokens.focusOffset,
      outlineStyle: semanticTokens.borderStyle,
      outlineWidth: semanticTokens.focusWidth,
    },
  },
  selected: {borderColor: semanticTokens.colorAccent},
  disabled: {
    backgroundColor: semanticTokens.colorDisabledSurface,
    borderColor: semanticTokens.borderDisabled,
    color: semanticTokens.colorDisabledText,
    cursor: 'default',
  },
  control: {
    accentColor: semanticTokens.colorAccent,
    blockSize: semanticTokens.spacingMd,
    flexShrink: 0,
    inlineSize: semanticTokens.spacingMd,
    marginBlockStart: semanticTokens.spacingXs,
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: semanticTokens.spacingXs,
  },
  title: {
    fontSize: semanticTokens.fontSizeMd,
    fontWeight: semanticTokens.fontWeightMedium,
    lineHeight: semanticTokens.lineHeightBody,
  },
  description: {
    color: semanticTokens.colorTextSecondary,
    fontSize: semanticTokens.fontSizeSm,
    lineHeight: semanticTokens.lineHeightBody,
  },
});

/** Props for a card that carries its own selection control. */
export interface SelectableCardProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'children' | 'className' | 'type'
> {
  readonly description?: ReactNode;
  readonly label: ReactNode;
  readonly multiple?: boolean;
}

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
        isChecked && !disabled && styles.selected,
        disabled && styles.disabled,
      )}
    >
      <input
        {...props}
        checked={isChecked}
        disabled={disabled}
        onChange={handleChange}
        type={multiple ? 'checkbox' : 'radio'}
        {...stylex.props(styles.control)}
      />
      <span {...stylex.props(styles.content)}>
        <span {...stylex.props(styles.title)}>{label}</span>
        {description === undefined ? null : (
          <span {...stylex.props(styles.description)}>{description}</span>
        )}
      </span>
    </label>
  );
}
