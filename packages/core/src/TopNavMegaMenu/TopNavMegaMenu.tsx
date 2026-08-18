import * as stylex from '@stylexjs/stylex';
import {useRef, useState, type HTMLAttributes, type ReactNode} from 'react';

import {semanticTokens} from '../authoring.stylex.js';
import {Heading} from '../Heading/index.js';
import {Icon} from '../Icon/index.js';
import {Link} from '../navigation/index.js';
import {Popover} from '../Popover/index.js';
import {Text} from '../Text/index.js';

const styles = stylex.create({
  trigger: {
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderRadius: semanticTokens.radiusElement,
    borderStyle: 'none',
    borderWidth: 0,
    color: semanticTokens.colorTextSecondary,
    cursor: 'pointer',
    display: 'inline-flex',
    fontFamily: semanticTokens.fontFamilyBody,
    fontSize: semanticTokens.fontSizeMd,
    gap: semanticTokens.spacingXs,
    paddingBlock: semanticTokens.spacingXs,
    paddingInline: semanticTokens.spacingSm,
    ':focus-visible': {
      outlineColor: semanticTokens.colorFocus,
      outlineOffset: semanticTokens.focusOffset,
      outlineStyle: semanticTokens.borderStyle,
      outlineWidth: semanticTokens.focusWidth,
    },
    ':hover': {
      backgroundColor: semanticTokens.colorOverlayHover,
      color: semanticTokens.colorText,
    },
  },
  open: {color: semanticTokens.colorText},
  panel: {
    display: 'grid',
    gap: semanticTokens.spacingLg,
    gridTemplateColumns: 'repeat(auto-fit, minmax(12rem, 1fr))',
    maxWidth: '52rem',
  },
  column: {
    display: 'flex',
    flexDirection: 'column',
    gap: semanticTokens.spacingXs,
  },
  columnTitle: {
    color: semanticTokens.colorTextMuted,
    fontSize: semanticTokens.fontSizeXs,
    fontWeight: semanticTokens.fontWeightMedium,
    letterSpacing: '0.06em',
    margin: 0,
    textTransform: 'uppercase',
  },
  card: {
    backgroundColor: semanticTokens.colorSurfaceMuted,
    borderRadius: semanticTokens.radiusContainer,
    display: 'flex',
    flexDirection: 'column',
    gap: semanticTokens.spacingXs,
    padding: semanticTokens.spacingMd,
    textDecorationLine: 'none',
    ':focus-visible': {
      outlineColor: semanticTokens.colorFocus,
      outlineOffset: semanticTokens.focusOffset,
      outlineStyle: semanticTokens.borderStyle,
      outlineWidth: semanticTokens.focusWidth,
    },
    ':hover': {backgroundColor: semanticTokens.colorOverlayHover},
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
      <span ref={anchorRef} style={{display: 'inline-flex'}}>
        <button
          aria-expanded={open}
          onClick={() => {
            setOpen((value) => !value);
          }}
          type="button"
          {...stylex.props(styles.trigger, open && styles.open)}
        >
          {label}
          <Icon size="sm">
            <path
              d="m6 9 6 6 6-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            />
          </Icon>
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
  HTMLAttributes<HTMLAnchorElement>,
  'children' | 'className' | 'title'
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
