import * as stylex from '@stylexjs/stylex';
import type {ChangeEvent, TextareaHTMLAttributes} from 'react';

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
    lineHeight: semanticTokens.lineHeightBody,
    minHeight: semanticTokens.sizeControlMd,
    paddingBlock: semanticTokens.spacingSm,
    paddingInline: semanticTokens.spacingSm,
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
  id,
  onValueChange,
  ...props
}: TextAreaProps) {
  const field = useFieldControl();
  const describedBy =
    [field?.describedBy, ariaDescribedBy].filter(Boolean).join(' ') ||
    undefined;

  function handleChange(event: ChangeEvent<HTMLTextAreaElement>) {
    onValueChange?.(event.currentTarget.value);
  }

  return (
    <textarea
      {...props}
      aria-describedby={describedBy}
      aria-invalid={ariaInvalid ?? field?.invalid}
      id={field?.controlId ?? id}
      onChange={handleChange}
      {...stylex.props(styles.base)}
    />
  );
}
