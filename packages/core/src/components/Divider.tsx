import * as stylex from '@stylexjs/stylex';
import type {HTMLAttributes} from 'react';

import {semanticTokens} from '../authoring.stylex.js';

const styles = stylex.create({
  base: {
    border: 0,
    borderBlockStartColor: semanticTokens.borderDefault,
    borderBlockStartStyle: semanticTokens.borderStyle,
    borderBlockStartWidth: semanticTokens.borderWidth,
    margin: 0,
  },
});

export type DividerProps = Omit<HTMLAttributes<HTMLHRElement>, 'className'>;

export function Divider(props: DividerProps) {
  return <hr {...props} {...stylex.props(styles.base)} />;
}
