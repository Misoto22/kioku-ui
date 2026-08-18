import * as stylex from '@stylexjs/stylex';
import type {TimeHTMLAttributes} from 'react';

import {semanticTokens} from '../authoring.stylex.js';

const styles = stylex.create({
  time: {
    color: semanticTokens.colorTextSecondary,
    fontFamily: semanticTokens.fontFamilyBody,
    fontSize: semanticTokens.fontSizeSm,
    lineHeight: semanticTokens.lineHeightBody,
  },
});

/** Props for a machine-readable point in time. */
export interface TimestampProps extends Omit<
  TimeHTMLAttributes<HTMLTimeElement>,
  'children' | 'className' | 'dateTime'
> {
  readonly format?: (value: Date) => string;
  readonly value: Date | string;
}

const defaultFormat = (value: Date) =>
  value.toLocaleString(undefined, {dateStyle: 'medium', timeStyle: 'short'});

/**
 * Shows a point in time with its machine-readable value attached, so the date
 * a reader sees and the one a parser reads cannot drift apart.
 */
export function Timestamp({
  format = defaultFormat,
  value,
  ...props
}: TimestampProps) {
  const date = typeof value === 'string' ? new Date(value) : value;
  const valid = !Number.isNaN(date.getTime());

  return (
    <time
      {...props}
      {...(valid ? {dateTime: date.toISOString()} : {})}
      {...stylex.props(styles.time)}
    >
      {valid ? format(date) : String(value)}
    </time>
  );
}
