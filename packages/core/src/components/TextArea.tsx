import * as stylex from '@stylexjs/stylex';
import type {ChangeEvent, TextareaHTMLAttributes} from 'react';

import {semanticTokens} from '../authoring.stylex.js';
import {useFieldControl} from './Field.js';

const controlStyles = stylex.create({
  base: {
    backgroundColor: semanticTokens.colorSurface,
    boxSizing: 'border-box',
    borderColor: semanticTokens.borderDefault,
    borderRadius: semanticTokens.radiusElement,
    borderStyle: semanticTokens.borderStyle,
    borderWidth: semanticTokens.borderWidth,
    color: semanticTokens.colorText,
    fontFamily: semanticTokens.fontFamilyBody,
    fontSize: semanticTokens.fontSizeMd,
    lineHeight: semanticTokens.lineHeightBody,
    minHeight: '96px',
    paddingBlock: semanticTokens.spacingXs,
    paddingInline: semanticTokens.spacingSm,
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
  },
  readOnly: {
    backgroundColor: semanticTokens.colorSurfaceMuted,
    color: semanticTokens.colorText,
  },
  invalid: {
    borderColor: semanticTokens.statusDangerText,
    ':focus-visible': {borderColor: semanticTokens.statusDangerText},
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
