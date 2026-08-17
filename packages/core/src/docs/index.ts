import {cardDoc} from '../components/Card.doc.js';
import {cardFooterDoc} from '../components/CardFooter.doc.js';
import {cardHeaderDoc} from '../components/CardHeader.doc.js';
import {centerDoc} from '../components/Center.doc.js';
import {dividerDoc} from '../components/Divider.doc.js';
import {gridDoc} from '../components/Grid.doc.js';
import {headingDoc} from '../components/Heading.doc.js';
import {sectionDoc} from '../components/Section.doc.js';
import {stackDoc} from '../components/Stack.doc.js';
import {textDoc} from '../components/Text.doc.js';
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
]);
