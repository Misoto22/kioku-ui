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
  // An eyebrow, not a title. The label names the control; the value inside the
  // control is the thing being read, and a label set at body size in full ink
  // competes with it down a whole column of fields. Smallest size, opened
  // right up, heading face, second rank of ink — the way every small label in
  // the console is set.
  label: {
    alignItems: 'baseline',
    color: semanticTokens.colorTextSecondary,
    display: 'flex',
    fontFamily: semanticTokens.fontFamilyHeading,
    fontSize: semanticTokens.fontSizeXs,
    fontWeight: semanticTokens.fontWeightMedium,
    gap: semanticTokens.spacingSm,
    justifyContent: 'space-between',
    letterSpacing: semanticTokens.letterSpacingEyebrow,
    lineHeight: semanticTokens.lineHeightHeading,
  },
  // An eyebrow: the smallest size, opened right up, in the heading face and the
  // context rank of ink. "(required)" qualifies the label — it must not read as
  // a second label, and at label size and tracking it did.
  annotation: {
    color: semanticTokens.colorTextMuted,
    fontFamily: semanticTokens.fontFamilyHeading,
    fontSize: semanticTokens.fontSizeXs,
    fontWeight: semanticTokens.fontWeightRegular,
    letterSpacing: semanticTokens.letterSpacingEyebrow,
    lineHeight: semanticTokens.lineHeightHeading,
  },
  // A description and a status are sentences, so they are set solid and lead
  // like body copy rather than tracked out like a label.
  message: {
    fontFamily: semanticTokens.fontFamilyBody,
    fontSize: semanticTokens.fontSizeSm,
    letterSpacing: semanticTokens.letterSpacingBody,
    lineHeight: semanticTokens.lineHeightBody,
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
