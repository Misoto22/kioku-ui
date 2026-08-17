import * as stylex from '@stylexjs/stylex';

import {semanticTokens} from '../tokens/semantic.stylex.js';

export const globalStyles = stylex.create({
  document: {
    backgroundColor: semanticTokens.colorCanvas,
    color: semanticTokens.colorText,
    fontFamily: semanticTokens.fontFamilyBody,
    fontSize: semanticTokens.fontSizeMd,
    fontWeight: semanticTokens.fontWeightRegular,
    lineHeight: semanticTokens.lineHeightBody,
  },
  focusRing: {
    ':focus-visible': {
      outlineColor: semanticTokens.colorFocus,
      outlineOffset: semanticTokens.focusOffset,
      outlineStyle: semanticTokens.borderStyle,
      outlineWidth: semanticTokens.focusWidth,
    },
  },
});
