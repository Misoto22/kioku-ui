import type {ReactNode} from 'react';

import {Alert} from './Alert.js';
import {EmptyStateContent} from './EmptyState.js';
import {SpinnerVisual} from './Spinner.js';

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

type ReadyAsyncStateValue<T> = Extract<AsyncStateValue<T>, {kind: 'ready'}>;
type PendingAsyncStateValue<T> = Exclude<AsyncStateValue<T>, {kind: 'ready'}>;

export type AsyncStateProps<T> =
  | {
      readonly children: (data: T) => ReactNode;
      readonly state: ReadyAsyncStateValue<T>;
    }
  | {
      readonly children?: (data: T) => ReactNode;
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
      <SpinnerVisual />
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
