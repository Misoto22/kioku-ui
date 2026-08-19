import {homeEn} from './home.en.js';
import {homeZh} from './home.zh.js';
import type {Catalogue} from './locale.js';

/** The roles the palette card names, in the order the card reads them. */
export type PaletteRole =
  | 'accent'
  | 'ground'
  | 'hairline'
  | 'hover'
  | 'ink'
  | 'muted'
  | 'paper'
  | 'secondary'
  | 'strong'
  | 'sunken';

/**
 * A sentence with one word under stress.
 *
 * Stored in three parts rather than as one string with markup in it, so the
 * punctuation can stay outside the emphasis: English closes with a full stop
 * that is not italic, and a Chinese 。 takes no 着重号 either.
 */
export interface Stressed {
  readonly after: string;
  readonly before: string;
  readonly emphasis: string;
}

/**
 * The landing page in one language.
 *
 * `boundaries` is optional and only Chinese supplies it. Chinese says the same
 * things in fewer glyphs than English needs, which leaves the page about a
 * band's worth of room the English page has already spent — so it spends it on
 * the question a Chinese-reading engineer asks next, and the English page never
 * renders the band at all. That asymmetry is the point of holding two
 * catalogues rather than one and a translation of it.
 */
export interface HomeCopy {
  readonly actions: {
    readonly browse: string;
    readonly start: string;
  };
  readonly badge: string;
  readonly boundaries?: {
    readonly command: string;
    readonly eyebrow: string;
    readonly heading: string;
    readonly lead: string;
    readonly rejections: readonly string[];
  };
  readonly builtOn: {
    readonly lead: string;
    readonly link: string;
    readonly mid: string;
    readonly tail: string;
    readonly version: string;
  };
  readonly facts: {
    readonly components: {readonly detail: string; readonly label: string};
    readonly templates: {readonly detail: string; readonly label: string};
    readonly themes: {
      readonly detail: (names: readonly string[]) => string;
      readonly label: string;
    };
    readonly tokens: {
      readonly detail: (groups: number) => string;
      readonly label: string;
    };
  };
  readonly headline: string;
  readonly lead: Stressed;
  readonly palette: {
    readonly body: string;
    readonly eyebrow: string;
    readonly heading: string;
    readonly roles: Readonly<Record<PaletteRole, string>>;
  };
  readonly preview: {
    readonly columns: {
      readonly component: string;
      readonly description: string;
      readonly status: string;
    };
    readonly count: {readonly lead: string; readonly tail: string};
    readonly groups: string;
    readonly layout: {
      readonly cards: string;
      readonly label: string;
      readonly table: string;
    };
    readonly note: {readonly lead: string; readonly tail: string};
    readonly status: {readonly planned: string; readonly ready: string};
  };
  readonly selection: {
    readonly body: string;
    readonly eyebrow: string;
    readonly heading: string;
    readonly verdict: {readonly no: string; readonly yes: string};
  };
  readonly unreleased: string;
}

export const home: Catalogue<HomeCopy> = {en: homeEn, zh: homeZh};
