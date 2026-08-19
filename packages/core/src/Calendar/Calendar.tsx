import * as stylex from '@stylexjs/stylex';
import {
  useEffect,
  useId,
  useRef,
  useState,
  type HTMLAttributes,
  type KeyboardEvent,
} from 'react';

import {semanticTokens} from '../authoring.stylex.js';
import {useInternationalization} from '../i18n/index.js';
import {Icon} from '../Icon/index.js';
import {IconButton} from '../IconButton/index.js';

// Today is a rule twice the hairline along the bottom edge, never a fill:
// the one filled day in the grid is the day that was actually chosen.
const todayMark = `inset 0 calc(-2 * ${semanticTokens.borderWidth}) 0 0 ${semanticTokens.colorAccent}`;

// The grid is tiled, not bordered: one hairline of separation drawn by the
// table's own background showing through the spacing, with every cell opaque
// over it. Bordering each cell would double every interior rule and leave the
// perimeter twice as heavy as the inside.
const gridRule = semanticTokens.borderWidth;

const styles = stylex.create({
  calendar: {
    backgroundColor: semanticTokens.colorSurface,
    borderRadius: semanticTokens.radiusContainer,
    boxShadow: semanticTokens.elevationLow,
    display: 'inline-flex',
    flexDirection: 'column',
    fontFamily: semanticTokens.fontFamilyBody,
    gap: semanticTokens.spacingMd,
    padding: semanticTokens.spacingLg,
  },
  header: {
    alignItems: 'center',
    display: 'flex',
    gap: semanticTokens.spacingSm,
    justifyContent: 'space-between',
  },
  month: {
    color: semanticTokens.colorText,
    fontFamily: semanticTokens.fontFamilyHeading,
    fontSize: semanticTokens.fontSizeMd,
    // The year is a figure sitting beside a word. Without tabular figures the
    // heading re-flows by a hair as the reader steps months, which reads as a
    // wobble in a control that is otherwise perfectly still.
    fontVariantNumeric: 'tabular-nums',
    fontWeight: semanticTokens.fontWeightMedium,
    letterSpacing: semanticTokens.letterSpacingLabel,
    lineHeight: semanticTokens.lineHeightHeading,
    margin: 0,
  },
  // Not clipped. A tiled set is normally given `overflow: hidden` so the
  // corner cells cannot square off the container, but every tile here is
  // focusable and the focus ring stands two pixels outside its box — clipping
  // would take the ring off the whole perimeter of the grid to tidy three
  // pixels of corner.
  grid: {
    backgroundColor: semanticTokens.borderDefault,
    borderCollapse: 'separate',
    borderRadius: semanticTokens.radiusInner,
    borderSpacing: gridRule,
  },
  weekday: {
    backgroundColor: semanticTokens.colorSurfaceMuted,
    color: semanticTokens.colorTextSecondary,
    fontFamily: semanticTokens.fontFamilyHeading,
    fontSize: semanticTokens.fontSizeXs,
    fontWeight: semanticTokens.fontWeightMedium,
    letterSpacing: semanticTokens.letterSpacingEyebrow,
    lineHeight: semanticTokens.lineHeightHeading,
    paddingBlock: semanticTokens.spacingXs,
    textTransform: 'uppercase',
    width: semanticTokens.sizeControlMd,
  },
  cell: {backgroundColor: semanticTokens.colorSurface, padding: 0},
  // No radius and no border. A day is a tile in a tiled set, so it fills its
  // cell edge to edge; a rounded chip inside a tile would show the rule
  // through its corners, and a hairline round a 28px box reads as a field
  // that failed to grow.
  day: {
    backgroundColor: 'transparent',
    borderStyle: 'none',
    borderWidth: 0,
    boxSizing: 'border-box',
    cursor: 'pointer',
    display: 'block',
    fontFamily: semanticTokens.fontFamilyMono,
    fontSize: semanticTokens.fontSizeSm,
    // A month whose digits do not line up column to column is the loudest
    // failure this grid can make.
    fontVariantNumeric: 'tabular-nums',
    height: semanticTokens.sizeControlMd,
    letterSpacing: semanticTokens.letterSpacingMono,
    padding: 0,
    transitionDuration: semanticTokens.durationFast,
    transitionProperty: 'background-color, box-shadow, color',
    transitionTimingFunction: semanticTokens.easingStandard,
    width: semanticTokens.sizeControlMd,
    ':disabled': {
      color: semanticTokens.colorDisabledText,
      cursor: 'default',
    },
    ':focus-visible': {
      outlineColor: semanticTokens.colorFocus,
      outlineOffset: semanticTokens.focusOffset,
      outlineStyle: semanticTokens.borderStyle,
      outlineWidth: semanticTokens.focusWidth,
    },
  },
  // Three ranks of ink carry the month: the day in hand is current, the rest
  // of the month is available, the neighbouring months are context.
  open: {
    color: semanticTokens.colorTextSecondary,
    ':hover:not(:disabled)': {
      backgroundColor: semanticTokens.colorOverlayHover,
      color: semanticTokens.colorText,
    },
  },
  outside: {
    color: semanticTokens.colorTextMuted,
    ':hover:not(:disabled)': {
      backgroundColor: semanticTokens.colorOverlayHover,
      color: semanticTokens.colorTextSecondary,
    },
  },
  today: {boxShadow: todayMark, color: semanticTokens.colorText},
  // A single square point is small enough to fill without shouting.
  chosen: {
    backgroundColor: semanticTokens.colorAccent,
    color: semanticTokens.colorTextOnAccent,
    fontWeight: semanticTokens.fontWeightMedium,
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

// getUTCDay is Sunday-first; shift so the week starts on Monday.
function weekdayIndex(date: Date) {
  return (date.getUTCDay() + 6) % 7;
}

// Six rows always, so the grid does not resize as the reader moves between months.
function monthGrid(anchor: Date) {
  const firstOfMonth = new Date(
    Date.UTC(anchor.getUTCFullYear(), anchor.getUTCMonth(), 1),
  );
  const start = addDays(firstOfMonth, -weekdayIndex(firstOfMonth));

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

// Dates are held in UTC so a grid cell means the same day in every timezone.
const defaultFormatDay = (date: Date) =>
  date.toLocaleDateString(undefined, {dateStyle: 'long', timeZone: 'UTC'});

const defaultFormatMonth = (date: Date) =>
  date.toLocaleDateString(undefined, {
    month: 'long',
    timeZone: 'UTC',
    year: 'numeric',
  });

/**
 * Selects a date from a month grid. Arrow keys move by day and week, Home and
 * End reach the ends of the week, Page Up and Page Down move by month, so the
 * whole grid is one tab stop.
 */
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
  const monthId = useId();
  const [internalValue, setInternalValue] = useState(defaultValue);
  const selected = value ?? internalValue;
  const selectedDate = parseIso(selected);
  const [focusedIso, setFocusedIso] = useState(
    () => selected || toIso(new Date(Date.UTC(2000, 0, 1))),
  );
  const focused = parseIso(focusedIso) ?? new Date(Date.UTC(2000, 0, 1));
  const weeks = monthGrid(focused);
  const todayIso = toIso(new Date());
  const dayRefs = useRef(new Map<string, HTMLButtonElement>());
  // Only keyboard movement drags focus along; a click or a month step must not.
  const followFocus = useRef(false);

  useEffect(() => {
    if (!followFocus.current) {
      return;
    }
    followFocus.current = false;
    dayRefs.current.get(focusedIso)?.focus();
  }, [focusedIso]);

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

  function moveFocus(date: Date) {
    followFocus.current = true;
    setFocusedIso(toIso(date));
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTableElement>) {
    const steps: Record<string, number> = {
      ArrowLeft: -1,
      ArrowRight: 1,
      ArrowUp: -7,
      ArrowDown: 7,
    };

    if (event.key in steps) {
      event.preventDefault();
      moveFocus(addDays(focused, steps[event.key] ?? 0));
      return;
    }
    if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      const offset = weekdayIndex(focused);
      moveFocus(addDays(focused, event.key === 'Home' ? -offset : 6 - offset));
      return;
    }
    if (event.key === 'PageUp' || event.key === 'PageDown') {
      event.preventDefault();
      moveFocus(addMonths(focused, event.key === 'PageUp' ? -1 : 1));
    }
  }

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
          id={monthId}
          role="status"
          {...stylex.props(styles.month)}
        >
          {formatMonth(focused)}
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
      <table
        aria-describedby={monthId}
        aria-label={label}
        onKeyDown={handleKeyDown}
        role="grid"
        {...stylex.props(styles.grid)}
      >
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
                      ref={(element) => {
                        if (element) {
                          dayRefs.current.set(iso, element);
                        } else {
                          dayRefs.current.delete(iso);
                        }
                      }}
                      tabIndex={iso === focusedIso ? 0 : -1}
                      {...stylex.props(
                        styles.day,
                        isSelected
                          ? styles.chosen
                          : outsideMonth
                            ? styles.outside
                            : styles.open,
                        !isSelected && iso === todayIso && styles.today,
                      )}
                      type="button"
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
  );
}
