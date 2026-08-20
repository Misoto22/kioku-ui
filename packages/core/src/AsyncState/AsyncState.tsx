import * as stylex from '@stylexjs/stylex';
import type {ReactNode} from 'react';

import {Alert} from '../Alert/index.js';
import {semanticTokens} from '../authoring.stylex.js';
import {EmptyStateContent} from '../EmptyState/index.js';
import {SpinnerVisual} from '../Spinner/index.js';

const styles = stylex.create({
  // Loading and empty are the same block at two moments, so they are the same
  // plate: `EmptyState`'s. Waiting used to be a bare 14px ring on nothing at
  // all, which meant the region collapsed to the height of a ring and sprang
  // back the instant the data landed — the reader watched the page move twice
  // for something whose size never changed.
  plate: {
    alignItems: 'center',
    backgroundColor: semanticTokens.colorSurface,
    borderRadius: semanticTokens.radiusContainer,
    boxShadow: semanticTokens.elevationMedium,
    color: semanticTokens.colorText,
    display: 'flex',
    flexDirection: 'column',
    fontFamily: semanticTokens.fontFamilyBody,
    gap: semanticTokens.spacingSm,
    paddingBlockEnd: semanticTokens.spacingXl,
    paddingBlockStart: semanticTokens.spacing2xl,
    paddingInline: semanticTokens.spacing2xl,
    textAlign: 'center',
  },
  // What is being waited for, said once. The live region already carries the
  // same words as its accessible name, so this copy is for the eye only.
  label: {
    color: semanticTokens.colorTextSecondary,
    fontFamily: semanticTokens.fontFamilyBody,
    fontSize: semanticTokens.fontSizeSm,
    letterSpacing: semanticTokens.letterSpacingBody,
    lineHeight: semanticTokens.lineHeightBody,
  },
});

export type AsyncStateValue<T> =
  | {readonly kind: 'loading'; readonly label?: string}
  | {
      readonly kind: 'empty';
      readonly title: ReactNode;
      readonly detail?: ReactNode;
      readonly action?: ReactNode;
    }
  | {
      readonly kind: 'error';
      readonly title: ReactNode;
      readonly detail?: ReactNode;
      readonly retry?: ReactNode;
    }
  | {readonly kind: 'ready'; readonly data: T};

type PendingAsyncStateValue<T> = Exclude<AsyncStateValue<T>, {kind: 'ready'}>;

export type AsyncStateProps<T> =
  | {
      readonly children: (data: T) => ReactNode;
      readonly state: AsyncStateValue<T>;
    }
  | {
      readonly children?: never;
      readonly state: PendingAsyncStateValue<T>;
    };

export function AsyncState<T>({children, state}: AsyncStateProps<T>) {
  if (state.kind === 'ready' && !children) {
    throw new Error('AsyncState requires a renderer for ready data');
  }

  const loadingLabel =
    state.kind === 'loading' ? (state.label ?? 'Loading') : undefined;
  const statusContent =
    state.kind === 'loading' ? (
      <div {...stylex.props(styles.plate)}>
        <SpinnerVisual />
        {state.label === undefined ? null : (
          <span aria-hidden="true" {...stylex.props(styles.label)}>
            {state.label}
          </span>
        )}
      </div>
    ) : state.kind === 'empty' ? (
      <EmptyStateContent
        action={state.action}
        detail={state.detail}
        title={state.title}
      />
    ) : state.kind === 'ready' ? (
      children!(state.data)
    ) : null;

  return (
    <>
      <div
        aria-atomic="true"
        aria-busy={state.kind === 'loading'}
        aria-label={loadingLabel}
        aria-live="polite"
        role="status"
      >
        {statusContent}
      </div>
      {state.kind === 'error' ? (
        <Alert tone="danger">
          <div>{state.title}</div>
          {state.detail ? <div>{state.detail}</div> : null}
          {state.retry}
        </Alert>
      ) : null}
    </>
  );
}
