import * as stylex from '@stylexjs/stylex';
import {useState, type ImgHTMLAttributes} from 'react';

import {semanticTokens} from '../authoring.stylex.js';

// A preview is measured in control heights so the ladder stays a ladder:
// one control tall, two, three. The spacing scale bends with density; a
// picture box must not.
const previewMedium = `calc(2 * ${semanticTokens.sizeControlLg})`;
const previewLarge = `calc(3 * ${semanticTokens.sizeControlLg})`;

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
  md: {height: previewMedium, width: previewMedium},
  lg: {height: previewLarge, width: previewLarge},
  image: {
    display: 'block',
    height: '100%',
    objectFit: 'cover',
    width: '100%',
  },
  fallback: {
    color: semanticTokens.colorTextMuted,
    fontFamily: semanticTokens.fontFamilyBody,
    fontSize: semanticTokens.fontSizeXs,
    letterSpacing: semanticTokens.letterSpacingEyebrow,
    lineHeight: semanticTokens.lineHeightBody,
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
