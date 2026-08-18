import {DialogSurface, type DialogProps} from '../Dialog/index.js';

/** Props for a decision the reader must resolve before continuing. */
export type AlertDialogProps = Omit<DialogProps, 'dismissOnOutsideClick'>;

/**
 * Asks for a decision that cannot be deferred. Unlike Dialog, a click on the
 * scrim does not dismiss it — the reader must choose one of the actions.
 */
export function AlertDialog(props: AlertDialogProps) {
  return (
    <DialogSurface
      {...props}
      dismissOnOutsideClick={false}
      role="alertdialog"
    />
  );
}
