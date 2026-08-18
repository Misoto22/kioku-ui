import * as stylex from '@stylexjs/stylex';
import type {BlockquoteHTMLAttributes, ReactNode} from 'react';

import {semanticTokens} from '../authoring.stylex.js';

const styles = stylex.create({
  quote: {
    borderInlineStartColor: semanticTokens.borderStrong,
    borderInlineStartStyle: semanticTokens.borderStyle,
    borderInlineStartWidth: semanticTokens.focusWidth,
    color: semanticTokens.colorText,
    display: 'flex',
    flexDirection: 'column',
    fontFamily: semanticTokens.fontFamilyBody,
    fontSize: semanticTokens.fontSizeMd,
    gap: semanticTokens.spacingSm,
    lineHeight: semanticTokens.lineHeightBody,
    marginBlock: 0,
    marginInline: 0,
    paddingInlineStart: semanticTokens.spacingMd,
  },
  attribution: {
    color: semanticTokens.colorTextSecondary,
    fontSize: semanticTokens.fontSizeSm,
  },
});

/** Props for quoted text and its source. */
export interface BlockquoteProps extends Omit<
  BlockquoteHTMLAttributes<HTMLQuoteElement>,
  'children' | 'className'
> {
  readonly attribution?: ReactNode;
  readonly children: ReactNode;
}

/**
 * Sets off quoted text. The attribution is emitted inside the quote as a
 * `footer`, which is where the HTML spec puts the source of a quotation.
 */
export function Blockquote({attribution, children, ...props}: BlockquoteProps) {
  return (
    <blockquote {...props} {...stylex.props(styles.quote)}>
      {children}
      {attribution === undefined ? null : (
        <footer {...stylex.props(styles.attribution)}>{attribution}</footer>
      )}
    </blockquote>
  );
}
