import * as stylex from '@stylexjs/stylex';
import {createElement, type HTMLAttributes} from 'react';

import {semanticTokens} from '../authoring.stylex.js';

const styles = stylex.create({
  base: {
    color: semanticTokens.colorText,
    fontFamily: semanticTokens.fontFamilyHeading,
    fontWeight: semanticTokens.fontWeightStrong,
    lineHeight: semanticTokens.lineHeightHeading,
    margin: 0,
  },
  page: {fontSize: semanticTokens.fontSizeXl},
  section: {fontSize: semanticTokens.fontSizeLg},
  subsection: {fontSize: semanticTokens.fontSizeMd},
});

type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

export interface HeadingProps extends Omit<
  HTMLAttributes<HTMLHeadingElement>,
  'className'
> {
  readonly level: HeadingLevel;
  readonly size?: 'page' | 'section' | 'subsection';
}

export function Heading({
  children,
  level,
  size = 'section',
  ...props
}: HeadingProps) {
  return createElement(
    `h${level}`,
    {...props, ...stylex.props(styles.base, styles[size])},
    children,
  );
}
