import * as stylex from '@stylexjs/stylex';
import type {HTMLAttributes, ReactNode} from 'react';

import {semanticTokens} from '../authoring.stylex.js';

const styles = stylex.create({
  rail: {
    backgroundColor: semanticTokens.colorSurface,
    borderInlineEndColor: semanticTokens.borderDefault,
    borderInlineEndStyle: semanticTokens.borderStyle,
    borderInlineEndWidth: semanticTokens.borderWidth,
    display: 'flex',
    flexDirection: 'column',
    fontFamily: semanticTokens.fontFamilyBody,
    gap: semanticTokens.spacingLg,
    padding: semanticTokens.spacingMd,
    width: '16rem',
  },
  heading: {
    color: semanticTokens.colorTextMuted,
    fontSize: semanticTokens.fontSizeXs,
    fontWeight: semanticTokens.fontWeightMedium,
    letterSpacing: '0.06em',
    margin: 0,
    paddingInline: semanticTokens.spacingSm,
    textTransform: 'uppercase',
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: semanticTokens.spacingXs,
  },
  footer: {marginBlockStart: 'auto'},
});

/** Props for the vertical navigation rail. */
export interface SideNavProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'children' | 'className'
> {
  readonly children: ReactNode;
  readonly footer?: ReactNode;
}

/** Holds persistent navigation beside the main content. */
export function SideNav({children, footer, ...props}: SideNavProps) {
  return (
    <div {...props} {...stylex.props(styles.rail)}>
      {children}
      {footer === undefined ? null : (
        <div {...stylex.props(styles.footer)}>{footer}</div>
      )}
    </div>
  );
}

/** Props for one titled group inside a `SideNav`. */
export interface SideNavSectionProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'children' | 'className' | 'title'
> {
  readonly children: ReactNode;
  readonly title?: ReactNode;
}

/** Groups related destinations under an optional heading. */
export function SideNavSection({
  children,
  title,
  ...props
}: SideNavSectionProps) {
  return (
    <div {...props} {...stylex.props(styles.section)}>
      {title === undefined ? null : (
        <p {...stylex.props(styles.heading)}>{title}</p>
      )}
      {children}
    </div>
  );
}
