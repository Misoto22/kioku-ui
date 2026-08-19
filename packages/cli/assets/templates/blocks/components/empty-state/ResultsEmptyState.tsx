import {Box, Button, EmptyState, Icon} from '@misoto22/kioku-ui';

interface ResultsEmptyStateProps {
  readonly onCreate?: () => void;
  readonly searched?: boolean;
}

/**
 * Distinguishes "nothing here yet" from "nothing matched", because the two
 * need different next actions.
 *
 * `EmptyState` already draws its own plate — surface, hairline, its own inset —
 * so this block does not wrap it in a `Card`. Two plates would draw the ring
 * twice. The glyph sits in a sunken well of the same 3px corner, which is how
 * this system holds a mark that is not itself a control.
 */
export function ResultsEmptyState({
  onCreate,
  searched = false,
}: ResultsEmptyStateProps) {
  return (
    <EmptyState
      {...(searched
        ? {}
        : {action: <Button onClick={onCreate}>Create the first one</Button>})}
      detail={
        searched
          ? 'Try a broader search or clear a filter.'
          : 'Anything you create will appear here.'
      }
      title={searched ? 'No matches' : 'Nothing here yet'}
      visual={
        <Box bordered padding="sm" radius="element" surface="muted">
          <Icon size="lg" tone="secondary">
            {searched ? (
              <>
                <circle
                  cx="10.5"
                  cy="10.5"
                  fill="none"
                  r="6.4"
                  stroke="currentColor"
                  strokeWidth="1.8"
                />
                <path
                  d="m15.3 15.3 4.7 4.7"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                />
              </>
            ) : (
              <>
                <path
                  d="M3 14.3h4.8l1.5 3h5.4l1.5-3H21"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.8"
                />
                <path
                  d="M3 14.3 5.6 5.3a1.5 1.5 0 0 1 1.4-1h10a1.5 1.5 0 0 1 1.4 1l2.6 9v4.5a1.5 1.5 0 0 1-1.5 1.5H4.5A1.5 1.5 0 0 1 3 18.8v-4.5Z"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.8"
                />
              </>
            )}
          </Icon>
        </Box>
      }
    />
  );
}
