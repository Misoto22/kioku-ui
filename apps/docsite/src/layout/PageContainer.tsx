import type {ReactNode} from 'react';

/**
 * The measure the banner, the pages and the footer are all held to, so their
 * edges line up down the whole site.
 *
 * A width is the one dimension the token contract has no role for, so it is
 * built from the spacing scale rather than written as a literal — which also
 * means it grows with the density the reader chose.
 */
export const pageMeasure = 'calc(44 * var(--kioku-ui-spacing-2xl))';

/** The narrower measure prose is held to, for the same reason. */
const proseMeasure = 'calc(26 * var(--kioku-ui-spacing-2xl))';

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
        maxWidth: width === 'narrow' ? proseMeasure : pageMeasure,
        paddingBlock: 'var(--kioku-ui-spacing-2xl)',
        paddingInline: 'var(--kioku-ui-spacing-2xl)',
        width: '100%',
      }}
    >
      {children}
    </div>
  );
}
