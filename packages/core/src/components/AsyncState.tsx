import type {ReactNode} from 'react';

import {Alert} from './Alert.js';
import {EmptyState} from './EmptyState.js';
import {Spinner} from './Spinner.js';

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

export interface AsyncStateProps<T> {
  readonly children?: (data: T) => ReactNode;
  readonly state: AsyncStateValue<T>;
}

export function AsyncState<T>({children, state}: AsyncStateProps<T>) {
  if (state.kind === 'loading') {
    return <Spinner label={state.label ?? 'Loading'} />;
  }

  if (state.kind === 'empty') {
    return (
      <EmptyState
        action={state.action}
        detail={state.detail}
        title={state.title}
      />
    );
  }

  if (state.kind === 'error') {
    return (
      <Alert tone="danger">
        <div>{state.title}</div>
        {state.detail ? <div>{state.detail}</div> : null}
        {state.retry}
      </Alert>
    );
  }

  return children?.(state.data) ?? null;
}
