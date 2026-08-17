import {alertDoc} from '../components/Alert.doc.js';
import {asyncStateDoc} from '../components/AsyncState.doc.js';
import {badgeDoc} from '../components/Badge.doc.js';
import {buttonDoc} from '../components/Button.doc.js';
import {cardDoc} from '../components/Card.doc.js';
import {cardFooterDoc} from '../components/CardFooter.doc.js';
import {cardHeaderDoc} from '../components/CardHeader.doc.js';
import {centerDoc} from '../components/Center.doc.js';
import {dividerDoc} from '../components/Divider.doc.js';
import {emptyStateDoc} from '../components/EmptyState.doc.js';
import {fieldDoc} from '../components/Field.doc.js';
import {gridDoc} from '../components/Grid.doc.js';
import {headingDoc} from '../components/Heading.doc.js';
import {iconButtonDoc} from '../components/IconButton.doc.js';
import {metricGridDoc} from '../components/MetricGrid.doc.js';
import {sectionDoc} from '../components/Section.doc.js';
import {segmentedControlDoc} from '../components/SegmentedControl.doc.js';
import {skeletonDoc} from '../components/Skeleton.doc.js';
import {spinnerDoc} from '../components/Spinner.doc.js';
import {stackDoc} from '../components/Stack.doc.js';
import {statusDotDoc} from '../components/StatusDot.doc.js';
import {tableDoc} from '../components/Table.doc.js';
import {textAreaDoc} from '../components/TextArea.doc.js';
import {textDoc} from '../components/Text.doc.js';
import {textInputDoc} from '../components/TextInput.doc.js';
import {toggleDoc} from '../components/Toggle.doc.js';
import {visuallyHiddenDoc} from '../components/VisuallyHidden.doc.js';
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
  textAreaDoc,
  textInputDoc,
  toggleDoc,
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
  metricGridDoc,
]);
