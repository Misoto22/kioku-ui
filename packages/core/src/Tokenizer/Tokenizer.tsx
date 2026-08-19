import * as stylex from '@stylexjs/stylex';
import {useState, type HTMLAttributes, type KeyboardEvent} from 'react';

import {semanticTokens} from '../authoring.stylex.js';
import {useFieldControl} from '../Field/index.js';
import {Token} from '../Token/index.js';

// Wide enough that a half-typed tag is still readable once tokens wrap.
const draftWidth = `calc(${semanticTokens.spacing2xl} + ${semanticTokens.spacing2xl} + ${semanticTokens.spacing2xl})`;

const styles = stylex.create({
  frame: {
    alignItems: 'center',
    backgroundColor: semanticTokens.colorSurfaceMuted,
    borderColor: semanticTokens.borderStrong,
    borderRadius: semanticTokens.radiusElement,
    borderStyle: semanticTokens.borderStyle,
    borderWidth: semanticTokens.borderWidth,
    display: 'flex',
    flexWrap: 'wrap',
    fontFamily: semanticTokens.fontFamilyBody,
    gap: semanticTokens.spacingXs,
    minHeight: semanticTokens.sizeControlMd,
    padding: semanticTokens.spacingXs,
    transitionDuration: semanticTokens.durationFast,
    transitionProperty: 'border-color',
    transitionTimingFunction: semanticTokens.easingStandard,
    ':focus-within': {borderColor: semanticTokens.borderInteractive},
    ':hover': {borderColor: semanticTokens.borderInteractive},
  },
  input: {
    backgroundColor: 'transparent',
    borderStyle: 'none',
    borderWidth: 0,
    color: semanticTokens.colorText,
    flexGrow: 1,
    fontFamily: semanticTokens.fontFamilyBody,
    fontSize: semanticTokens.fontSizeMd,
    letterSpacing: semanticTokens.letterSpacingBody,
    lineHeight: semanticTokens.lineHeightBody,
    minWidth: draftWidth,
    paddingBlock: semanticTokens.spacingXs,
    paddingInline: semanticTokens.spacingXs,
    '::placeholder': {color: semanticTokens.colorTextMuted},
    ':focus-visible': {
      outlineColor: semanticTokens.colorFocus,
      outlineOffset: semanticTokens.focusOffset,
      outlineStyle: semanticTokens.borderStyle,
      outlineWidth: semanticTokens.focusWidth,
    },
  },
});

/** Props for free-text entry that turns into discrete tokens. */
export interface TokenizerProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'children' | 'className' | 'defaultValue' | 'onChange'
> {
  readonly label: string;
  readonly onValueChange: (values: readonly string[]) => void;
  readonly placeholder?: string;
  readonly removeLabel?: (value: string) => string;
  readonly value: readonly string[];
}

/**
 * Turns typed text into discrete tokens on Enter or comma. Backspace on an
 * empty field removes the last token, which is what a reader expects from
 * every other tag field they have used.
 */
export function Tokenizer({
  label,
  onValueChange,
  placeholder,
  removeLabel = (value) => `Remove ${value}`,
  value,
  ...props
}: TokenizerProps) {
  const field = useFieldControl();
  const [draft, setDraft] = useState('');

  function commit() {
    const entry = draft.trim();
    if (entry === '' || value.includes(entry)) {
      setDraft('');
      return;
    }
    onValueChange([...value, entry]);
    setDraft('');
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      commit();
      return;
    }
    if (event.key === 'Backspace' && draft === '' && value.length > 0) {
      onValueChange(value.slice(0, -1));
    }
  }

  return (
    <div {...props} {...stylex.props(styles.frame)}>
      {value.map((entry) => (
        <Token
          key={entry}
          onRemove={() => {
            onValueChange(value.filter((candidate) => candidate !== entry));
          }}
          removeLabel={removeLabel(entry)}
        >
          {entry}
        </Token>
      ))}
      <input
        aria-describedby={field?.describedBy}
        aria-label={label}
        id={field?.controlId}
        onBlur={commit}
        onChange={(event) => {
          setDraft(event.currentTarget.value);
        }}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        value={draft}
        {...stylex.props(styles.input)}
        type="text"
      />
    </div>
  );
}
