import * as stylex from '@stylexjs/stylex';
import {useState, type HTMLAttributes} from 'react';

import {semanticTokens} from '../authoring.stylex.js';

const styles = stylex.create({
  avatar: {
    alignItems: 'center',
    backgroundColor: semanticTokens.colorSurfaceMuted,
    borderRadius: semanticTokens.radiusFull,
    color: semanticTokens.colorTextSecondary,
    display: 'inline-flex',
    flexShrink: 0,
    fontFamily: semanticTokens.fontFamilyBody,
    fontWeight: semanticTokens.fontWeightMedium,
    justifyContent: 'center',
    overflow: 'hidden',
    userSelect: 'none',
  },
  sm: {
    fontSize: semanticTokens.fontSizeXs,
    height: semanticTokens.sizeControlSm,
    width: semanticTokens.sizeControlSm,
  },
  md: {
    fontSize: semanticTokens.fontSizeSm,
    height: semanticTokens.sizeControlMd,
    width: semanticTokens.sizeControlMd,
  },
  lg: {
    fontSize: semanticTokens.fontSizeMd,
    height: semanticTokens.sizeControlLg,
    width: semanticTokens.sizeControlLg,
  },
  image: {height: '100%', objectFit: 'cover', width: '100%'},
});

/** Sizes an avatar can occupy, aligned to the control scale. */
export type AvatarSize = 'sm' | 'md' | 'lg';

/** Props for a person or entity's likeness. */
export interface AvatarProps extends Omit<
  HTMLAttributes<HTMLSpanElement>,
  'children' | 'className'
> {
  readonly name: string;
  readonly size?: AvatarSize;
  readonly src?: string;
}

// Initials fall back to the first letters of the first and last word.
function initials(name: string) {
  const words = name.trim().split(/\s+/u).filter(Boolean);
  if (words.length === 0) {
    return '';
  }
  const first = words[0]?.[0] ?? '';
  const last = words.length > 1 ? (words[words.length - 1]?.[0] ?? '') : '';
  return (first + last).toUpperCase();
}

/**
 * Shows one person or entity. The name is the accessible label whether an
 * image loads or not, so a broken image never leaves an unnamed circle.
 */
export function Avatar({name, size = 'md', src, ...props}: AvatarProps) {
  const [failed, setFailed] = useState(false);
  const showImage = src !== undefined && !failed;

  return (
    <span
      {...props}
      aria-label={name}
      role="img"
      {...stylex.props(styles.avatar, styles[size])}
    >
      {showImage ? (
        <img
          alt=""
          onError={() => {
            setFailed(true);
          }}
          src={src}
          {...stylex.props(styles.image)}
        />
      ) : (
        <span aria-hidden="true">{initials(name)}</span>
      )}
    </span>
  );
}
