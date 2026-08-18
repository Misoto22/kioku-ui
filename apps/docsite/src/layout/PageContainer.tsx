import type {ReactNode} from 'react';

/** How wide a page's content is allowed to grow. */
export type ContainerWidth = 'narrow' | 'wide';

interface PageContainerProps {
  readonly children: ReactNode;
  readonly width?: ContainerWidth;
}

/**
 * Holds page content to a readable measure and keeps the gutters consistent
 * between pages. Without this every page grows to the viewport, and on a wide
 * screen a paragraph runs past the ~75 characters a reader can track back
 * from at the end of a line.
 *
 * `narrow` is for prose; `wide` is for galleries, where the limit exists to
 * stop cards stretching rather than to hold a line length.
 */
export function PageContainer({children, width = 'wide'}: PageContainerProps) {
  return (
    <div
      style={{
        marginInline: 'auto',
        maxWidth: width === 'narrow' ? '46rem' : '76rem',
        paddingBlock: 'var(--kioku-ui-spacing-2xl)',
        paddingInline: 'var(--kioku-ui-spacing-lg)',
        width: '100%',
      }}
    >
      {children}
    </div>
  );
}
