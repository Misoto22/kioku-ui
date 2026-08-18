import * as stylex from '@stylexjs/stylex';
import {useState, type ChangeEvent, type InputHTMLAttributes} from 'react';

import {semanticTokens} from '../authoring.stylex.js';
import {useInternationalization} from '../i18n/index.js';
import {useFieldControl} from '../Field/index.js';

const styles = stylex.create({
  control: {
    backgroundColor: semanticTokens.colorSurface,
    borderColor: semanticTokens.borderDefault,
    borderRadius: semanticTokens.radiusElement,
    borderStyle: 'dashed',
    borderWidth: semanticTokens.borderWidth,
    boxSizing: 'border-box',
    color: semanticTokens.colorText,
    display: 'block',
    fontFamily: semanticTokens.fontFamilyBody,
    fontSize: semanticTokens.fontSizeSm,
    padding: semanticTokens.spacingSm,
    width: '100%',
    ':disabled': {
      backgroundColor: semanticTokens.colorDisabledSurface,
      borderColor: semanticTokens.borderDisabled,
      color: semanticTokens.colorDisabledText,
    },
    ':focus-visible': {
      outlineColor: semanticTokens.colorFocus,
      outlineOffset: semanticTokens.focusOffset,
      outlineStyle: semanticTokens.borderStyle,
      outlineWidth: semanticTokens.focusWidth,
    },
    ':hover:not(:disabled)': {borderColor: semanticTokens.borderInteractive},
  },
  summary: {
    color: semanticTokens.colorTextSecondary,
    fontFamily: semanticTokens.fontFamilyBody,
    fontSize: semanticTokens.fontSizeSm,
    marginBlock: semanticTokens.spacingXs,
  },
});

/** Props for choosing one or more files. */
export interface FileInputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'children' | 'className' | 'onChange' | 'type' | 'value'
> {
  readonly onFilesChange?: (files: readonly File[]) => void;
}

/**
 * Chooses files through the native picker and names the current selection in
 * text, because the file list itself is not announced by the control alone.
 */
export function FileInput({
  id,
  multiple,
  onFilesChange,
  required,
  ...props
}: FileInputProps) {
  const field = useFieldControl();
  const {messages} = useInternationalization();
  const [names, setNames] = useState<readonly string[]>([]);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const files = [...(event.currentTarget.files ?? [])];
    setNames(files.map((file) => file.name));
    onFilesChange?.(files);
  }

  return (
    <>
      <input
        {...props}
        aria-describedby={field?.describedBy}
        id={field?.controlId ?? id}
        multiple={multiple}
        onChange={handleChange}
        required={required ?? field?.required}
        type="file"
        {...stylex.props(styles.control)}
      />
      <p aria-live="polite" {...stylex.props(styles.summary)}>
        {names.length === 0 ? messages.fileInputEmpty : names.join(', ')}
      </p>
    </>
  );
}
