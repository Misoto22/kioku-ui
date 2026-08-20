import {templateDetailEn} from './templateDetail.en.js';
import {templateDetailZh} from './templateDetail.zh.js';
import type {Catalogue} from './locale.js';

/**
 * One template's page.
 *
 * `composes.argument` is the page's own argument and the one place on it that
 * takes stress emphasis, so it is stored as the run before the emphasis, the
 * emphasised word, and the run after — the page wraps the middle in
 * `Emphasis`, which slants it in English and marks it with 着重号 in Chinese.
 */
export interface TemplateDetailCopy {
  readonly composes: {
    readonly argument: {
      readonly emphasis: string;
      readonly lead: string;
      readonly tail: string;
    };
    /**
     * The particles around the import count. The figure itself is the page's,
     * so only the digits take the mono face.
     */
    readonly figure: {
      readonly lead: string;
      readonly tail: (imports: number) => string;
    };
    readonly label: string;
    readonly menu: (title: string) => string;
    readonly unlisted: {
      readonly label: string;
      readonly tail: string;
    };
  };
  /**
   * "Writes `X.tsx` into the working directory. Pass `--dest` … and `--force`
   * …" — four runs of prose around three code fragments the page supplies.
   */
  readonly copyItIn: {
    readonly between: string;
    readonly dest: string;
    readonly force: string;
    readonly label: string;
    readonly lead: string;
    readonly middle: string;
    readonly tail: string;
  };
  readonly notFound: {
    readonly action: string;
    readonly detail: string;
    readonly title: string;
  };
  readonly otherCategories: {
    readonly label: string;
    readonly menu: string;
  };
  readonly planned: string;
  readonly preview: {
    readonly label: string;
    readonly note: string;
    /** What follows the scale figure, the per-cent sign included. */
    readonly scale: string;
  };
  readonly reserved: {
    readonly action: string;
    readonly lead: string;
    readonly middle: string;
    readonly tail: string;
    readonly title: string;
  };
  readonly shape: {
    readonly label: string;
    readonly note: string;
  };
  readonly source: {
    /** Between the file name and the line count. */
    readonly between: string;
    readonly label: string;
    readonly lines: (lines: number) => string;
    readonly note: string;
  };
  readonly status: {
    readonly planned: string;
    readonly ready: string;
  };
}

export const templateDetail: Catalogue<TemplateDetailCopy> = {
  en: templateDetailEn,
  zh: templateDetailZh,
};
