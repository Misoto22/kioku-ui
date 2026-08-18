import * as stylex from '@stylexjs/stylex';
import type {FormHTMLAttributes, ReactNode} from 'react';

import {semanticTokens} from '../authoring.stylex.js';

const styles = stylex.create({
  form: {
    display: 'grid',
    fontFamily: semanticTokens.fontFamilyBody,
    gap: semanticTokens.spacingLg,
  },
  single: {gridTemplateColumns: '1fr'},
  double: {
    gridTemplateColumns: 'repeat(auto-fit, minmax(16rem, 1fr))',
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
