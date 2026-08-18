import * as stylex from '@stylexjs/stylex';
import {useState, type ImgHTMLAttributes} from 'react';

import {semanticTokens} from '../authoring.stylex.js';

const styles = stylex.create({
  frame: {
    alignItems: 'center',
    backgroundColor: semanticTokens.colorSurfaceMuted,
    borderColor: semanticTokens.borderDefault,
    borderRadius: semanticTokens.radiusElement,
    borderStyle: semanticTokens.borderStyle,
    borderWidth: semanticTokens.borderWidth,
    display: 'inline-flex',
    flexShrink: 0,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  sm: {
    height: semanticTokens.sizeControlLg,
    width: semanticTokens.sizeControlLg,
  },
  md: {height: semanticTokens.spacing2xl, width: semanticTokens.spacing2xl},
  lg: {height: '6rem', width: '6rem'},
  image: {height: '100%', objectFit: 'cover', width: '100%'},
  fallback: {
    color: semanticTokens.colorTextMuted,
    fontFamily: semanticTokens.fontFamilyBody,
    fontSize: semanticTokens.fontSizeXs,
    padding: semanticTokens.spacingXs,
    textAlign: 'center',
  },
});

/** Sizes a thumbnail can occupy. */
export type ThumbnailSize = 'sm' | 'md' | 'lg';

/** Props for a small bounded preview image. */
export interface ThumbnailProps extends Omit<
  ImgHTMLAttributes<HTMLImageElement>,
  'children' | 'className' | 'height' | 'width'
> {
  readonly alt: string;
  readonly fallback?: string;
  readonly size?: ThumbnailSize;
  readonly src: string;
}

/**
 * Shows a small bounded preview. A failed image degrades to text rather than
 * a broken-image glyph, because the alternative text is the content.
 */
export function Thumbnail({
  alt,
  fallback,
  size = 'md',
  src,
  ...props
}: ThumbnailProps) {
  const [failed, setFailed] = useState(false);

  return (
    <span {...stylex.props(styles.frame, styles[size])}>
      {failed ? (
        <span {...stylex.props(styles.fallback)}>{fallback ?? alt}</span>
      ) : (
        <img
          {...props}
          alt={alt}
          onError={() => {
            setFailed(true);
          }}
          src={src}
          {...stylex.props(styles.image)}
        />
      )}
    </span>
  );
}
