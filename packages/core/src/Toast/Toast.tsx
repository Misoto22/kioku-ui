import * as stylex from '@stylexjs/stylex';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from 'react';

import {semanticTokens} from '../authoring.stylex.js';
import type {StatusTone} from '../Badge/index.js';
import {Layer} from '../Layer/index.js';

// A toast is a floating surface, so its width is set in spacing steps rather
// than in a literal the token contract cannot theme.
const regionWidth = `calc(16 * ${semanticTokens.spacingXl})`;

// The dot that names the tone. Two of the smallest spacing step: any larger
// and it stops being a mark on the slip and starts being a bullet.
const dotSize = `calc(2 * ${semanticTokens.spacingXs})`;

// Notifications arrive from the edge they are anchored to.
const enter = stylex.keyframes({
  from: {opacity: 0, transform: 'translateY(25%)'},
  to: {opacity: 1, transform: 'translateY(0)'},
});

const styles = stylex.create({
  region: {
    display: 'flex',
    flexDirection: 'column',
    gap: semanticTokens.spacingSm,
    insetBlockEnd: 0,
    insetInlineEnd: 0,
    maxWidth: regionWidth,
    padding: semanticTokens.spacingLg,
    pointerEvents: 'none',
    position: 'fixed',
    width: '100%',
  },
  // A slip of the same paper as everything else, laid on the stack. Dyeing the
  // whole slip to carry the tone made four differently coloured cards; the
  // tone is one dot, and the slip stays paper so a stack of them reads as a
  // stack rather than as a paint chart.
  toast: {
    alignItems: 'center',
    animationDuration: semanticTokens.durationModerate,
    animationName: {
      default: enter,
      '@media (prefers-reduced-motion: reduce)': 'none',
    },
    animationTimingFunction: semanticTokens.easingEmphasized,
    backgroundColor: semanticTokens.colorSurface,
    borderRadius: semanticTokens.radiusContainer,
    // A floating surface carries elevation instead of an edge; stacking both
    // would draw the same line twice.
    borderStyle: 'none',
    boxShadow: semanticTokens.elevationMedium,
    color: semanticTokens.colorText,
    display: 'flex',
    fontFamily: semanticTokens.fontFamilyBody,
    gap: semanticTokens.spacingMd,
    paddingBlock: semanticTokens.spacingMd,
    paddingInline: semanticTokens.spacingLg,
    pointerEvents: 'auto',
  },
  // The one round shape the system allows outside a knob.
  dot: {
    blockSize: dotSize,
    borderRadius: semanticTokens.radiusFull,
    flexShrink: 0,
    inlineSize: dotSize,
  },
  info: {backgroundColor: semanticTokens.statusInfoText},
  success: {backgroundColor: semanticTokens.statusSuccessText},
  warning: {backgroundColor: semanticTokens.statusWarningText},
  danger: {backgroundColor: semanticTokens.statusDangerText},
  message: {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    gap: semanticTokens.spacingXs,
    minWidth: 0,
  },
  // Two ranks of ink instead of two faces. A notification is one line long
  // often enough that a heading face on top of it reads as a headline.
  title: {
    color: semanticTokens.colorText,
    fontFamily: semanticTokens.fontFamilyBody,
    fontSize: semanticTokens.fontSizeSm,
    letterSpacing: semanticTokens.letterSpacingBody,
    lineHeight: semanticTokens.lineHeightBody,
    margin: 0,
  },
  description: {
    color: semanticTokens.colorTextMuted,
    fontFamily: semanticTokens.fontFamilyBody,
    fontSize: semanticTokens.fontSizeSm,
    letterSpacing: semanticTokens.letterSpacingBody,
    lineHeight: semanticTokens.lineHeightBody,
    margin: 0,
  },
  action: {
    alignItems: 'center',
    display: 'flex',
    flexShrink: 0,
    gap: semanticTokens.spacingSm,
  },
});

/** Props for one notification surface. */
export interface ToastProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'children' | 'className' | 'role' | 'title'
> {
  readonly action?: ReactNode;
  readonly description?: ReactNode;
  readonly title: ReactNode;
  readonly tone?: StatusTone;
}

/** Renders one notification. Use `useToast` rather than placing these by hand. */
export function Toast({
  action,
  description,
  title,
  tone = 'info',
  ...props
}: ToastProps) {
  const isDanger = tone === 'danger';

  return (
    <div
      {...props}
      aria-live={isDanger ? 'assertive' : 'polite'}
      role={isDanger ? 'alert' : 'status'}
      {...stylex.props(styles.toast)}
    >
      <span aria-hidden="true" {...stylex.props(styles.dot, styles[tone])} />
      <div {...stylex.props(styles.message)}>
        <p {...stylex.props(styles.title)}>{title}</p>
        {description === undefined ? null : (
          <p {...stylex.props(styles.description)}>{description}</p>
        )}
      </div>
      {action === undefined ? null : (
        <div {...stylex.props(styles.action)}>{action}</div>
      )}
    </div>
  );
}

/** A notification request handed to `useToast().show`. */
export interface ToastOptions {
  readonly action?: ReactNode;
  readonly description?: ReactNode;
  readonly duration?: number;
  readonly title: ReactNode;
  readonly tone?: StatusTone;
}

interface ToastRecord extends ToastOptions {
  readonly id: string;
}

/** The notification queue exposed to descendants. */
export interface ToastContextValue {
  readonly dismiss: (id: string) => void;
  readonly show: (toast: ToastOptions) => string;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

/** Props for the notification queue host. */
export interface ToastProviderProps {
  readonly children: ReactNode;
  readonly label?: string;
}

/**
 * Hosts the notification queue and its live region. Place one near the root of
 * a host application; notifications are requested through `useToast`.
 */
export function ToastProvider({
  children,
  label = 'Notifications',
}: ToastProviderProps) {
  const [toasts, setToasts] = useState<readonly ToastRecord[]>([]);
  const nextId = useRef(0);
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>());

  const dismiss = useCallback((id: string) => {
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const show = useCallback(
    (toast: ToastOptions) => {
      nextId.current += 1;
      const id = `toast-${nextId.current}`;
      setToasts((current) => [...current, {...toast, id}]);

      const duration = toast.duration ?? 5000;
      if (duration > 0) {
        timers.current.set(
          id,
          setTimeout(() => {
            dismiss(id);
          }, duration),
        );
      }

      return id;
    },
    [dismiss],
  );

  const pending = timers.current;
  useEffect(
    () => () => {
      for (const timer of pending.values()) {
        clearTimeout(timer);
      }
      pending.clear();
    },
    [pending],
  );

  const value = useMemo(() => ({dismiss, show}), [dismiss, show]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Layer>
        <div
          aria-label={label}
          aria-live="polite"
          role="region"
          {...stylex.props(styles.region)}
        >
          {toasts.map((toast) => (
            <Toast
              action={toast.action}
              description={toast.description}
              key={toast.id}
              title={toast.title}
              tone={toast.tone}
            />
          ))}
        </div>
      </Layer>
    </ToastContext.Provider>
  );
}

/** Reads the notification queue. Throws when no `ToastProvider` is above it. */
export function useToast(): ToastContextValue {
  const value = useContext(ToastContext);
  if (!value) {
    throw new Error('useToast must be used within a ToastProvider.');
  }
  return value;
}
