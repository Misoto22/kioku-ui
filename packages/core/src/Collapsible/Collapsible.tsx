import * as stylex from '@stylexjs/stylex';
import {useId, useState, type HTMLAttributes, type ReactNode} from 'react';

import {semanticTokens} from '../authoring.stylex.js';
import {Icon} from '../Icon/index.js';

// The panel grows from a closed track to an open one. `grid-template-rows` is
// the only height that interpolates, so the reveal is a grid, not a `height`.
const reveal = stylex.keyframes({
  from: {gridTemplateRows: '0fr'},
  to: {gridTemplateRows: '1fr'},
});

const styles = stylex.create({
  region: {
    display: 'grid',
    fontFamily: semanticTokens.fontFamilyBody,
    gap: semanticTokens.spacingSm,
  },
  trigger: {
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderRadius: semanticTokens.radiusElement,
    borderStyle: 'none',
    borderWidth: 0,
    color: semanticTokens.colorText,
    cursor: 'pointer',
    display: 'flex',
    fontFamily: semanticTokens.fontFamilyBody,
    fontSize: semanticTokens.fontSizeMd,
    fontWeight: semanticTokens.fontWeightMedium,
    gap: semanticTokens.spacingSm,
    letterSpacing: semanticTokens.letterSpacingBody,
    lineHeight: semanticTokens.lineHeightBody,
    paddingBlock: semanticTokens.spacingSm,
    paddingInline: semanticTokens.spacingSm,
    textAlign: 'start',
    transitionDuration: semanticTokens.durationFast,
    transitionProperty: 'background-color',
    transitionTimingFunction: semanticTokens.easingStandard,
    width: '100%',
    ':focus-visible': {
      outlineColor: semanticTokens.colorFocus,
      outlineOffset: semanticTokens.focusOffset,
      outlineStyle: semanticTokens.borderStyle,
      outlineWidth: semanticTokens.focusWidth,
    },
    ':hover:not(:disabled)': {
      backgroundColor: semanticTokens.colorOverlayHover,
    },
  },
  marker: {
    color: semanticTokens.colorTextSecondary,
    flexShrink: 0,
    transitionDuration: semanticTokens.durationModerate,
    transitionProperty: 'transform',
    transitionTimingFunction: semanticTokens.easingStandard,
  },
  markerOpen: {transform: 'rotate(90deg)'},
  label: {flexGrow: 1, minWidth: 0},
  panel: {paddingInlineStart: semanticTokens.spacingLg},
  reveal: {
    animationDuration: semanticTokens.durationModerate,
    animationName: {
      default: reveal,
      '@media (prefers-reduced-motion: reduce)': 'none',
    },
    animationTimingFunction: semanticTokens.easingEmphasized,
    display: 'grid',
    gridTemplateRows: '1fr',
  },
  revealContent: {minHeight: 0, overflow: 'hidden'},
});

type SharedCollapsibleProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  'children' | 'className' | 'onChange'
> & {
  readonly children: ReactNode;
  readonly label: ReactNode;
  readonly onOpenChange?: (open: boolean) => void;
};

type ControlledCollapsibleProps = SharedCollapsibleProps & {
  readonly defaultOpen?: never;
  readonly onOpenChange: (open: boolean) => void;
  readonly open: boolean;
};

type UncontrolledCollapsibleProps = SharedCollapsibleProps & {
  readonly defaultOpen?: boolean;
  readonly open?: never;
};

/** Props for a section that can be folded away. */
export type CollapsibleProps =
  ControlledCollapsibleProps | UncontrolledCollapsibleProps;

/**
 * Folds a section away behind its own heading. The panel stays in the DOM
 * and is hidden, so a find-in-page match still reveals where the text lives.
 */
export function Collapsible({
  children,
  defaultOpen = false,
  label,
  onOpenChange,
  open,
  ...props
}: CollapsibleProps) {
  const panelId = useId();
  const triggerId = useId();
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isOpen = open ?? internalOpen;

  return (
    <div {...props} {...stylex.props(styles.region)}>
      <button
        aria-controls={panelId}
        aria-expanded={isOpen}
        id={triggerId}
        onClick={() => {
          const next = !isOpen;
          if (open === undefined) {
            setInternalOpen(next);
          }
          onOpenChange?.(next);
        }}
        {...stylex.props(styles.trigger)}
        type="button"
      >
        <span {...stylex.props(styles.marker, isOpen && styles.markerOpen)}>
          <Icon>
            <path
              d="m9 6 6 6-6 6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            />
          </Icon>
        </span>
        <span {...stylex.props(styles.label)}>{label}</span>
      </button>
      <div
        aria-labelledby={triggerId}
        hidden={!isOpen}
        id={panelId}
        role="region"
        {...stylex.props(styles.panel)}
      >
        <div {...stylex.props(styles.reveal)}>
          <div {...stylex.props(styles.revealContent)}>{children}</div>
        </div>
      </div>
    </div>
  );
}
