import type {ColorMode} from '@misoto22/kioku-ui';

import {chromeEn} from './chrome.en.js';
import {chromeZh} from './chrome.zh.js';
import type {Catalogue} from './locale.js';
import type {Route} from '../router.js';

/**
 * The words in the banner and the footer — everything that frames a page
 * rather than belonging to one.
 *
 * Interpolation is a function taking the values it needs. A catalogue of
 * strings with `{0}` in them needs a formatter and a set of rules about what
 * the braces mean; a function needs neither, and the compiler checks the call.
 */
export interface ChromeCopy {
  readonly appearance: {
    readonly label: string;
    readonly options: Readonly<Record<ColorMode, string>>;
    readonly trigger: (value: string) => string;
  };
  readonly destinations: Readonly<Record<Exclude<Route, 'home'>, string>>;
  readonly footer: {
    readonly issues: string;
    readonly release: string;
  };
  readonly language: {
    readonly label: string;
    readonly trigger: (value: string) => string;
  };
  readonly navigation: {
    readonly open: string;
    readonly primary: string;
  };
  readonly repository: string;
  readonly skin: {
    readonly label: string;
    readonly trigger: (value: string) => string;
  };
}

/**
 * The language menu's own options are not in here. They are autonyms —
 * `localeNames` — and read the same in either locale, because the reader who
 * needs that menu is the one who cannot read the page it sits on.
 */
export const chrome: Catalogue<ChromeCopy> = {en: chromeEn, zh: chromeZh};
