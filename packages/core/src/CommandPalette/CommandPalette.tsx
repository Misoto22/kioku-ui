import * as stylex from '@stylexjs/stylex';
import {
  useEffect,
  useId,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from 'react';

import {semanticTokens} from '../authoring.stylex.js';
import {useInternationalization} from '../i18n/index.js';
import {Kbd} from '../Kbd/index.js';
import {Overlay} from '../Overlay/index.js';

const styles = stylex.create({
  surface: {
    backgroundColor: semanticTokens.colorSurfaceRaised,
    borderColor: semanticTokens.borderDefault,
    borderRadius: semanticTokens.radiusContainer,
    borderStyle: semanticTokens.borderStyle,
    borderWidth: semanticTokens.borderWidth,
    boxShadow: semanticTokens.elevationHigh,
    display: 'flex',
    flexDirection: 'column',
    fontFamily: semanticTokens.fontFamilyBody,
    maxHeight: '70vh',
    maxWidth: '36rem',
    overflow: 'hidden',
    width: '100%',
  },
  input: {
    backgroundColor: 'transparent',
    borderBlockEndColor: semanticTokens.borderDefault,
    borderBlockEndStyle: semanticTokens.borderStyle,
    borderBlockEndWidth: semanticTokens.borderWidth,
    borderInlineStyle: 'none',
    borderInlineWidth: 0,
    borderBlockStartStyle: 'none',
    borderBlockStartWidth: 0,
    color: semanticTokens.colorText,
    fontFamily: semanticTokens.fontFamilyBody,
    fontSize: semanticTokens.fontSizeLg,
    outline: 'none',
    paddingBlock: semanticTokens.spacingMd,
    paddingInline: semanticTokens.spacingLg,
  },
  list: {
    listStyleType: 'none',
    marginBlock: 0,
    overflowY: 'auto',
    paddingBlock: semanticTokens.spacingXs,
    paddingInlineStart: 0,
  },
  groupLabel: {
    color: semanticTokens.colorTextMuted,
    fontSize: semanticTokens.fontSizeXs,
    fontWeight: semanticTokens.fontWeightMedium,
    letterSpacing: '0.06em',
    paddingBlock: semanticTokens.spacingXs,
    paddingInline: semanticTokens.spacingLg,
    textTransform: 'uppercase',
  },
  option: {
    alignItems: 'center',
    color: semanticTokens.colorText,
    cursor: 'pointer',
    display: 'flex',
    fontSize: semanticTokens.fontSizeMd,
    gap: semanticTokens.spacingSm,
    justifyContent: 'space-between',
    paddingBlock: semanticTokens.spacingSm,
    paddingInline: semanticTokens.spacingLg,
  },
  active: {backgroundColor: semanticTokens.colorOverlayHover},
  empty: {
    color: semanticTokens.colorTextMuted,
    fontSize: semanticTokens.fontSizeSm,
    paddingBlock: semanticTokens.spacingMd,
    paddingInline: semanticTokens.spacingLg,
  },
});

/** One runnable command. */
export interface Command {
  readonly group?: string;
  readonly id: string;
  readonly label: string;
  readonly shortcut?: string;
}

/** Props for the searchable command list. */
export interface CommandPaletteProps {
  readonly commands: readonly Command[];
  readonly emptyMessage?: ReactNode;
  readonly label?: string;
  readonly onDismiss: () => void;
  readonly onRun: (command: Command) => void;
  readonly open: boolean;
  readonly placeholder?: string;
}

/**
 * Runs a command by name. Focus stays in the search field and
 * `aria-activedescendant` names the highlighted command, so typing and
 * choosing never fight each other for focus.
 */
export function CommandPalette({
  commands,
  emptyMessage,
  label = 'Command palette',
  onDismiss,
  onRun,
  open,
  placeholder,
}: CommandPaletteProps) {
  const {messages} = useInternationalization();
  const resolvedPlaceholder = placeholder ?? messages.commandPalettePlaceholder;
  const listboxId = useId();
  const optionPrefix = useId();
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);

  const matches = commands.filter((command) =>
    command.label.toLowerCase().includes(query.toLowerCase()),
  );
  const active = matches[activeIndex];

  useEffect(() => {
    if (!open) {
      setQuery('');
      setActiveIndex(0);
    }
  }, [open]);

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (matches.length > 0) {
        const step = event.key === 'ArrowDown' ? 1 : -1;
        setActiveIndex(
          (index) => (index + step + matches.length) % matches.length,
        );
      }
      return;
    }
    if (event.key === 'Enter' && active) {
      event.preventDefault();
      onRun(active);
    }
  }

  let lastGroup: string | undefined;

  return (
    <Overlay onDismiss={onDismiss} open={open}>
      <div aria-label={label} role="dialog" {...stylex.props(styles.surface)}>
        <input
          aria-activedescendant={
            active ? `${optionPrefix}-${activeIndex}` : undefined
          }
          aria-autocomplete="list"
          aria-controls={listboxId}
          aria-expanded
          aria-label={resolvedPlaceholder}
          autoComplete="off"
          onChange={(event) => {
            setQuery(event.currentTarget.value);
            setActiveIndex(0);
          }}
          onKeyDown={handleKeyDown}
          placeholder={resolvedPlaceholder}
          role="combobox"
          type="text"
          value={query}
          {...stylex.props(styles.input)}
        />
        <ul id={listboxId} role="listbox" {...stylex.props(styles.list)}>
          {matches.length === 0 ? (
            <li {...stylex.props(styles.empty)}>
              {emptyMessage ?? messages.commandPaletteEmpty}
            </li>
          ) : (
            matches.map((command, index) => {
              const showGroup =
                command.group !== undefined && command.group !== lastGroup;
              lastGroup = command.group;

              return (
                <li key={command.id} role="none">
                  {showGroup ? (
                    <p aria-hidden="true" {...stylex.props(styles.groupLabel)}>
                      {command.group}
                    </p>
                  ) : null}
                  <div
                    aria-selected={index === activeIndex}
                    id={`${optionPrefix}-${index}`}
                    onClick={() => {
                      onRun(command);
                    }}
                    role="option"
                    {...stylex.props(
                      styles.option,
                      index === activeIndex && styles.active,
                    )}
                  >
                    <span>{command.label}</span>
                    {command.shortcut === undefined ? null : (
                      <Kbd>{command.shortcut}</Kbd>
                    )}
                  </div>
                </li>
              );
            })
          )}
        </ul>
      </div>
    </Overlay>
  );
}
