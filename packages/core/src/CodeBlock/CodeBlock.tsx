import * as stylex from '@stylexjs/stylex';
import type {HTMLAttributes} from 'react';

import {semanticTokens} from '../authoring.stylex.js';
import {useClipboard} from '../hooks/useClipboard.js';
import {Button} from '../Button/index.js';

const styles = stylex.create({
  frame: {
    backgroundColor: semanticTokens.colorSurfaceMuted,
    borderColor: semanticTokens.borderDefault,
    borderRadius: semanticTokens.radiusContainer,
    borderStyle: semanticTokens.borderStyle,
    borderWidth: semanticTokens.borderWidth,
    display: 'grid',
    position: 'relative',
  },
  pre: {
    marginBlock: 0,
    overflowX: 'auto',
    padding: semanticTokens.spacingMd,
  },
  code: {
    color: semanticTokens.colorText,
    fontFamily: semanticTokens.fontFamilyMono,
    fontSize: semanticTokens.fontSizeSm,
    lineHeight: semanticTokens.lineHeightBody,
  },
  copy: {
    insetBlockStart: semanticTokens.spacingXs,
    insetInlineEnd: semanticTokens.spacingXs,
    position: 'absolute',
  },
});

/** Props for a block of preformatted source. */
export interface CodeBlockProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'children' | 'className'
> {
  readonly code: string;
  readonly copiedLabel?: string;
  readonly copyLabel?: string;
  readonly language?: string;
}

/**
 * Shows a block of source. The copy control reports its own result, so a
 * reader knows the copy happened without watching the clipboard.
 */
export function CodeBlock({
  code,
  copiedLabel = 'Copied',
  copyLabel = 'Copy',
  language,
  ...props
}: CodeBlockProps) {
  const {copied, copy} = useClipboard();

  return (
    <div {...props} {...stylex.props(styles.frame)}>
      <pre {...stylex.props(styles.pre)}>
        <code
          {...(language === undefined ? {} : {'data-language': language})}
          {...stylex.props(styles.code)}
        >
          {code}
        </code>
      </pre>
      <span {...stylex.props(styles.copy)}>
        <Button
          onClick={() => {
            void copy(code);
          }}
          size="sm"
          variant="secondary"
        >
          {copied ? copiedLabel : copyLabel}
        </Button>
      </span>
    </div>
  );
}
