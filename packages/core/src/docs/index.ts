import {alertDoc} from '../Alert/Alert.doc.js';
import {asyncStateDoc} from '../AsyncState/AsyncState.doc.js';
import {badgeDoc} from '../Badge/Badge.doc.js';
import {buttonDoc} from '../Button/Button.doc.js';
import {cardDoc} from '../Card/Card.doc.js';
import {cardFooterDoc} from '../CardFooter/CardFooter.doc.js';
import {cardHeaderDoc} from '../CardHeader/CardHeader.doc.js';
import {centerDoc} from '../Center/Center.doc.js';
import {dividerDoc} from '../Divider/Divider.doc.js';
import {emptyStateDoc} from '../EmptyState/EmptyState.doc.js';
import {fieldDoc} from '../Field/Field.doc.js';
import {gridDoc} from '../Grid/Grid.doc.js';
import {headingDoc} from '../Heading/Heading.doc.js';
import {iconButtonDoc} from '../IconButton/IconButton.doc.js';
import {metricGridDoc} from '../MetricGrid/MetricGrid.doc.js';
import {sectionDoc} from '../Section/Section.doc.js';
import {segmentedControlDoc} from '../SegmentedControl/SegmentedControl.doc.js';
import {skeletonDoc} from '../Skeleton/Skeleton.doc.js';
import {spinnerDoc} from '../Spinner/Spinner.doc.js';
import {stackDoc} from '../Stack/Stack.doc.js';
import {statusDotDoc} from '../StatusDot/StatusDot.doc.js';
import {
  tableBodyDoc,
  tableCaptionDoc,
  tableCellDoc,
  tableDoc,
  tableHeadDoc,
  tableHeaderCellDoc,
  tableRowDoc,
} from '../Table/Table.doc.js';
import {textAreaDoc} from '../TextArea/TextArea.doc.js';
import {textDoc} from '../Text/Text.doc.js';
import {textInputDoc} from '../TextInput/TextInput.doc.js';
import {toggleDoc} from '../Toggle/Toggle.doc.js';
import {visuallyHiddenDoc} from '../VisuallyHidden/VisuallyHidden.doc.js';
import {linkDoc, linkProviderDoc} from '../navigation/LinkProvider.doc.js';
import {themeProviderDoc} from '../theme/Theme.doc.js';
import type {ComponentDoc} from './types.js';

export {
  cardDoc,
  cardFooterDoc,
  cardHeaderDoc,
  centerDoc,
  dividerDoc,
  gridDoc,
  headingDoc,
  sectionDoc,
  stackDoc,
  textDoc,
  visuallyHiddenDoc,
  alertDoc,
  asyncStateDoc,
  badgeDoc,
  buttonDoc,
  emptyStateDoc,
  fieldDoc,
  iconButtonDoc,
  metricGridDoc,
  segmentedControlDoc,
  skeletonDoc,
  spinnerDoc,
  statusDotDoc,
  tableDoc,
  tableCaptionDoc,
  tableHeadDoc,
  tableBodyDoc,
  tableRowDoc,
  tableHeaderCellDoc,
  tableCellDoc,
  textAreaDoc,
  textInputDoc,
  toggleDoc,
  linkDoc,
  linkProviderDoc,
  themeProviderDoc,
};
export {
  validateComponentDoc,
  type ComponentDoc,
  type ComponentDocField,
  type ComponentDocProp,
} from './types.js';

export const componentDocs: readonly ComponentDoc[] = Object.freeze([
  textDoc,
  headingDoc,
  stackDoc,
  gridDoc,
  sectionDoc,
  cardDoc,
  cardHeaderDoc,
  cardFooterDoc,
  dividerDoc,
  centerDoc,
  visuallyHiddenDoc,
  buttonDoc,
  iconButtonDoc,
  badgeDoc,
  statusDotDoc,
  fieldDoc,
  textInputDoc,
  textAreaDoc,
  toggleDoc,
  segmentedControlDoc,
  emptyStateDoc,
  asyncStateDoc,
  spinnerDoc,
  skeletonDoc,
  alertDoc,
  tableDoc,
  tableCaptionDoc,
  tableHeadDoc,
  tableBodyDoc,
  tableRowDoc,
  tableHeaderCellDoc,
  tableCellDoc,
  metricGridDoc,
  linkDoc,
  linkProviderDoc,
  themeProviderDoc,
]);
