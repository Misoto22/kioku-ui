import * as stylex from '@stylexjs/stylex';
import {
  createContext,
  useContext,
  useId,
  type HTMLAttributes,
  type ReactNode,
} from 'react';

import {semanticTokens} from '../authoring.stylex.js';
import type {StatusTone} from '../Badge/index.js';

interface FieldContextValue {
  readonly controlId: string;
  readonly describedBy: string | undefined;
  readonly invalid: boolean;
  readonly required: boolean;
}

const FieldContext = createContext<FieldContextValue | null>(null);

const styles = stylex.create({
  root: {display: 'grid', gap: semanticTokens.spacingXs},
  label: {
    alignItems: 'baseline',
    color: semanticTokens.colorText,
    display: 'flex',
    fontFamily: semanticTokens.fontFamilyBody,
    fontSize: semanticTokens.fontSizeSm,
    letterSpacing: semanticTokens.letterSpacingLabel,
    fontWeight: semanticTokens.fontWeightMedium,
    gap: semanticTokens.spacingSm,
    justifyContent: 'space-between',
  },
  annotation: {
    color: semanticTokens.colorTextMuted,
    fontWeight: semanticTokens.fontWeightRegular,
  },
  message: {
    fontFamily: semanticTokens.fontFamilyBody,
    fontSize: semanticTokens.fontSizeSm,
    letterSpacing: semanticTokens.letterSpacingLabel,
    margin: 0,
  },
  description: {color: semanticTokens.colorTextSecondary},
  info: {color: semanticTokens.statusInfoText},
  success: {color: semanticTokens.statusSuccessText},
  warning: {color: semanticTokens.statusWarningText},
  danger: {color: semanticTokens.statusDangerText},
});

/** Native requirement metadata displayed alongside the field label. */
export type FieldNecessity = 'required' | 'optional';

export interface FieldProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'className'
> {
  readonly controlId?: string;
  readonly description?: ReactNode;
  readonly label: ReactNode;
  readonly necessity?: FieldNecessity;
  readonly status?: ReactNode;
  readonly statusTone?: StatusTone;
}

export function Field({
  children,
  controlId,
  description,
  label,
  necessity,
  status,
  statusTone = 'danger',
  ...props
}: FieldProps) {
  const generatedId = useId();
  const resolvedControlId = controlId ?? `${generatedId}-control`;
  const descriptionId = description ? `${generatedId}-description` : undefined;
  const statusId = status ? `${generatedId}-status` : undefined;
  const describedBy =
    [descriptionId, statusId].filter(Boolean).join(' ') || undefined;

  return (
    <FieldContext.Provider
      value={{
        controlId: resolvedControlId,
        describedBy,
        invalid: Boolean(status && statusTone === 'danger'),
        required: necessity === 'required',
      }}
    >
      <div {...props} {...stylex.props(styles.root)}>
        <label htmlFor={resolvedControlId} {...stylex.props(styles.label)}>
          <span>{label}</span>
          {necessity ? (
            <span
              {...stylex.props(styles.annotation)}
            >{` (${necessity})`}</span>
          ) : null}
        </label>
        {children}
        {description ? (
          <p
            id={descriptionId}
            {...stylex.props(styles.message, styles.description)}
          >
            {description}
          </p>
        ) : null}
        {status ? (
          <p
            aria-live={statusTone === 'danger' ? 'assertive' : 'polite'}
            id={statusId}
            role={statusTone === 'danger' ? 'alert' : 'status'}
            {...stylex.props(styles.message, styles[statusTone])}
          >
            {status}
          </p>
        ) : null}
      </div>
    </FieldContext.Provider>
  );
}

export function useFieldControl() {
  return useContext(FieldContext);
}
