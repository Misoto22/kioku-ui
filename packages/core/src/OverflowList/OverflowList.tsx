import * as stylex from '@stylexjs/stylex';
import {useRef, useState, type HTMLAttributes, type ReactNode} from 'react';

import {semanticTokens} from '../authoring.stylex.js';
import {Button} from '../Button/index.js';
import {DropdownMenu, DropdownMenuItem} from '../DropdownMenu/index.js';

const styles = stylex.create({
  row: {
    alignItems: 'center',
    display: 'flex',
    flexWrap: 'nowrap',
    fontFamily: semanticTokens.fontFamilyBody,
    gap: semanticTokens.spacingXs,
    minWidth: 0,
  },
  item: {flexShrink: 0},
  anchor: {display: 'inline-flex'},
  count: {
    fontSize: semanticTokens.fontSizeSm,
    letterSpacing: semanticTokens.letterSpacingLabel,
  },
});

/** One entry that can move into the overflow menu. */
export interface OverflowEntry {
  readonly label: string;
  readonly node: ReactNode;
  readonly onSelect?: () => void;
}

/** Props for a row that folds its tail into a menu. */
export interface OverflowListProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'children' | 'className'
> {
  readonly entries: readonly OverflowEntry[];
  readonly overflowLabel?: string;
  readonly visibleCount: number;
}

/**
 * Shows the first `visibleCount` entries and folds the rest into a menu. The
 * count is supplied by the caller rather than measured here, so the component
 * stays predictable and does not thrash on resize.
 */
export function OverflowList({
  entries,
  overflowLabel = 'More',
  visibleCount,
  ...props
}: OverflowListProps) {
  const anchorRef = useRef<HTMLSpanElement>(null);
  const [open, setOpen] = useState(false);

  const shown = entries.slice(0, visibleCount);
  const hidden = entries.slice(visibleCount);

  return (
    <div {...props} {...stylex.props(styles.row)}>
      {shown.map((entry) => (
        <span key={entry.label} {...stylex.props(styles.item)}>
          {entry.node}
        </span>
      ))}
      {hidden.length === 0 ? null : (
        <span {...stylex.props(styles.item)}>
          <span ref={anchorRef} {...stylex.props(styles.anchor)}>
            <Button
              onClick={() => {
                setOpen((value) => !value);
              }}
              size="sm"
              variant="ghost"
            >
              <span {...stylex.props(styles.count)}>
                {overflowLabel} ({hidden.length})
              </span>
            </Button>
          </span>
          <DropdownMenu
            anchorRef={anchorRef}
            label={overflowLabel}
            onDismiss={() => {
              setOpen(false);
            }}
            open={open}
          >
            {hidden.map((entry) => (
              <DropdownMenuItem
                key={entry.label}
                onClick={() => {
                  entry.onSelect?.();
                  setOpen(false);
                }}
              >
                {entry.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenu>
        </span>
      )}
    </div>
  );
}
