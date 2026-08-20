import * as stylex from '@stylexjs/stylex';
import type {ChangeEvent, SelectHTMLAttributes} from 'react';

import {semanticTokens} from '../authoring.stylex.js';
import {useFieldControl} from '../Field/index.js';
import type {SelectorOption} from '../Selector/index.js';

const styles = stylex.create({
  // An input sinks below the card it sits on, and a select is an input: the
  // muted fill and the strong hairline are what put it on the same rung as the
  // text fields it shares a form with. Painted on `colorSurface` it read as a
  // card among wells.
  // The well is the frame, because the mark that says "this opens" is ours
  // now. Left native, a select wore whichever arrow the platform draws — a
  // blue chevron on one, a grey triangle on another — in the corner of a
  // field this system had otherwise drawn to the hairline.
  frame: {
    alignItems: 'stretch',
    backgroundColor: semanticTokens.colorSurfaceMuted,
    borderColor: semanticTokens.borderStrong,
    borderRadius: semanticTokens.radiusElement,
    borderStyle: semanticTokens.borderStyle,
    borderWidth: semanticTokens.borderWidth,
    boxSizing: 'border-box',
    display: 'flex',
    height: semanticTokens.sizeControlMd,
    overflow: 'hidden',
    position: 'relative',
    transitionDuration: semanticTokens.durationFast,
    transitionProperty: 'background-color, border-color',
    transitionTimingFunction: semanticTokens.easingStandard,
    width: '100%',
    ':focus-within': {
      borderColor: semanticTokens.borderInteractive,
      outlineColor: semanticTokens.colorFocus,
      outlineOffset: semanticTokens.focusOffset,
      outlineStyle: semanticTokens.borderStyle,
      outlineWidth: semanticTokens.focusWidth,
    },
    ':hover': {borderColor: semanticTokens.borderInteractive},
  },
  frameDisabled: {
    backgroundColor: semanticTokens.colorDisabledSurface,
    borderColor: semanticTokens.borderDisabled,
    ':hover': {borderColor: semanticTokens.borderDisabled},
  },
  frameInvalid: {
    borderColor: semanticTokens.statusDangerText,
    ':focus-within': {borderColor: semanticTokens.statusDangerText},
    ':hover': {borderColor: semanticTokens.statusDangerText},
  },
  // The chevron: two edges of an empty square stood on a corner, the same way
  // the checkbox draws its tick and the number field its steps. It takes its
  // colour from the palette, which is the whole point of not letting the
  // engine draw it. `aria-hidden`, because the select already announces that
  // it is a select.
  chevron: {
    borderBlockEndColor: semanticTokens.colorTextSecondary,
    borderBlockEndStyle: semanticTokens.borderStyle,
    borderBlockEndWidth: semanticTokens.borderWidth,
    borderInlineEndColor: semanticTokens.colorTextSecondary,
    borderInlineEndStyle: semanticTokens.borderStyle,
    borderInlineEndWidth: semanticTokens.borderWidth,
    blockSize: semanticTokens.spacingSm,
    inlineSize: semanticTokens.spacingSm,
    insetBlockStart: '50%',
    insetInlineEnd: semanticTokens.spacingSm,
    pointerEvents: 'none',
    position: 'absolute',
    transform: 'translateY(-70%) rotate(45deg)',
  },
  chevronDisabled: {
    borderBlockEndColor: semanticTokens.colorDisabledText,
    borderInlineEndColor: semanticTokens.colorDisabledText,
  },
  control: {
    appearance: 'none',
    backgroundColor: 'transparent',
    borderStyle: 'none',
    borderWidth: 0,
    boxSizing: 'border-box',
    color: semanticTokens.colorText,
    cursor: 'pointer',
    fontFamily: semanticTokens.fontFamilyBody,
    fontSize: semanticTokens.fontSizeMd,
    letterSpacing: semanticTokens.letterSpacingBody,
    lineHeight: semanticTokens.lineHeightBody,
    paddingBlock: semanticTokens.spacingXs,
    // Trailing room for the chevron, so the longest option stops short of it.
    paddingInlineEnd: `calc(${semanticTokens.spacingSm} + ${semanticTokens.spacingLg})`,
    paddingInlineStart: semanticTokens.spacingSm,
    width: '100%',
    ':disabled': {color: semanticTokens.colorDisabledText, cursor: 'default'},
    ':focus-visible': {outlineStyle: 'none'},
  },
  invalid: {
    borderColor: semanticTokens.statusDangerText,
    ':focus-visible': {borderColor: semanticTokens.statusDangerText},
    ':hover:not(:disabled)': {borderColor: semanticTokens.statusDangerText},
  },
});

/** A named group of related options. */
export interface SelectorGroup {
  readonly disabled?: boolean;
  readonly label: string;
  readonly options: readonly SelectorOption[];
}

type SharedComplexSelectorProps = Omit<
  SelectHTMLAttributes<HTMLSelectElement>,
  'children' | 'className' | 'defaultValue' | 'onChange' | 'value'
> & {
  readonly groups: readonly SelectorGroup[];
  readonly onValueChange?: (value: string) => void;
  readonly placeholder?: string;
};

type ControlledComplexSelectorProps = SharedComplexSelectorProps & {
  readonly defaultValue?: never;
  readonly onValueChange: (value: string) => void;
  readonly value: string;
};

type UncontrolledComplexSelectorProps = SharedComplexSelectorProps & {
  readonly defaultValue?: string;
  readonly value?: never;
};

/** Props for choosing one option from grouped lists. */
export type ComplexSelectorProps =
  ControlledComplexSelectorProps | UncontrolledComplexSelectorProps;

/**
 * Chooses one option from grouped lists. Groups become native `optgroup`
 * elements, so a screen reader announces which group an option belongs to.
 */
export function ComplexSelector({
  'aria-describedby': ariaDescribedBy,
  'aria-invalid': ariaInvalid,
  disabled,
  groups,
  id,
  onValueChange,
  placeholder,
  required,
  ...props
}: ComplexSelectorProps) {
  const field = useFieldControl();
  const describedBy =
    [field?.describedBy, ariaDescribedBy].filter(Boolean).join(' ') ||
    undefined;
  const resolvedInvalid = ariaInvalid ?? field?.invalid;
  const invalid =
    resolvedInvalid !== undefined &&
    resolvedInvalid !== false &&
    resolvedInvalid !== 'false';

  function handleChange(event: ChangeEvent<HTMLSelectElement>) {
    onValueChange?.(event.currentTarget.value);
  }

  return (
    <span
      {...stylex.props(
        styles.frame,
        invalid && !disabled ? styles.frameInvalid : undefined,
        disabled ? styles.frameDisabled : undefined,
      )}
    >
      <select
        {...props}
        aria-describedby={describedBy}
        aria-invalid={resolvedInvalid}
        disabled={disabled}
        id={field?.controlId ?? id}
        onChange={handleChange}
        required={required ?? field?.required}
        {...stylex.props(styles.control)}
      >
        {placeholder === undefined ? null : (
          <option disabled value="">
            {placeholder}
          </option>
        )}
        {groups.map((group) => (
          <optgroup
            disabled={group.disabled ?? false}
            key={group.label}
            label={group.label}
          >
            {group.options.map((option) => (
              <option
                disabled={option.disabled ?? false}
                key={option.value}
                value={option.value}
              >
                {option.label}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
      <span
        aria-hidden="true"
        {...stylex.props(
          styles.chevron,
          disabled ? styles.chevronDisabled : undefined,
        )}
      />
    </span>
  );
}
