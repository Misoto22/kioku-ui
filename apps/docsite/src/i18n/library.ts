import {defaultMessages, type Messages} from '@misoto22/kioku-ui';

import {libraryZh} from './library.zh.js';
import type {Catalogue} from './locale.js';

/**
 * Component strings in both languages.
 *
 * English is the library's own set rather than a copy of it. Restating those
 * sixteen words here would be a second place for them to drift, and the
 * library is already the one that knows what its components say.
 */
export const libraryMessages: Catalogue<Messages> = {
  en: defaultMessages,
  zh: libraryZh,
};
