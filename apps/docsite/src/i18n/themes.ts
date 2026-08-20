import type {Catalogue} from './locale.js';
import {themesEn} from './themes.en.js';
import {themesZh} from './themes.zh.js';

/**
 * A sentence with one run of code set into it.
 *
 * The code is not copy. Every figure the glass skin quotes — the tint it
 * keeps, the clamp a raised surface takes, the filter on the frost — is read
 * back off the stylesheet at render, so no translation can disagree with what
 * the theme actually does.
 */
export interface ThemesSplitSentence {
  readonly label: string;
  readonly lead: string;
  readonly tail: string;
}

/** The six roles that decide how a skin reads at a glance. */
export interface ThemesRoleLabels {
  readonly accent: string;
  readonly edge: string;
  readonly ground: string;
  readonly ink: string;
  readonly paper: string;
  readonly sunken: string;
}

/** The three states a release can be in, named once and used everywhere. */
export interface ThemesStatuses {
  readonly open: string;
  readonly published: string;
  readonly review: string;
}

/** The themes page, in one language. */
export interface ThemesCopy {
  readonly appearance: {
    readonly dark: string;
    readonly label: string;
    readonly light: string;
    readonly system: string;
  };
  readonly density: {
    readonly compact: string;
    readonly label: string;
    readonly standard: string;
  };
  readonly eyebrow: string;
  readonly glass: {
    readonly backdrops: {readonly label: string; readonly detail: string};
    readonly blur: ThemesSplitSentence;
    readonly label: string;
    readonly lever: ThemesSplitSentence;
    readonly rule: string;
    readonly tint: ThemesSplitSentence;
  };
  readonly groups: {
    readonly count: (groups: number) => string;
    readonly label: string;
    readonly note: string;
    readonly total: string;
  };
  readonly lead: string;
  readonly sample: {
    readonly cancel: string;
    readonly label: (skin: string) => string;
    readonly live: string;
    readonly liveNote: string;
    readonly note: string;
    readonly owner: string;
    readonly publish: string;
    readonly release: (index: number) => string;
    readonly releaseTitle: string;
    readonly releasesHeading: string;
    readonly status: string;
    readonly version: string;
  };
  readonly skins: {
    readonly inUse: string;
    readonly label: string;
    readonly note: (skins: number, roles: number) => string;
    readonly notes: Readonly<Record<string, string>>;
    readonly roles: ThemesRoleLabels;
    readonly solidFooter: (roles: number) => string;
    readonly tintFooter: {
      readonly emphasis: string;
      readonly lead: (tints: number) => string;
      readonly tail: string;
    };
    readonly valueChip: string;
  };
  readonly spacingLabel: string;
  readonly statuses: ThemesStatuses;
  readonly title: string;
  readonly type: {
    readonly label: string;
    readonly note: string;
    readonly roles: {
      readonly body: string;
      readonly eyebrow: string;
      readonly label: string;
      readonly pageTitle: string;
      readonly section: string;
      readonly subsection: string;
    };
  };
}

export const themes: Catalogue<ThemesCopy> = {en: themesEn, zh: themesZh};
