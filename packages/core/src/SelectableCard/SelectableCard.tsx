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
    transitionProperty:
      'background-color, background-image, border-color, box-shadow, color',
    transitionTimingFunction: semanticTokens.easingStandard,
  },
  // The wash is laid over the card's fill rather than replacing it: the
  // overlay token is a few per cent of ink, so assigning it to
  // `backgroundColor` drops the surface and shows the canvas through.
  unselected: {
    boxShadow: 'none',
    ':hover:not(:disabled)': {
      backgroundImage: `linear-gradient(${semanticTokens.colorOverlayHover}, ${semanticTokens.colorOverlayHover})`,
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
  // Drawn here, like `CheckboxInput` and `RadioList`. Left native this took
  // the engine's white fill and grey edge, and it was a step smaller than the
  // box `CheckboxInput` draws — two controls asking the same question in the
  // same form at two different sizes.
  control: {
    appearance: 'none',
    backgroundColor: semanticTokens.colorSurfaceMuted,
    blockSize: semanticTokens.spacingLg,
    borderColor: semanticTokens.borderStrong,
    borderRadius: semanticTokens.radiusElement,
    borderStyle: semanticTokens.borderStyle,
    borderWidth: semanticTokens.borderWidth,
    boxSizing: 'border-box',
    display: 'inline-block',
    flexShrink: 0,
    inlineSize: semanticTokens.spacingLg,
    marginBlockStart: semanticTokens.spacingXs,
    position: 'relative',
    ':focus-visible': {
      outlineColor: semanticTokens.colorFocus,
      outlineOffset: semanticTokens.focusOffset,
      outlineStyle: semanticTokens.borderStyle,
      outlineWidth: semanticTokens.focusWidth,
    },
  },
  // One of several is a round well with a filled centre; any number of several
  // is a square well with a tick. Both marks are ink, never a fill behind the
  // whole control.
  controlSingle: {borderRadius: semanticTokens.radiusFull},
  controlCheckedSingle: {
    '::before': {
      backgroundColor: semanticTokens.colorText,
      blockSize: '50%',
      borderRadius: semanticTokens.radiusFull,
      content: '',
      inlineSize: '50%',
      insetBlockStart: '50%',
      insetInlineStart: '50%',
      position: 'absolute',
      transform: 'translate(-50%, -50%)',
    },
  },
  controlCheckedMultiple: {
    '::before': {
      blockSize: '58%',
      borderBlockEndColor: semanticTokens.colorText,
      borderBlockEndStyle: semanticTokens.borderStyle,
      borderBlockEndWidth: `calc(2 * ${semanticTokens.borderWidth})`,
      borderInlineEndColor: semanticTokens.colorText,
      borderInlineEndStyle: semanticTokens.borderStyle,
      borderInlineEndWidth: `calc(2 * ${semanticTokens.borderWidth})`,
      content: '',
      inlineSize: '30%',
      insetBlockStart: '50%',
      insetInlineStart: '50%',
      position: 'absolute',
      transform: 'translate(-50%, -58%) rotate(45deg)',
    },
  },
  controlDisabled: {
    backgroundColor: semanticTokens.colorDisabledSurface,
    borderColor: semanticTokens.borderDisabled,
    '::before': {
      backgroundColor: semanticTokens.colorDisabledText,
      borderBlockEndColor: semanticTokens.colorDisabledText,
      borderInlineEndColor: semanticTokens.colorDisabledText,
    },
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: semanticTokens.spacingXs,
  },
  // Three ranks inside one card: the title is what the card is, so it takes
  // the first rank at rest and gains weight when chosen; the description is
  // what supports it, so it stays at the second. Holding the title at the
  // description's rank until selection flattens the card into one grey block.
  title: {
    color: semanticTokens.colorText,
    fontFamily: semanticTokens.fontFamilyBody,
    fontSize: semanticTokens.fontSizeMd,
    fontWeight: semanticTokens.fontWeightRegular,
    letterSpacing: semanticTokens.letterSpacingBody,
    lineHeight: semanticTokens.lineHeightBody,
  },
  titleSelected: {fontWeight: semanticTokens.fontWeightMedium},
  titleDisabled: {color: semanticTokens.colorDisabledText},
  description: {
    color: semanticTokens.colorTextSecondary,
    fontFamily: semanticTokens.fontFamilyBody,
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
        {...stylex.props(
          styles.control,
          !multiple && styles.controlSingle,
          isChecked &&
            (multiple
              ? styles.controlCheckedMultiple
              : styles.controlCheckedSingle),
          disabled && styles.controlDisabled,
        )}
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
