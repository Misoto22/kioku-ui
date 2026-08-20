import * as stylex from '@stylexjs/stylex';
import {
  useEffect,
  useId,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from 'react';

import {semanticTokens} from '../authoring.stylex.js';
import {scrolling} from '../scrolling/index.js';
import {Icon} from '../Icon/index.js';
import {useInternationalization} from '../i18n/index.js';
import {Overlay} from '../Overlay/index.js';

// About twenty spacing steps wide: long command names read on one line.
const surfaceWidth = `calc(20 * ${semanticTokens.spacing2xl})`;

const markWidth = `calc(2 * ${semanticTokens.borderWidth})`;
const markHeight = '64%';

const styles = stylex.create({
  surface: {
    backgroundColor: semanticTokens.colorSurfaceRaised,
    borderRadius: semanticTokens.radiusContainer,
    boxShadow: semanticTokens.elevationHigh,
    display: 'flex',
    flexDirection: 'column',
    fontFamily: semanticTokens.fontFamilyBody,
    maxHeight: '70vh',
    maxWidth: surfaceWidth,
    overflow: 'hidden',
    width: '100%',
  },
  // The query line is set bare on the paper with one rule under it, not in a
  // second box: a field inside a floating panel draws the panel's edge twice.
  // The rule is the strong hairline, because it is the only thing separating
  // what the reader is typing from what the typing is turning up.
  search: {
    alignItems: 'center',
    borderBlockEndColor: semanticTokens.borderStrong,
    borderBlockEndStyle: semanticTokens.borderStyle,
    borderBlockEndWidth: semanticTokens.borderWidth,
    display: 'flex',
    gap: semanticTokens.spacingMd,
    paddingBlock: semanticTokens.spacingMd,
    paddingInline: semanticTokens.spacingLg,
  },
  input: {
    backgroundColor: 'transparent',
    borderStyle: 'none',
    borderWidth: 0,
    color: semanticTokens.colorText,
    flexGrow: 1,
    fontFamily: semanticTokens.fontFamilyBody,
    fontSize: semanticTokens.fontSizeMd,
    letterSpacing: semanticTokens.letterSpacingBody,
    lineHeight: semanticTokens.lineHeightBody,
    minWidth: 0,
    padding: 0,
    '::placeholder': {color: semanticTokens.colorTextMuted},
    ':focus-visible': {
      outlineColor: semanticTokens.colorFocus,
      outlineOffset: semanticTokens.focusOffset,
      outlineStyle: semanticTokens.borderStyle,
      outlineWidth: semanticTokens.focusWidth,
    },
  },
  list: {
    listStyleType: 'none',
    marginBlock: 0,
    overflowY: 'auto',
    paddingBlock: semanticTokens.spacingXs,
    paddingInlineStart: 0,
  },
  // The eyebrow: display face, smallest size, opened right up, secondary ink.
  // It names the group without competing with the commands inside it, and the
  // mincho line is what marks it as a caption rather than a shouted heading —
  // which is why it is not set in capitals as well.
  groupLabel: {
    color: semanticTokens.colorTextSecondary,
    fontFamily: semanticTokens.fontFamilyDisplay,
    fontSize: semanticTokens.fontSizeXs,
    fontWeight: semanticTokens.fontWeightMedium,
    letterSpacing: semanticTokens.letterSpacingEyebrow,
    lineHeight: semanticTokens.lineHeightHeading,
    marginBlock: 0,
    paddingBlock: semanticTokens.spacingXs,
    paddingInline: semanticTokens.spacingLg,
  },
  // A command that is merely available is set in the second rank; the one the
  // keys are pointing at rises to the first. The wash alone would say it, but
  // a wash this quiet needs the ink to agree with it.
  option: {
    alignItems: 'center',
    color: semanticTokens.colorTextSecondary,
    cursor: 'pointer',
    display: 'flex',
    gap: semanticTokens.spacingMd,
    justifyContent: 'space-between',
    paddingBlock: semanticTokens.spacingSm,
    paddingInline: semanticTokens.spacingLg,
    position: 'relative',
    transitionDuration: semanticTokens.durationFast,
    transitionProperty: 'background-color, color',
    transitionTimingFunction: semanticTokens.easingStandard,
  },
  idle: {
    ':hover': {
      backgroundColor: semanticTokens.colorOverlayHover,
      color: semanticTokens.colorText,
    },
  },
  // Focus never leaves the field, so the row the keys point at has to say so
  // on its own: the wash, the first rank of ink, and the bookmark at the
  // inline-start edge — never a filled blue bar, which would be the only
  // block of colour on the page.
  active: {
    backgroundColor: semanticTokens.colorOverlayHover,
    color: semanticTokens.colorText,
    '::before': {
      backgroundColor: semanticTokens.colorAccent,
      content: '',
      height: markHeight,
      insetBlockStart: '50%',
      insetInlineStart: 0,
      position: 'absolute',
      transform: 'translateY(-50%)',
      width: markWidth,
    },
  },
  label: {
    fontFamily: semanticTokens.fontFamilyBody,
    fontSize: semanticTokens.fontSizeMd,
    letterSpacing: semanticTokens.letterSpacingLabel,
  },
  // A keyboard hint is a figure, and a key cap is a well in the paper: mono
  // and tabular so a column of them lines up down the list, on the sunken
  // fill so it reads as something to press rather than as more prose.
  shortcut: {
    backgroundColor: semanticTokens.colorSurfaceMuted,
    borderRadius: semanticTokens.radiusInner,
    color: semanticTokens.colorTextSecondary,
    fontFamily: semanticTokens.fontFamilyMono,
    fontSize: semanticTokens.fontSizeXs,
    fontVariantNumeric: 'tabular-nums',
    letterSpacing: semanticTokens.letterSpacingMono,
    paddingInline: semanticTokens.spacingXs,
    whiteSpace: 'nowrap',
  },
  empty: {
    color: semanticTokens.colorTextSecondary,
    fontFamily: semanticTokens.fontFamilyBody,
    fontSize: semanticTokens.fontSizeSm,
    letterSpacing: semanticTokens.letterSpacingBody,
    lineHeight: semanticTokens.lineHeightBody,
    marginBlock: 0,
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
    if (event.key === 'Home' || event.key === 'End') {
      if (matches.length === 0) {
        return;
      }
      event.preventDefault();
      setActiveIndex(event.key === 'Home' ? 0 : matches.length - 1);
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
        <div {...stylex.props(styles.search)}>
          {/* The glass names the line as a search without a word of chrome. */}
          <Icon size="md" tone="muted">
            <path
              d="M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14Zm5 12 4 4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            />
          </Icon>
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
            value={query}
            {...stylex.props(styles.input)}
            type="text"
          />
        </div>
        <ul
          id={listboxId}
          role="listbox"
          {...stylex.props(styles.list, scrolling.region)}
        >
          {matches.map((command, index) => {
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
                    index === activeIndex ? styles.active : styles.idle,
                  )}
                >
                  <span {...stylex.props(styles.label)}>{command.label}</span>
                  {command.shortcut === undefined ? null : (
                    <kbd {...stylex.props(styles.shortcut)}>
                      {command.shortcut}
                    </kbd>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
        {matches.length === 0 ? (
          // A listbox may own nothing but options, so the notice sits beside
          // it and announces itself instead.
          <p role="status" {...stylex.props(styles.empty)}>
            {emptyMessage ?? messages.commandPaletteEmpty}
          </p>
        ) : null}
      </div>
    </Overlay>
  );
}
