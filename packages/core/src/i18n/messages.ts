/** Every string the system speaks on a host application's behalf. */
export interface Messages {
  readonly calendarNextMonth: string;
  readonly calendarPreviousMonth: string;
  readonly carouselNext: string;
  readonly carouselPrevious: string;
  readonly chatWaitingForReply: string;
  readonly close: string;
  readonly commandPaletteEmpty: string;
  readonly commandPalettePlaceholder: string;
  readonly fileInputEmpty: string;
  readonly paginationNext: string;
  readonly paginationPrevious: string;
  readonly remove: string;
  readonly resizeHandle: string;
  readonly skipToContent: string;
  readonly typeaheadEmpty: string;
}

/**
 * The built-in English strings. A host that ships another language supplies a
 * full replacement rather than a patch, so a missing key is a type error
 * instead of an English word appearing mid-sentence.
 */
export const defaultMessages: Messages = Object.freeze({
  calendarNextMonth: 'Next month',
  calendarPreviousMonth: 'Previous month',
  carouselNext: 'Next',
  carouselPrevious: 'Previous',
  chatWaitingForReply: 'Waiting for a reply',
  close: 'Close',
  commandPaletteEmpty: 'No commands match',
  commandPalettePlaceholder: 'Search commands',
  fileInputEmpty: 'No file selected',
  paginationNext: 'Next page',
  paginationPrevious: 'Previous page',
  remove: 'Remove',
  resizeHandle: 'Resize panel',
  skipToContent: 'Skip to main content',
  typeaheadEmpty: 'No matches',
});
