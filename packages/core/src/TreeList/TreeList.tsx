import * as stylex from '@stylexjs/stylex';
import {
  useRef,
  useState,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from 'react';

import {semanticTokens} from '../authoring.stylex.js';
import {reachableElements} from '../hooks/focusableSelector.js';
import {Icon} from '../Icon/index.js';

// A selected row is marked by a 2px accent bar against its leading edge, not
// by a fill. `focusWidth` is this system's 2px.
const selectionMark = `inset ${semanticTokens.focusWidth} 0 0 0 ${semanticTokens.colorAccent}`;

// The disclosure column, and where the rule beneath it falls. Both are
// relationships rather than sizes: the marker occupies three spacing steps, the
// rule drops through the middle of that column, and the row's own inline
// padding shifts both. A density change moves the marker and its rule together.
const markerColumn = `calc(3 * ${semanticTokens.spacingSm})`;
const markerCentre = `calc(1.5 * ${semanticTokens.spacingSm})`;
const guideIndent = `calc(${semanticTokens.spacingSm} + ${markerCentre})`;

const styles = stylex.create({
  tree: {
    display: 'flex',
    flexDirection: 'column',
    fontFamily: semanticTokens.fontFamilyBody,
    listStyleType: 'none',
    marginBlock: 0,
    paddingInlineStart: 0,
  },
  // Children hang from one rule dropped through the marker that opened them,
  // so depth is read off a single continuous stroke rather than off the left
  // edge of every row. The inline margin is that indent — not sibling spacing,
  // which the rows' own padding supplies.
  group: {
    borderInlineStartColor: semanticTokens.borderDefault,
    borderInlineStartStyle: semanticTokens.borderStyle,
    borderInlineStartWidth: semanticTokens.borderWidth,
    display: 'flex',
    flexDirection: 'column',
    listStyleType: 'none',
    marginBlock: 0,
    marginInlineStart: guideIndent,
    paddingInlineStart: 0,
  },
  node: {
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderRadius: semanticTokens.radiusElement,
    borderStyle: 'none',
    borderWidth: 0,
    boxSizing: 'border-box',
    color: semanticTokens.colorTextSecondary,
    cursor: 'pointer',
    display: 'flex',
    fontFamily: semanticTokens.fontFamilyBody,
    fontSize: semanticTokens.fontSizeMd,
    fontWeight: semanticTokens.fontWeightRegular,
    gap: semanticTokens.spacingXs,
    letterSpacing: semanticTokens.letterSpacingBody,
    lineHeight: semanticTokens.lineHeightBody,
    // A ledger line, not a menu row. The rows are set close enough that the
    // indent rule reads as one stroke through them; the leading is what keeps
    // them apart, so the padding only has to clear the type.
    paddingBlock: semanticTokens.spacingXs,
    paddingInline: semanticTokens.spacingSm,
    textAlign: 'start',
    transitionDuration: semanticTokens.durationFast,
    transitionProperty: 'background-color, box-shadow, color',
    transitionTimingFunction: semanticTokens.easingStandard,
    width: '100%',
    ':focus-visible': {
      outlineColor: semanticTokens.colorFocus,
      outlineOffset: semanticTokens.focusOffset,
      outlineStyle: semanticTokens.borderStyle,
      outlineWidth: semanticTokens.focusWidth,
    },
  },
  unselected: {
    boxShadow: 'none',
    ':hover:not(:disabled)': {
      backgroundColor: semanticTokens.colorOverlayHover,
      color: semanticTokens.colorText,
    },
  },
  selected: {
    boxShadow: selectionMark,
    color: semanticTokens.colorText,
    fontWeight: semanticTokens.fontWeightMedium,
  },
  // The marker holds its column whether or not the row has one, so every label
  // in the tree starts on the same stem. Its ink is the third rank: it is
  // apparatus, and it must not compete with the row it belongs to — including
  // on the selected row, where the label alone is promoted.
  marker: {
    alignItems: 'center',
    color: semanticTokens.colorTextMuted,
    display: 'inline-flex',
    flexShrink: 0,
    justifyContent: 'center',
    transitionDuration: semanticTokens.durationModerate,
    transitionProperty: 'transform',
    transitionTimingFunction: semanticTokens.easingStandard,
    width: markerColumn,
  },
  markerOpen: {transform: 'rotate(90deg)'},
});

/** One node in a `TreeList`. */
export interface TreeNode {
  readonly children?: readonly TreeNode[];
  readonly id: string;
  readonly label: ReactNode;
}

/** Props for a collapsible hierarchy. */
export interface TreeListProps extends Omit<
  HTMLAttributes<HTMLUListElement>,
  'aria-label' | 'children' | 'className' | 'onSelect' | 'role'
> {
  readonly expandedIds: readonly string[];
  readonly label: string;
  readonly nodes: readonly TreeNode[];
  readonly onExpandedChange: (ids: readonly string[]) => void;
  readonly onSelect?: (id: string) => void;
  readonly selectedId?: string;
}

/**
 * Presents a collapsible hierarchy. The whole tree is one tab stop: up and
 * down move between visible nodes, right opens a branch, left closes it.
 */
export function TreeList({
  expandedIds,
  label,
  nodes,
  onExpandedChange,
  onSelect,
  selectedId,
  ...props
}: TreeListProps) {
  const treeRef = useRef<HTMLUListElement>(null);
  const [focusedId, setFocusedId] = useState(nodes[0]?.id ?? '');

  function toggle(id: string, open: boolean) {
    onExpandedChange(
      open ? [...expandedIds, id] : expandedIds.filter((entry) => entry !== id),
    );
  }

  function handleKeyDown(event: KeyboardEvent<HTMLUListElement>) {
    const tree = treeRef.current;
    if (!tree) {
      return;
    }

    const items = reachableElements(tree);
    const current = items.indexOf(document.activeElement as HTMLElement);

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const step = event.key === 'ArrowDown' ? 1 : -1;
      const next = items[(current + step + items.length) % items.length];
      next?.focus({preventScroll: true});
      return;
    }

    const active = items[current];
    const id = active?.dataset['nodeId'];
    if (id === undefined) {
      return;
    }

    if (event.key === 'ArrowRight' && active?.dataset['branch'] === 'true') {
      event.preventDefault();
      toggle(id, true);
      return;
    }
    if (event.key === 'ArrowLeft' && active?.dataset['branch'] === 'true') {
      event.preventDefault();
      toggle(id, false);
    }
  }

  function renderNodes(entries: readonly TreeNode[], level: number) {
    return entries.map((node) => {
      const branch = (node.children?.length ?? 0) > 0;
      const open = expandedIds.includes(node.id);

      return (
        <li key={node.id} role="none">
          <button
            aria-current={node.id === selectedId ? 'true' : undefined}
            {...(branch ? {'aria-expanded': open} : {})}
            aria-level={level}
            aria-selected={node.id === selectedId}
            data-branch={branch ? 'true' : 'false'}
            data-node-id={node.id}
            onClick={() => {
              setFocusedId(node.id);
              if (branch) {
                toggle(node.id, !open);
              }
              onSelect?.(node.id);
            }}
            role="treeitem"
            {...stylex.props(
              styles.node,
              node.id === selectedId ? styles.selected : styles.unselected,
            )}
            tabIndex={node.id === focusedId ? 0 : -1}
            type="button"
          >
            <span
              aria-hidden="true"
              {...stylex.props(
                styles.marker,
                branch && open && styles.markerOpen,
              )}
            >
              {branch ? (
                <Icon>
                  <path
                    d="m9 6 6 6-6 6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </Icon>
              ) : null}
            </span>
            {node.label}
          </button>
          {branch && open ? (
            <ul role="group" {...stylex.props(styles.group)}>
              {renderNodes(node.children ?? [], level + 1)}
            </ul>
          ) : null}
        </li>
      );
    });
  }

  return (
    <ul
      {...props}
      aria-label={label}
      onKeyDown={handleKeyDown}
      ref={treeRef}
      role="tree"
      {...stylex.props(styles.tree)}
    >
      {renderNodes(nodes, 1)}
    </ul>
  );
}
