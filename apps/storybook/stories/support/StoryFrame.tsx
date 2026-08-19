import type {CSSProperties, ReactNode} from 'react';

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

/*
 * A specimen plate, not a grid of loose samples. Two switches spread across a
 * 64rem row read as a component adrift in an empty canvas; the same two inside
 * a plate that hugs them read as a set someone laid out. The plate takes its
 * own colour from the hairline token and lets the cell backgrounds cover it,
 * so the rules between cells are drawn by the gap rather than by a border on
 * every cell — the device the console uses for its own tiled figures.
 */
const plateStyle: CSSProperties = {
  backgroundColor: 'var(--kioku-ui-border-default)',
  borderRadius: 'var(--kioku-ui-radius-container)',
  boxShadow: 'var(--kioku-ui-elevation-low)',
  display: 'flex',
  flexWrap: 'wrap',
  gap: '1px',
  maxWidth: '100%',
  overflow: 'hidden',
  width: 'fit-content',
};

const cellStyle: CSSProperties = {
  backgroundColor: 'var(--kioku-ui-color-surface)',
  display: 'grid',
  gap: 'var(--kioku-ui-spacing-md)',
  justifyItems: 'start',
  minWidth: '11rem',
  padding: 'var(--kioku-ui-spacing-lg)',
};

// The label is an eyebrow: smallest size, opened right up, secondary ink. It
// names the specimen without competing with it.
const labelStyle: CSSProperties = {
  color: 'var(--kioku-ui-color-text-secondary)',
  fontFamily: 'var(--kioku-ui-typography-font-family-heading)',
  fontSize: 'var(--kioku-ui-typography-font-size-xs)',
  letterSpacing: 'var(--kioku-ui-typography-letter-spacing-eyebrow)',
  lineHeight: 'var(--kioku-ui-typography-line-height-heading)',
  margin: 0,
};

export function ConstrainedFrame({children}: FrameProps) {
  return <div style={constrainedStyle}>{children}</div>;
}

export function DemoFrame({children}: FrameProps) {
  return <div style={demoStyle}>{children}</div>;
}

export function StateGrid({items}: {readonly items: readonly StateGridItem[]}) {
  return (
    <div style={plateStyle}>
      {items.map(({content, label}) => (
        <div key={label} style={cellStyle}>
          <p style={labelStyle}>{label}</p>
          <div>{content}</div>
        </div>
      ))}
    </div>
  );
}
