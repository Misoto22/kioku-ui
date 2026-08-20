import {componentDetailEn} from './componentDetail.en.js';
import {componentDetailZh} from './componentDetail.zh.js';
import type {Catalogue} from './locale.js';

/**
 * One component's page.
 *
 * The sentences that carry a `<Code>` run inside them are stored as their
 * parts rather than as one string with a placeholder in it: the page assembles
 * them, so the catalogue stays data a compiler can check and a translator can
 * read without knowing what the braces would have meant.
 */
export interface ComponentDetailCopy {
  readonly breadcrumbRoot: string;
  readonly example: {
    readonly label: string;
    readonly none: string;
    readonly note: string;
  };
  readonly inherited: {
    readonly label: string;
    readonly tail: string;
  };
  readonly noSidecar: {
    readonly lead: (name: string) => string;
    readonly tail: string;
  };
  readonly noSpecimen: {
    readonly detail: (name: string, skins: number) => string;
    readonly title: string;
  };
  readonly noTypeColumn: {
    readonly label: string;
    readonly lead: string;
    readonly tail: string;
  };
  readonly notFound: {
    readonly action: string;
    readonly detail: string;
    readonly title: string;
  };
  readonly openStory: string;
  readonly otherGroups: {
    readonly label: string;
    readonly menu: string;
  };
  readonly props: {
    readonly description: string;
    /**
     * The particles around the two figures in "3 own · 1 inherited set". The
     * figures themselves are the page's, because rule 44 sets them in the mono
     * face and a catalogue string cannot carry a typeface.
     */
    readonly figure: {
      readonly between: string;
      readonly lead: string;
      readonly tail: (inherited: number) => string;
    };
    readonly label: string;
    readonly name: string;
    readonly optional: string;
    readonly required: string;
    readonly requiredColumn: string;
  };
  readonly specimen: {
    readonly label: string;
    readonly themeLabel: string;
  };
  readonly status: {
    readonly planned: string;
    readonly ready: string;
  };
  readonly stories: {
    readonly label: string;
    readonly none: (name: string) => string;
    readonly note: (skins: number) => string;
    readonly open: string;
  };
  readonly viewSource: string;
}

export const componentDetail: Catalogue<ComponentDetailCopy> = {
  en: componentDetailEn,
  zh: componentDetailZh,
};
