import * as stylex from '@stylexjs/stylex';
import type {FormHTMLAttributes, ReactNode} from 'react';

import {semanticTokens} from '../authoring.stylex.js';

// The narrowest a labelled field stays readable at before two columns should
// collapse into one. The spacing scale has no single step that measures it.
const columnMinimumWidth = `calc(${semanticTokens.spacing2xl} * 8)`;

const styles = stylex.create({
  form: {
    // Fields sit a medium step apart down the page and a large one across it,
    // so a two-column form reads as columns rather than as a mesh.
    columnGap: semanticTokens.spacingLg,
    display: 'grid',
    fontFamily: semanticTokens.fontFamilyBody,
    rowGap: semanticTokens.spacingMd,
  },
  single: {gridTemplateColumns: '1fr'},
  double: {
    gridTemplateColumns: `repeat(auto-fit, minmax(min(100%, ${columnMinimumWidth}), 1fr))`,
  },
  actions: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: semanticTokens.spacingSm,
    gridColumn: '1 / -1',
    justifyContent: 'flex-end',
  },
});

/** Column counts a form can lay its fields out in. */
export type FormColumns = 1 | 2;

/** Props for the grid that arranges fields and their actions. */
export interface FormLayoutProps extends Omit<
  FormHTMLAttributes<HTMLFormElement>,
  'children' | 'className'
> {
  readonly actions?: ReactNode;
  readonly children: ReactNode;
  readonly columns?: FormColumns;
}

/**
 * Arranges fields and their submit actions. Two columns collapse to one when
 * the container is narrow, so a form never forces sideways scrolling.
 */
export function FormLayout({
  actions,
  children,
  columns = 1,
  ...props
}: FormLayoutProps) {
  return (
    <form
      {...props}
      {...stylex.props(
        styles.form,
        columns === 1 ? styles.single : styles.double,
      )}
    >
      {children}
      {actions === undefined ? null : (
        <div {...stylex.props(styles.actions)}>{actions}</div>
      )}
    </form>
  );
}
