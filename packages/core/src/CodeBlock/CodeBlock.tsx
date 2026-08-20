import * as stylex from '@stylexjs/stylex';
import type {HTMLAttributes} from 'react';

import {semanticTokens} from '../authoring.stylex.js';
import {scrolling} from '../scrolling/index.js';
import {useClipboard} from '../hooks/useClipboard.js';
import {Button} from '../Button/index.js';

// The gutter the copy control needs. It is not the control's height — the
// control is a Button carrying a word, and the word changes: "Copy" becomes
// "Copied" the moment it is pressed, and a translation may be longer than
// both. Measuring it as one small square left a long line running under the
// button, which is what a gutter exists to prevent. Six steps of the outer
// scale clears the longer label at either density with room to spare, and it
// is still written as a relationship rather than as a pixel count.
const copyGutter = `calc(3 * ${semanticTokens.spacing2xl})`;

const styles = stylex.create({
  // The well sinks below the surface it sits on, so it needs no border of
  // its own: the fill already draws the edge.
  frame: {
    backgroundColor: semanticTokens.colorSurfaceMuted,
    borderRadius: semanticTokens.radiusInner,
    borderStyle: 'none',
    display: 'grid',
    position: 'relative',
  },
  pre: {
    fontFamily: semanticTokens.fontFamilyMono,
    fontSize: semanticTokens.fontSizeSm,
    fontVariantNumeric: 'tabular-nums',
    letterSpacing: semanticTokens.letterSpacingMono,
    lineHeight: semanticTokens.lineHeightBody,
    marginBlock: 0,
    overflowX: 'auto',
    paddingBlock: semanticTokens.spacingMd,
    paddingInlineStart: semanticTokens.spacingMd,
    // The copy control floats over this box, so the source needs a gutter to
    // end in rather than a symmetric padding to run under. Without it a single
    // long line — an install command is always one long line — disappeared
    // beneath the button, and the block read as truncated.
    paddingInlineEnd: copyGutter,
  },
  code: {
    color: semanticTokens.colorText,
    fontFamily: semanticTokens.fontFamilyMono,
    fontSize: semanticTokens.fontSizeSm,
    fontVariantNumeric: 'tabular-nums',
    letterSpacing: semanticTokens.letterSpacingMono,
    lineHeight: semanticTokens.lineHeightBody,
  },
  // A wrapped line has to look like a continuation, not like the next line of
  // source. The hanging indent is what says so: the first line starts at the
  // gutter and every line it wraps onto is set in by one step.
  wrap: {
    overflowWrap: 'anywhere',
    paddingInlineStart: `calc(${semanticTokens.spacingMd} + ${semanticTokens.spacingLg})`,
    textIndent: `calc(-1 * ${semanticTokens.spacingLg})`,
    whiteSpace: 'pre-wrap',
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
  /**
   * Wraps long lines instead of scrolling them. Worth setting whenever a line
   * can outrun the column — an install command or a `<link>` tag always does,
   * and source that leaves the viewport is source a reader copies wrongly.
   */
  readonly wrap?: boolean;
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
  wrap = false,
  ...props
}: CodeBlockProps) {
  const {copied, copy} = useClipboard();

  return (
    <div {...props} {...stylex.props(styles.frame)}>
      <pre {...stylex.props(styles.pre, scrolling.region, wrap && styles.wrap)}>
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
