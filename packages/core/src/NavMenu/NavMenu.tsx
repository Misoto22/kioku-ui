import * as stylex from '@stylexjs/stylex';
import {Children, type HTMLAttributes, type ReactNode} from 'react';

import {semanticTokens} from '../authoring.stylex.js';
import {
  NavMenuOrientationProvider,
  type NavMenuOrientation,
} from './orientation.js';

const styles = stylex.create({
  list: {
    display: 'flex',
    fontFamily: semanticTokens.fontFamilyBody,
    listStyleType: 'none',
    marginBlock: 0,
    marginInline: 0,
    paddingInlineStart: 0,
  },
  horizontal: {
    alignItems: 'center',
    columnGap: semanticTokens.spacingXs,
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: semanticTokens.spacingXs,
  },
  // Rows stretch so every selection mark starts at the same inline edge, and
  // they tile one hairline apart: the mark, not a gutter, separates them.
  vertical: {
    alignItems: 'stretch',
    flexDirection: 'column',
    rowGap: semanticTokens.borderWidth,
  },
});

/** Props for a named group of navigation destinations. */
export interface NavMenuProps extends Omit<
  HTMLAttributes<HTMLElement>,
  'children' | 'className'
> {
  readonly children: ReactNode;
  readonly label: string;
  readonly orientation?: NavMenuOrientation;
}

/**
 * Groups destinations into a named navigation landmark. Each child becomes a
 * list item, so assistive technology can announce how many destinations exist.
 */
export function NavMenu({
  children,
  label,
  orientation = 'vertical',
  ...props
}: NavMenuProps) {
  return (
    <nav {...props} aria-label={label}>
      {/* Each item draws its own mark, and where that mark belongs is a fact
          about the menu rather than about the item. */}
      <NavMenuOrientationProvider value={orientation}>
        <ul {...stylex.props(styles.list, styles[orientation])}>
          {Children.map(children, (child, index) => (
            <li key={index}>{child}</li>
          ))}
        </ul>
      </NavMenuOrientationProvider>
    </nav>
  );
}
