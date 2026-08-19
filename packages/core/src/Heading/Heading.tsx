import * as stylex from '@stylexjs/stylex';
import {createElement, type HTMLAttributes} from 'react';

import {semanticTokens} from '../authoring.stylex.js';

const styles = stylex.create({
  // Medium, not strong. A heading on this paper is separated from the copy by
  // size, tracking and the face it is cut in; adding weight on top of all
  // three makes it shout, and the display face has no bold worth synthesising
  // anyway. Every title in the console is set at the medium weight.
  base: {
    color: semanticTokens.colorText,
    fontFamily: semanticTokens.fontFamilyHeading,
    fontWeight: semanticTokens.fontWeightMedium,
    lineHeight: semanticTokens.lineHeightHeading,
    margin: 0,
  },
  page: {
    fontSize: semanticTokens.fontSize2xl,
    letterSpacing: semanticTokens.letterSpacingTitle,
  },
  section: {
    fontSize: semanticTokens.fontSizeXl,
    letterSpacing: semanticTokens.letterSpacingTitle,
  },
  subsection: {
    fontSize: semanticTokens.fontSizeLg,
    letterSpacing: semanticTokens.letterSpacingHeading,
  },
  interface: {fontFamily: semanticTokens.fontFamilyHeading},
  display: {
    fontFamily: semanticTokens.fontFamilyDisplay,
    fontSynthesis: 'none',
  },
});

type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
export type HeadingFamily = 'interface' | 'display';

export interface HeadingProps extends Omit<
  HTMLAttributes<HTMLHeadingElement>,
  'className'
> {
  readonly family?: HeadingFamily;
  readonly level: HeadingLevel;
  readonly size?: 'page' | 'section' | 'subsection';
}

export function Heading({
  children,
  family = 'interface',
  level,
  size = 'section',
  ...props
}: HeadingProps) {
  return createElement(
    `h${level}`,
    {...props, ...stylex.props(styles.base, styles[size], styles[family])},
    children,
  );
}
