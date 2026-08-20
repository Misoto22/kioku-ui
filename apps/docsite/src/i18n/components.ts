import {componentsEn} from './components.en.js';
import {componentsZh} from './components.zh.js';
import type {Catalogue} from './locale.js';

/**
 * The component library index.
 *
 * `groups` is keyed by the catalogue's own English group title rather than by
 * a slug, because the catalogue is the register of what a group is called and
 * a second list of keys here could only fall out of step with it. A title the
 * map has no entry for falls back to itself, so adding a group shows an
 * untranslated word rather than a blank.
 */
export interface ComponentsCopy {
  readonly accessibility: {
    readonly audit: (skins: number) => string;
    readonly label: string;
  };
  readonly empty: {
    readonly clearSearch: string;
    readonly detailInGroup: string;
    readonly detailOverall: string;
    readonly showEveryGroup: string;
    readonly title: string;
  };
  readonly everything: string;
  readonly groupMenu: (group: string) => string;
  readonly groups: Readonly<Record<string, string>>;
  readonly groupsLabel: string;
  readonly inLibrary: {
    readonly label: string;
    readonly note: string;
  };
  readonly intro: string;
  readonly matches: (count: number, query: string) => string;
  readonly openStorybook: string;
  readonly search: string;
  /**
   * The parts around the three figures in "130 of 130 shown · 11 groups". The
   * figures are the page's to set — rule 44 puts them in the mono face — so
   * the catalogue holds only the particles between them, which is what each
   * language actually owns.
   */
  readonly shown: {
    readonly lead: string;
    readonly ofTotal: string;
    readonly thenGroups: string;
    readonly tail: (groups: number) => string;
  };
  readonly startHere: string;
  readonly title: string;
}

export const components: Catalogue<ComponentsCopy> = {
  en: componentsEn,
  zh: componentsZh,
};
