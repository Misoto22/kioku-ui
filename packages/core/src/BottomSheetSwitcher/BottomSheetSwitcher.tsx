import * as stylex from '@stylexjs/stylex';
import {
  useEffect,
  useRef,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from 'react';

import {semanticTokens} from '../authoring.stylex.js';
import {BottomSheet} from '../BottomSheet/index.js';
import {Button} from '../Button/index.js';
import {Icon} from '../Icon/index.js';
import {useInternationalization} from '../i18n/index.js';

// The back control is a small button, and a small button carries its own
// inline padding. Negating that padding exactly puts its first letter on the
// same edge as the sheet's title rather than a step inside it.
const backBleed = `calc(-1 * ${semanticTokens.spacingSm})`;

const styles = stylex.create({
  // The heading is the landing point after a switch, so it takes focus; it
  // stays out of the tab order because it is a heading, not a control.
  heading: {
    fontFamily: semanticTokens.fontFamilyDisplay,
    outlineStyle: 'none',
    ':focus-visible': {
      outlineColor: semanticTokens.colorFocus,
      outlineOffset: semanticTokens.focusOffset,
      outlineStyle: semanticTokens.borderStyle,
      outlineWidth: semanticTokens.focusWidth,
    },
  },
  views: {
    display: 'flex',
    flexDirection: 'column',
    gap: semanticTokens.spacingMd,
  },
  back: {
    display: 'flex',
    marginInlineStart: backBleed,
  },
});

/** One named view a switcher can show inside a single sheet. */
export interface BottomSheetSwitcherView {
  readonly content: ReactNode;
  readonly id: string;
  readonly parentId?: string;
  readonly title: ReactNode;
}

type SharedBottomSheetSwitcherProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  'children' | 'className' | 'role' | 'title'
> & {
  readonly backLabel?: string;
  readonly onDismiss?: () => void;
  readonly onViewChange?: (viewId: string) => void;
  readonly open: boolean;
  readonly views: readonly BottomSheetSwitcherView[];
};

type ControlledBottomSheetSwitcherProps = SharedBottomSheetSwitcherProps & {
  readonly defaultViewId?: never;
  readonly onViewChange: (viewId: string) => void;
  readonly viewId: string;
};

type UncontrolledBottomSheetSwitcherProps = SharedBottomSheetSwitcherProps & {
  readonly defaultViewId?: string;
  readonly viewId?: never;
};

/** Props for one sheet whose content swaps between several named views. */
export type BottomSheetSwitcherProps =
  ControlledBottomSheetSwitcherProps | UncontrolledBottomSheetSwitcherProps;

/**
 * Shows one bottom sheet whose content swaps between named views, so a reader
 * can drill from a summary into a detail without the sheet ever closing. A
 * view that names a parent gets a back control, and every switch moves focus
 * to the heading of the view that arrived — otherwise the reader is left on a
 * button that has just changed meaning underneath them.
 */
export function BottomSheetSwitcher({
  backLabel,
  defaultViewId,
  onDismiss,
  onViewChange,
  open,
  viewId,
  views,
  ...props
}: BottomSheetSwitcherProps) {
  if (views.length === 0) {
    throw new Error('BottomSheetSwitcher requires at least one view');
  }

  const {messages} = useInternationalization();
  const headingRef = useRef<HTMLSpanElement>(null);
  const shownViewId = useRef<string | undefined>(undefined);
  const [internalViewId, setInternalViewId] = useState(defaultViewId);
  const requestedViewId = viewId ?? internalViewId;
  const current = views.find((view) => view.id === requestedViewId) ?? views[0];
  const currentId = current.id;

  useEffect(() => {
    if (!open) {
      shownViewId.current = undefined;
      return;
    }
    const shown = shownViewId.current;
    if (shown !== undefined && shown !== currentId) {
      headingRef.current?.focus();
    }
    shownViewId.current = currentId;
  }, [currentId, open]);

  const parent = views.find((view) => view.id === current.parentId);

  function show(nextViewId: string) {
    if (viewId === undefined) {
      setInternalViewId(nextViewId);
    }
    onViewChange?.(nextViewId);
  }

  return (
    <BottomSheet
      {...props}
      onDismiss={onDismiss}
      open={open}
      title={
        <span ref={headingRef} {...stylex.props(styles.heading)} tabIndex={-1}>
          {current.title}
        </span>
      }
    >
      <div {...stylex.props(styles.views)}>
        {parent === undefined ? null : (
          <div {...stylex.props(styles.back)}>
            <Button
              onClick={() => {
                show(parent.id);
              }}
              size="sm"
              variant="ghost"
            >
              <Icon>
                <path
                  d="m15 6-6 6 6 6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </Icon>
              {backLabel ?? messages.back}
            </Button>
          </div>
        )}
        {current.content}
      </div>
    </BottomSheet>
  );
}
