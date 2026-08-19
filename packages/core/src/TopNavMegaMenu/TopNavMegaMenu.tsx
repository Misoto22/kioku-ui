import * as stylex from '@stylexjs/stylex';
import {
  useRef,
  useState,
  type AnchorHTMLAttributes,
  type ReactNode,
} from 'react';

import {semanticTokens} from '../authoring.stylex.js';
import {Heading} from '../Heading/index.js';
import {Icon} from '../Icon/index.js';
import {Link} from '../navigation/index.js';
import {Popover} from '../Popover/index.js';
import {Text} from '../Text/index.js';

// The trigger wears the same mark as the destinations beside it: two
// hairlines at the inline-start edge, hinted on hover and claimed when open.
const markWidth = `calc(2 * ${semanticTokens.borderWidth})`;
const hoverMarkHeight = '40%';
const openMarkHeight = '72%';
const columnMinWidth = `calc(7 * ${semanticTokens.spacing2xl})`;
const panelMaxWidth = `calc(30 * ${semanticTokens.spacing2xl})`;

const styles = stylex.create({
  anchor: {display: 'inline-flex'},
  trigger: {
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderRadius: semanticTokens.radiusElement,
    borderStyle: 'none',
    borderWidth: 0,
    color: semanticTokens.colorTextSecondary,
    columnGap: semanticTokens.spacingXs,
    cursor: 'pointer',
    display: 'inline-flex',
    fontFamily: semanticTokens.fontFamilyBody,
    fontSize: semanticTokens.fontSizeMd,
    letterSpacing: semanticTokens.letterSpacingLabel,
    minHeight: semanticTokens.sizeControlMd,
    paddingBlock: semanticTokens.spacingXs,
    paddingInline: semanticTokens.spacingSm,
    position: 'relative',
    transitionDuration: semanticTokens.durationFast,
    transitionProperty: 'color',
    transitionTimingFunction: semanticTokens.easingStandard,
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
  closed: {
    '::before': {
      backgroundColor: semanticTokens.borderStrong,
      height: {default: 0, ':hover': hoverMarkHeight},
    },
    ':hover': {color: semanticTokens.colorText},
  },
  open: {
    color: semanticTokens.colorText,
    '::before': {
      backgroundColor: semanticTokens.colorAccent,
      height: openMarkHeight,
    },
  },
  marker: {
    alignItems: 'center',
    display: 'inline-flex',
    transitionDuration: semanticTokens.durationModerate,
    transitionProperty: 'transform',
    transitionTimingFunction: semanticTokens.easingStandard,
  },
  markerOpen: {transform: 'rotate(180deg)'},
  panel: {
    display: 'grid',
    gap: semanticTokens.spacingXl,
    gridTemplateColumns: `repeat(auto-fit, minmax(min(100%, ${columnMinWidth}), 1fr))`,
    maxWidth: panelMaxWidth,
  },
  column: {
    display: 'flex',
    flexDirection: 'column',
    rowGap: semanticTokens.borderWidth,
  },
  // The same eyebrow the rail's section headings take: smallest size, opened
  // right up, heading face, second rank of ink.
  columnTitle: {
    color: semanticTokens.colorTextSecondary,
    fontFamily: semanticTokens.fontFamilyHeading,
    fontSize: semanticTokens.fontSizeXs,
    fontWeight: semanticTokens.fontWeightMedium,
    letterSpacing: semanticTokens.letterSpacingEyebrow,
    lineHeight: semanticTokens.lineHeightHeading,
    margin: 0,
    paddingBlockEnd: semanticTokens.spacingXs,
    paddingInline: semanticTokens.spacingSm,
  },
  // A well sunk into the panel it sits in, so it takes the inner radius and
  // wears its hover as a wash laid over the fill rather than replacing it.
  card: {
    backgroundColor: semanticTokens.colorSurfaceMuted,
    borderRadius: semanticTokens.radiusInner,
    display: 'flex',
    flexDirection: 'column',
    padding: semanticTokens.spacingMd,
    rowGap: semanticTokens.spacingXs,
    textDecorationLine: 'none',
    transitionDuration: semanticTokens.durationFast,
    transitionProperty: 'background-color, background-image',
    transitionTimingFunction: semanticTokens.easingStandard,
    ':focus-visible': {
      outlineColor: semanticTokens.colorFocus,
      outlineOffset: semanticTokens.focusOffset,
      outlineStyle: semanticTokens.borderStyle,
      outlineWidth: semanticTokens.focusWidth,
    },
    ':hover': {
      backgroundImage: `linear-gradient(${semanticTokens.colorOverlayHover}, ${semanticTokens.colorOverlayHover})`,
    },
  },
});

/** One titled column inside a mega menu. */
export interface MegaMenuColumn {
  readonly items: ReactNode;
  readonly title?: string;
}

/** Props for the banner's panelled menu. */
export interface TopNavMegaMenuProps {
  readonly columns: readonly MegaMenuColumn[];
  readonly featured?: ReactNode;
  readonly label: string;
}

/**
 * A wide banner panel holding several columns of destinations. Like
 * `TopNavMenu` it is a disclosure, not a `menu`: everything inside navigates
 * somewhere rather than running a command.
 */
export function TopNavMegaMenu({
  columns,
  featured,
  label,
}: TopNavMegaMenuProps) {
  const anchorRef = useRef<HTMLSpanElement>(null);
  const [open, setOpen] = useState(false);

  return (
    <>
      <span ref={anchorRef} {...stylex.props(styles.anchor)}>
        <button
          aria-expanded={open}
          onClick={() => {
            setOpen((value) => !value);
          }}
          {...stylex.props(styles.trigger, open ? styles.open : styles.closed)}
          type="button"
        >
          {label}
          <span
            aria-hidden="true"
            {...stylex.props(styles.marker, open && styles.markerOpen)}
          >
            <Icon size="sm">
              <path
                d="m6 9 6 6 6-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              />
            </Icon>
          </span>
        </button>
      </span>
      <Popover
        alignment="start"
        anchorRef={anchorRef}
        aria-label={label}
        onDismiss={() => {
          setOpen(false);
        }}
        open={open}
        role="group"
      >
        <div {...stylex.props(styles.panel)}>
          {columns.map((column, index) => (
            <div key={column.title ?? index} {...stylex.props(styles.column)}>
              {column.title === undefined ? null : (
                <p {...stylex.props(styles.columnTitle)}>{column.title}</p>
              )}
              {column.items}
            </div>
          ))}
          {featured}
        </div>
      </Popover>
    </>
  );
}

/** Props for the promoted entry inside a mega menu. */
export interface TopNavMegaMenuFeaturedCardProps extends Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  'children' | 'className' | 'href' | 'media' | 'title'
> {
  readonly description?: ReactNode;
  readonly href: string;
  readonly media?: ReactNode;
  readonly title: ReactNode;
}

/**
 * The one promoted destination in a mega menu. It is a single link, so the
 * whole card is one tab stop — never put another control inside it.
 */
export function TopNavMegaMenuFeaturedCard({
  description,
  href,
  media,
  title,
  ...props
}: TopNavMegaMenuFeaturedCardProps) {
  return (
    <Link {...props} href={href} {...stylex.props(styles.card)}>
      {media}
      <Heading level={3} size="subsection">
        {title}
      </Heading>
      {description === undefined ? null : (
        <Text size="sm" tone="secondary">
          {description}
        </Text>
      )}
    </Link>
  );
}
