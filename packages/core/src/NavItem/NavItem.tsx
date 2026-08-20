import * as stylex from '@stylexjs/stylex';
import type {AnchorHTMLAttributes, ReactNode} from 'react';

import {semanticTokens} from '../authoring.stylex.js';
import {Link} from '../navigation/index.js';
import {useNavMenuOrientation} from '../NavMenu/orientation.js';

// The mark is two hairlines thick: one weight above the rules that separate
// regions, so it reads as a deliberate stroke rather than another divider.
const markWidth = `calc(2 * ${semanticTokens.borderWidth})`;

// A hovered row is hinted at. A fraction of the row rather than an absolute
// length, so a denser theme keeps the proportion.
const hoverMarkHeight = '40%';

const styles = stylex.create({
  item: {
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderRadius: semanticTokens.radiusElement,
    color: semanticTokens.colorTextSecondary,
    display: 'flex',
    fontFamily: semanticTokens.fontFamilyBody,
    fontSize: semanticTokens.fontSizeMd,
    gap: semanticTokens.spacingSm,
    letterSpacing: semanticTokens.letterSpacingLabel,
    minHeight: semanticTokens.sizeControlMd,
    paddingBlock: semanticTokens.spacingXs,
    // Asymmetric on purpose: the label is set in from the inline-start edge so
    // the mark has an edge of its own to stand on, instead of touching the
    // word it marks. The trailing side only has to clear a count or a chevron.
    paddingInlineEnd: semanticTokens.spacingSm,
    paddingInlineStart: semanticTokens.spacingMd,
    position: 'relative',
    textDecorationLine: 'none',
    transitionDuration: semanticTokens.durationFast,
    transitionProperty: 'color',
    transitionTimingFunction: semanticTokens.easingStandard,
    // The mark. Selection is a bar at the inline-start edge, never a fill
    // behind the row: a filled row competes with the content beside it.
    '::before': {
      content: '',
      insetBlockStart: '50%',
      insetInlineStart: 0,
      position: 'absolute',
      transform: 'translateY(-50%)',
      transitionDuration: `${semanticTokens.durationFast}, ${semanticTokens.durationModerate}`,
      transitionProperty: 'background-color, height',
      transitionTimingFunction: semanticTokens.easingStandard,
      width: markWidth,
    },
    ':focus-visible': {
      outlineColor: semanticTokens.colorFocus,
      outlineOffset: semanticTokens.focusOffset,
      outlineStyle: semanticTokens.borderStyle,
      outlineWidth: semanticTokens.focusWidth,
    },
  },
  interactive: {
    '::before': {
      backgroundColor: semanticTokens.borderStrong,
      height: {default: 0, ':hover': hoverMarkHeight},
    },
    ':hover': {color: semanticTokens.colorText},
  },
  // The current row is claimed by ink alone — no bar, no added weight. A rail
  // is a short column of short words: a stroke beside one of them reads as a
  // second divider, and bolding it makes the one row the reader is already on
  // the heaviest thing on the page. Ink against second-rank ink is enough to
  // find, and it leaves the rail quiet. `aria-current` still carries the fact
  // for anyone who cannot see the difference.
  current: {color: semanticTokens.colorText},
  // The icon gutter is reserved whether or not this row carries a glyph, so a
  // menu mixing marked and unmarked rows keeps one text edge for both.
  // `NavIcon` has promised exactly this in its own doc comment all along;
  // nothing kept the promise, and two adjacent labels sat 22px apart.
  gutter: {
    blockSize: semanticTokens.fontSizeLg,
    flexShrink: 0,
    inlineSize: semanticTokens.fontSizeLg,
  },
  // Laid across, the mark moves to the block edge. A bar at the inline start
  // of a row in a horizontal menu stands between that row and the one before
  // it, so it reads as a divider rather than as a mark on either — and the
  // row's own leading padding puts it nowhere near the word it marks.
  interactiveAcross: {
    '::before': {
      height: markWidth,
      insetBlockStart: 'auto',
      insetBlockEnd: 0,
      insetInline: semanticTokens.spacingSm,
      transform: 'none',
      transitionProperty: 'background-color, opacity',
      width: 'auto',
      opacity: {default: 0, ':hover': 1},
    },
  },
});

/** Props for one destination inside a navigation menu. */
export interface NavItemProps extends Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  'aria-current' | 'className' | 'href'
> {
  readonly current?: boolean;
  readonly href: string;
  readonly leading?: ReactNode;
}

/**
 * Links to one destination. `current` marks the reader's location with
 * `aria-current="page"` as well as ink, so the location is not carried by
 * colour alone.
 */
export function NavItem({
  children,
  current = false,
  href,
  leading,
  ...props
}: NavItemProps) {
  const orientation = useNavMenuOrientation();

  return (
    <Link
      {...props}
      {...(current ? {'aria-current': 'page' as const} : {})}
      href={href}
      {...stylex.props(
        styles.item,
        current ? styles.current : styles.interactive,
        current || orientation === 'vertical'
          ? undefined
          : styles.interactiveAcross,
      )}
    >
      {leading ?? <span aria-hidden="true" {...stylex.props(styles.gutter)} />}
      {children}
    </Link>
  );
}
