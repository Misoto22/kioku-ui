import * as stylex from '@stylexjs/stylex';
import type {ChangeEvent, TextareaHTMLAttributes} from 'react';

import {semanticTokens} from '../authoring.stylex.js';
import {useFieldControl} from '../Field/index.js';

// Four lines of body copy plus the control's own block padding. Written as the
// relationship rather than as a length, so the field still opens on four lines
// when density or type size moves under it.
const minimumHeight = `calc(4 * ${semanticTokens.fontSizeMd} * ${semanticTokens.lineHeightBody} + 2 * ${semanticTokens.spacingXs})`;

const controlStyles = stylex.create({
  base: {
    backgroundColor: semanticTokens.colorSurfaceMuted,
    boxSizing: 'border-box',
    borderColor: semanticTokens.borderStrong,
    borderRadius: semanticTokens.radiusElement,
    borderStyle: semanticTokens.borderStyle,
    borderWidth: semanticTokens.borderWidth,
    color: semanticTokens.colorText,
    fontFamily: semanticTokens.fontFamilyBody,
    fontSize: semanticTokens.fontSizeMd,
    letterSpacing: semanticTokens.letterSpacingBody,
    lineHeight: semanticTokens.lineHeightBody,
    minHeight: minimumHeight,
    // Vertical only. The UA default lets a reader drag the field wider than
    // the column it sits in, taking the form's layout with it; height is the
    // axis they actually want.
    resize: 'vertical',
    paddingBlock: semanticTokens.spacingXs,
    paddingInline: semanticTokens.spacingSm,
    // The three longhands every other well in the system declares, so an edge
    // that changes on hover or focus moves at the same speed as the ones
    // beside it instead of snapping.
    transitionDuration: semanticTokens.durationFast,
    transitionProperty: 'background-color, border-color, color',
    transitionTimingFunction: semanticTokens.easingStandard,
    '::placeholder': {color: semanticTokens.colorTextMuted},
    ':disabled': {
      backgroundColor: semanticTokens.colorDisabledSurface,
      borderColor: semanticTokens.borderDisabled,
      color: semanticTokens.colorDisabledText,
    },
    ':focus-visible': {
      borderColor: semanticTokens.borderInteractive,
      outlineColor: semanticTokens.colorFocus,
      outlineOffset: semanticTokens.focusOffset,
      outlineStyle: semanticTokens.borderStyle,
      outlineWidth: semanticTokens.focusWidth,
    },
    ':active:not(:disabled):not(:read-only):not(:focus-visible)': {
      borderColor: semanticTokens.colorAccentActive,
    },
    ':hover:not(:disabled):not(:read-only):not(:focus-visible)': {
      borderColor: semanticTokens.borderInteractive,
    },
  },
  readOnly: {
    backgroundColor: semanticTokens.colorSurface,
    borderColor: semanticTokens.borderDefault,
    color: semanticTokens.colorText,
  },
  invalid: {
    borderColor: semanticTokens.statusDangerText,
    ':focus-visible': {borderColor: semanticTokens.statusDangerText},
    ':active:not(:disabled):not(:read-only):not(:focus-visible)': {
      borderColor: semanticTokens.statusDangerText,
    },
    ':hover:not(:disabled):not(:read-only):not(:focus-visible)': {
      borderColor: semanticTokens.statusDangerText,
    },
  },
});

type SharedTextAreaProps = Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  'children' | 'className' | 'defaultValue' | 'onChange' | 'value'
> & {
  readonly onValueChange?: (value: string) => void;
};

type ControlledTextAreaProps = SharedTextAreaProps & {
  readonly defaultValue?: never;
  readonly onValueChange: (value: string) => void;
  readonly value: string;
};

type UncontrolledTextAreaProps = SharedTextAreaProps & {
  readonly defaultValue?: string;
  readonly value?: never;
};

export type TextAreaProps = ControlledTextAreaProps | UncontrolledTextAreaProps;

export function TextArea({
  'aria-describedby': ariaDescribedBy,
  'aria-invalid': ariaInvalid,
  disabled,
  id,
  onValueChange,
  readOnly,
  required,
  ...props
}: TextAreaProps) {
  const field = useFieldControl();
  const describedBy =
    [field?.describedBy, ariaDescribedBy].filter(Boolean).join(' ') ||
    undefined;
  const resolvedInvalid = ariaInvalid ?? field?.invalid;
  const isInvalid =
    resolvedInvalid !== undefined &&
    resolvedInvalid !== false &&
    resolvedInvalid !== 'false';

  function handleChange(event: ChangeEvent<HTMLTextAreaElement>) {
    onValueChange?.(event.currentTarget.value);
  }

  return (
    <textarea
      {...props}
      aria-describedby={describedBy}
      aria-invalid={resolvedInvalid}
      disabled={disabled}
      id={field?.controlId ?? id}
      onChange={handleChange}
      readOnly={readOnly}
      required={required ?? field?.required}
      {...stylex.props(
        controlStyles.base,
        readOnly && !disabled ? controlStyles.readOnly : undefined,
        isInvalid && !disabled ? controlStyles.invalid : undefined,
      )}
    />
  );
}
