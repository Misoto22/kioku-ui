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

const styles = stylex.create({
  tree: {
    display: 'flex',
    flexDirection: 'column',
    fontFamily: semanticTokens.fontFamilyBody,
    gap: semanticTokens.spacingXs,
    listStyleType: 'none',
    marginBlock: 0,
    paddingInlineStart: 0,
  },
  group: {
    display: 'flex',
    flexDirection: 'column',
    gap: semanticTokens.spacingXs,
    listStyleType: 'none',
    marginBlock: 0,
    paddingInlineStart: semanticTokens.spacingLg,
  },
  node: {
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
    gap: semanticTokens.spacingXs,
    paddingBlock: semanticTokens.spacingXs,
    paddingInline: semanticTokens.spacingXs,
    textAlign: 'start',
    width: '100%',
    ':focus-visible': {
      outlineColor: semanticTokens.colorFocus,
      outlineOffset: semanticTokens.focusOffset,
      outlineStyle: semanticTokens.borderStyle,
      outlineWidth: semanticTokens.focusWidth,
    },
    ':hover': {backgroundColor: semanticTokens.colorOverlayHover},
  },
  selected: {
    backgroundColor: semanticTokens.colorOverlayActive,
    fontWeight: semanticTokens.fontWeightMedium,
  },
  marker: {flexShrink: 0, width: semanticTokens.fontSizeMd},
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
  'children' | 'className' | 'onSelect' | 'role'
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
            tabIndex={node.id === focusedId ? 0 : -1}
            type="button"
            {...stylex.props(
              styles.node,
              node.id === selectedId && styles.selected,
            )}
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
