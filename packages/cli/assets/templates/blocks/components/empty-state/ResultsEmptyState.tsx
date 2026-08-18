import {Button, Card, EmptyState} from '@misoto22/kioku-ui';

interface ResultsEmptyStateProps {
  readonly onCreate?: () => void;
  readonly searched?: boolean;
}

/**
 * Distinguishes "nothing here yet" from "nothing matched", because the two
 * need different next actions.
 */
export function ResultsEmptyState({
  onCreate,
  searched = false,
}: ResultsEmptyStateProps) {
  return (
    <Card>
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
      />
    </Card>
  );
}
