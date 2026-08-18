import * as stylex from '@stylexjs/stylex';
import {Children, type HTMLAttributes, type ReactNode} from 'react';

import {semanticTokens} from '../authoring.stylex.js';

const styles = stylex.create({
  list: {
    display: 'flex',
    gap: semanticTokens.spacingXs,
    listStyleType: 'none',
    marginBlock: 0,
    paddingInlineStart: 0,
  },
  horizontal: {alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap'},
  vertical: {flexDirection: 'column'},
});

/** Axis a navigation menu lays its destinations along. */
export type NavMenuOrientation = 'horizontal' | 'vertical';

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
      <ul {...stylex.props(styles.list, styles[orientation])}>
        {Children.map(children, (child, index) => (
          <li key={index}>{child}</li>
        ))}
      </ul>
    </nav>
  );
}
