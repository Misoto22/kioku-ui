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

const styles = stylex.create({
  region: {
    bottom: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: semanticTokens.spacingSm,
    insetInlineEnd: 0,
    maxWidth: '24rem',
    padding: semanticTokens.spacingLg,
    pointerEvents: 'none',
    position: 'fixed',
    width: '100%',
  },
  toast: {
    borderColor: semanticTokens.borderDefault,
    borderRadius: semanticTokens.radiusContainer,
    borderStyle: semanticTokens.borderStyle,
    borderWidth: semanticTokens.borderWidth,
    boxShadow: semanticTokens.elevationMedium,
    display: 'flex',
    flexDirection: 'column',
    fontFamily: semanticTokens.fontFamilyBody,
    gap: semanticTokens.spacingXs,
    padding: semanticTokens.spacingMd,
    pointerEvents: 'auto',
  },
  info: {
    backgroundColor: semanticTokens.statusInfoSurface,
    color: semanticTokens.statusInfoText,
  },
  success: {
    backgroundColor: semanticTokens.statusSuccessSurface,
    color: semanticTokens.statusSuccessText,
  },
  warning: {
    backgroundColor: semanticTokens.statusWarningSurface,
    color: semanticTokens.statusWarningText,
  },
  danger: {
    backgroundColor: semanticTokens.statusDangerSurface,
    color: semanticTokens.statusDangerText,
  },
  title: {
    fontSize: semanticTokens.fontSizeMd,
    fontWeight: semanticTokens.fontWeightMedium,
    lineHeight: semanticTokens.lineHeightBody,
    margin: 0,
  },
  description: {
    fontSize: semanticTokens.fontSizeSm,
    lineHeight: semanticTokens.lineHeightBody,
    margin: 0,
  },
  action: {
    display: 'flex',
    gap: semanticTokens.spacingSm,
    justifyContent: 'flex-end',
  },
});

/** Props for one notification surface. */
export interface ToastProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'children' | 'className' | 'title'
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
  return (
    <div {...props} {...stylex.props(styles.toast, styles[tone])}>
      <p {...stylex.props(styles.title)}>{title}</p>
      {description === undefined ? null : (
        <p {...stylex.props(styles.description)}>{description}</p>
      )}
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
