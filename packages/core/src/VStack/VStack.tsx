import {Stack, type StackProps} from '../Stack/index.js';

/** Props for a column of evenly spaced children. */
export type VStackProps = StackProps;

/**
 * Arranges children in a column. It is an alias for `Stack`, kept so a layout
 * written with `HStack` reads symmetrically.
 */
export function VStack(props: VStackProps) {
  return <Stack {...props} />;
}
