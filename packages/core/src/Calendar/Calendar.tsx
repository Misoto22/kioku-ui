import * as stylex from '@stylexjs/stylex';
import {useId, useState, type HTMLAttributes, type KeyboardEvent} from 'react';

import {semanticTokens} from '../authoring.stylex.js';
import {useInternationalization} from '../i18n/index.js';
import {Icon} from '../Icon/index.js';
import {IconButton} from '../IconButton/index.js';

const styles = stylex.create({
  calendar: {
    backgroundColor: semanticTokens.colorSurface,
    borderColor: semanticTokens.borderDefault,
    borderRadius: semanticTokens.radiusContainer,
    borderStyle: semanticTokens.borderStyle,
    borderWidth: semanticTokens.borderWidth,
    display: 'inline-flex',
    flexDirection: 'column',
    fontFamily: semanticTokens.fontFamilyBody,
    gap: semanticTokens.spacingSm,
    padding: semanticTokens.spacingMd,
  },
  header: {
    alignItems: 'center',
    display: 'flex',
    gap: semanticTokens.spacingSm,
    justifyContent: 'space-between',
  },
  month: {
    color: semanticTokens.colorText,
    fontSize: semanticTokens.fontSizeMd,
    fontWeight: semanticTokens.fontWeightMedium,
    margin: 0,
  },
  grid: {borderCollapse: 'collapse'},
  weekday: {
    color: semanticTokens.colorTextMuted,
    fontSize: semanticTokens.fontSizeXs,
    fontWeight: semanticTokens.fontWeightMedium,
    paddingBlock: semanticTokens.spacingXs,
    width: semanticTokens.sizeControlMd,
  },
  cell: {padding: 0},
  day: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    borderRadius: semanticTokens.radiusElement,
    borderStyle: semanticTokens.borderStyle,
    borderWidth: semanticTokens.borderWidth,
    color: semanticTokens.colorText,
    cursor: 'pointer',
    fontFamily: semanticTokens.fontFamilyBody,
    fontSize: semanticTokens.fontSizeSm,
    height: semanticTokens.sizeControlMd,
    width: semanticTokens.sizeControlMd,
    ':disabled': {color: semanticTokens.colorDisabledText, cursor: 'default'},
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
  outside: {color: semanticTokens.colorTextMuted},
  selected: {
    backgroundColor: semanticTokens.colorAccent,
    borderColor: semanticTokens.colorAccent,
    color: semanticTokens.colorTextOnAccent,
  },
});

const weekdays = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

function toIso(date: Date) {
  return date.toISOString().slice(0, 10);
}

function parseIso(value: string) {
  const parsed = new Date(`${value}T00:00:00Z`);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function addMonths(date: Date, months: number) {
  const next = new Date(date);
  next.setUTCDate(1);
  next.setUTCMonth(next.getUTCMonth() + months);
  return next;
}

// Six rows always, so the grid does not resize as the reader moves between months.
function monthGrid(anchor: Date) {
  const firstOfMonth = new Date(
    Date.UTC(anchor.getUTCFullYear(), anchor.getUTCMonth(), 1),
  );
  // getUTCDay is Sunday-first; shift so the week starts on Monday.
  const leading = (firstOfMonth.getUTCDay() + 6) % 7;
  const start = addDays(firstOfMonth, -leading);

  return Array.from({length: 6}, (_, week) =>
    Array.from({length: 7}, (_, day) => addDays(start, week * 7 + day)),
  );
}

type SharedCalendarProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  'children' | 'className' | 'defaultValue' | 'onChange' | 'role'
> & {
  readonly formatDay?: (date: Date) => string;
  readonly formatMonth?: (date: Date) => string;
  readonly label: string;
  readonly max?: string;
  readonly min?: string;
  readonly onValueChange?: (value: string) => void;
};

type ControlledCalendarProps = SharedCalendarProps & {
  readonly defaultValue?: never;
  readonly onValueChange: (value: string) => void;
  readonly value: string;
};

type UncontrolledCalendarProps = SharedCalendarProps & {
  readonly defaultValue?: string;
  readonly value?: never;
};

/** Props for a month grid of selectable dates. */
export type CalendarProps = ControlledCalendarProps | UncontrolledCalendarProps;

/**
 * Selects a date from a month grid. Arrow keys move by day and week, Page
 * Up and Page Down move by month, so the whole grid is one tab stop.
 */
// Dates are held in UTC so a grid cell means the same day in every timezone.
const defaultFormatDay = (date: Date) =>
  date.toLocaleDateString(undefined, {dateStyle: 'long', timeZone: 'UTC'});

const defaultFormatMonth = (date: Date) =>
  date.toLocaleDateString(undefined, {
    month: 'long',
    timeZone: 'UTC',
    year: 'numeric',
  });

export function Calendar({
  defaultValue = '',
  formatDay = defaultFormatDay,
  formatMonth = defaultFormatMonth,
  label,
  max,
  min,
  onValueChange,
  value,
  ...props
}: CalendarProps) {
  const {messages} = useInternationalization();
  const gridId = useId();
  const [internalValue, setInternalValue] = useState(defaultValue);
  const selected = value ?? internalValue;
  const selectedDate = parseIso(selected);
  const [focusedIso, setFocusedIso] = useState(
    () => selected || toIso(new Date(Date.UTC(2000, 0, 1))),
  );
  const focused = parseIso(focusedIso) ?? new Date(Date.UTC(2000, 0, 1));
  const weeks = monthGrid(focused);

  function outOfRange(date: Date) {
    const iso = toIso(date);
    return (min !== undefined && iso < min) || (max !== undefined && iso > max);
  }

  function select(date: Date) {
    const iso = toIso(date);
    if (value === undefined) {
      setInternalValue(iso);
    }
    setFocusedIso(iso);
    onValueChange?.(iso);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const moves: Record<string, number> = {
      ArrowLeft: -1,
      ArrowRight: 1,
      ArrowUp: -7,
      ArrowDown: 7,
    };

    if (event.key in moves) {
      event.preventDefault();
      setFocusedIso(toIso(addDays(focused, moves[event.key] ?? 0)));
      return;
    }
    if (event.key === 'PageUp' || event.key === 'PageDown') {
      event.preventDefault();
      setFocusedIso(toIso(addMonths(focused, event.key === 'PageUp' ? -1 : 1)));
    }
  }

  const monthLabel = formatMonth(focused);

  return (
    <div {...props} {...stylex.props(styles.calendar)}>
      <div {...stylex.props(styles.header)}>
        <IconButton
          aria-label={messages.calendarPreviousMonth}
          onClick={() => {
            setFocusedIso(toIso(addMonths(focused, -1)));
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
        </IconButton>
        <p
          aria-live="polite"
          id={`${gridId}-month`}
          {...stylex.props(styles.month)}
        >
          {monthLabel}
        </p>
        <IconButton
          aria-label={messages.calendarNextMonth}
          onClick={() => {
            setFocusedIso(toIso(addMonths(focused, 1)));
          }}
          size="sm"
          variant="ghost"
        >
          <Icon>
            <path
              d="m9 6 6 6-6 6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            />
          </Icon>
        </IconButton>
      </div>
      <div
        aria-label={label}
        onKeyDown={handleKeyDown}
        role="application"
        {...stylex.props(styles.grid)}
      >
        <table role="grid" {...stylex.props(styles.grid)}>
          <thead>
            <tr>
              {weekdays.map((weekday) => (
                <th key={weekday} scope="col" {...stylex.props(styles.weekday)}>
                  {weekday}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {weeks.map((week) => (
              <tr key={toIso(week[0] as Date)}>
                {week.map((date) => {
                  const iso = toIso(date);
                  const isSelected =
                    selectedDate !== undefined && iso === selected;
                  const outsideMonth =
                    date.getUTCMonth() !== focused.getUTCMonth();

                  return (
                    <td key={iso} {...stylex.props(styles.cell)}>
                      <button
                        aria-current={isSelected ? 'date' : undefined}
                        // The visible text is just the day number, which repeats
                        // across the leading and trailing weeks of the grid.
                        aria-label={formatDay(date)}
                        disabled={outOfRange(date)}
                        onClick={() => {
                          select(date);
                        }}
                        tabIndex={iso === focusedIso ? 0 : -1}
                        type="button"
                        {...stylex.props(
                          styles.day,
                          outsideMonth && styles.outside,
                          isSelected && styles.selected,
                        )}
                      >
                        {date.getUTCDate()}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
