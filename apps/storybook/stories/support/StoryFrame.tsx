import type {CSSProperties, ReactNode} from 'react';

import {Stack, Text} from '@misoto22/kioku-ui';

interface FrameProps {
  readonly children: ReactNode;
}

interface StateGridItem {
  readonly content: ReactNode;
  readonly label: string;
}

const constrainedStyle: CSSProperties = {
  maxWidth: '320px',
  width: '100%',
};

const demoStyle: CSSProperties = {
  maxWidth: '64rem',
  width: '100%',
};

const stateGridStyle: CSSProperties = {
  display: 'grid',
  gap: 'var(--kioku-ui-spacing-lg)',
  gridTemplateColumns: 'repeat(auto-fit, minmax(14rem, 1fr))',
};

export function ConstrainedFrame({children}: FrameProps) {
  return <div style={constrainedStyle}>{children}</div>;
}

export function DemoFrame({children}: FrameProps) {
  return <div style={demoStyle}>{children}</div>;
}

export function StateGrid({items}: {readonly items: readonly StateGridItem[]}) {
  return (
    <div style={stateGridStyle}>
      {items.map(({content, label}) => (
        <Stack gap="sm" key={label}>
          <Text size="sm" tone="muted">
            {label}
          </Text>
          <div>{content}</div>
        </Stack>
      ))}
    </div>
  );
}
