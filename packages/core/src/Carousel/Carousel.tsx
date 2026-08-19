import * as stylex from '@stylexjs/stylex';
import {Children, useRef, type HTMLAttributes, type ReactNode} from 'react';

import {semanticTokens} from '../authoring.stylex.js';
import {useInternationalization} from '../i18n/index.js';
import {Icon} from '../Icon/index.js';
import {IconButton} from '../IconButton/index.js';

const styles = stylex.create({
  region: {
    display: 'grid',
    fontFamily: semanticTokens.fontFamilyBody,
    gap: semanticTokens.spacingSm,
  },
  viewport: {
    display: 'flex',
    gap: semanticTokens.spacingMd,
    overflowX: 'auto',
    paddingBlockEnd: semanticTokens.spacingXs,
    scrollSnapType: 'x mandatory',
    // The viewport is a tab stop of its own, so it declares the ring every
    // focusable element in this system declares.
    ':focus-visible': {
      outlineColor: semanticTokens.colorFocus,
      outlineOffset: semanticTokens.focusOffset,
      outlineStyle: semanticTokens.borderStyle,
      outlineWidth: semanticTokens.focusWidth,
    },
  },
  slide: {flexShrink: 0, scrollSnapAlign: 'start'},
  controls: {
    display: 'flex',
    gap: semanticTokens.spacingXs,
    justifyContent: 'flex-end',
  },
});

/**
 * Honours the same reduced-motion contract the stylesheet does: a reader who
 * asked for less motion gets the jump rather than the glide.
 *
 * @internal
 */
function scrollBehavior(): ScrollBehavior {
  return globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    ? 'auto'
    : 'smooth';
}

/** Props for a horizontally scrolling row of slides. */
export interface CarouselProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'aria-label' | 'aria-roledescription' | 'className' | 'role'
> {
  readonly children: ReactNode;
  readonly label: string;
  readonly nextLabel?: string;
  readonly previousLabel?: string;
}

/**
 * Scrolls a row of slides. The viewport itself is focusable and scrollable,
 * so the content stays reachable by keyboard and by touch even if the arrow
 * controls are never used.
 */
export function Carousel({
  children,
  label,
  nextLabel,
  previousLabel,
  ...props
}: CarouselProps) {
  const {messages} = useInternationalization();
  const viewportRef = useRef<HTMLDivElement>(null);

  function scrollBy(direction: 1 | -1) {
    const viewport = viewportRef.current;
    if (viewport) {
      viewport.scrollBy({
        behavior: scrollBehavior(),
        left: direction * viewport.clientWidth,
      });
    }
  }

  return (
    <div
      {...props}
      aria-label={label}
      aria-roledescription="carousel"
      role="group"
      {...stylex.props(styles.region)}
    >
      <div ref={viewportRef} tabIndex={0} {...stylex.props(styles.viewport)}>
        {Children.map(children, (child, index) => (
          <div key={index} {...stylex.props(styles.slide)}>
            {child}
          </div>
        ))}
      </div>
      <div {...stylex.props(styles.controls)}>
        <IconButton
          aria-label={previousLabel ?? messages.carouselPrevious}
          onClick={() => {
            scrollBy(-1);
          }}
          size="sm"
          variant="secondary"
        >
          <Icon>
            <path
              d="m15 6-6 6 6 6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            />
          </Icon>
        </IconButton>
        <IconButton
          aria-label={nextLabel ?? messages.carouselNext}
          onClick={() => {
            scrollBy(1);
          }}
          size="sm"
          variant="secondary"
        >
          <Icon>
            <path
              d="m9 6 6 6-6 6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            />
          </Icon>
        </IconButton>
      </div>
    </div>
  );
}
