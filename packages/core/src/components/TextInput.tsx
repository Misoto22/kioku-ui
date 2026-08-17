import * as stylex from '@stylexjs/stylex';
import type {ChangeEvent, InputHTMLAttributes} from 'react';

import {semanticTokens} from '../authoring.stylex.js';
import {useFieldControl} from './Field.js';

const styles = stylex.create({
  base: {
    backgroundColor: semanticTokens.colorSurface,
    borderColor: semanticTokens.borderDefault,
    borderRadius: semanticTokens.radiusElement,
    borderStyle: semanticTokens.borderStyle,
    borderWidth: semanticTokens.borderWidth,
    color: semanticTokens.colorText,
    fontFamily: semanticTokens.fontFamilyBody,
    fontSize: semanticTokens.fontSizeMd,
    minHeight: semanticTokens.sizeControlMd,
    paddingBlock: semanticTokens.spacingXs,
    paddingInline: semanticTokens.spacingSm,
  },
});

type SharedTextInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'children' | 'className' | 'defaultValue' | 'onChange' | 'value'
> & {
  readonly onValueChange?: (value: string) => void;
};

type ControlledTextInputProps = SharedTextInputProps & {
  readonly defaultValue?: never;
  readonly onValueChange: (value: string) => void;
  readonly value: string;
};

type UncontrolledTextInputProps = SharedTextInputProps & {
  readonly defaultValue?: string;
  readonly value?: never;
};

export type TextInputProps =
  ControlledTextInputProps | UncontrolledTextInputProps;

export function TextInput({
  'aria-describedby': ariaDescribedBy,
  'aria-invalid': ariaInvalid,
  id,
  onValueChange,
  type = 'text',
  ...props
}: TextInputProps) {
  const field = useFieldControl();
  const describedBy =
    [field?.describedBy, ariaDescribedBy].filter(Boolean).join(' ') ||
    undefined;

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    onValueChange?.(event.currentTarget.value);
  }

  return (
    <input
      {...props}
      aria-describedby={describedBy}
      aria-invalid={ariaInvalid ?? field?.invalid}
      id={field?.controlId ?? id}
      onChange={handleChange}
      {...stylex.props(styles.base)}
      type={type}
    />
  );
}
