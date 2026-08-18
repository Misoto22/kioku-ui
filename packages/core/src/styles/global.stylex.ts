import * as stylex from '@stylexjs/stylex';

import {semanticTokens} from '../authoring.stylex.js';

export const globalStyles = stylex.create({
  document: {
    backgroundColor: semanticTokens.colorCanvas,
    color: semanticTokens.colorText,
    fontFamily: semanticTokens.fontFamilyBody,
    fontFeatureSettings: semanticTokens.fontFeatureSettings,
    fontSize: semanticTokens.fontSizeMd,
    letterSpacing: semanticTokens.letterSpacingBody,
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
