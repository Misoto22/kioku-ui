import {docsEn} from './docs.en.js';
import {docsZh} from './docs.zh.js';
import type {Catalogue} from './locale.js';

/** A label and the one line it names — a rail heading, a fact beside a step. */
export interface DocsFact {
  readonly detail: string;
  readonly label: string;
}

/**
 * A sentence with one run of code set into it. The code itself is not copy:
 * the page reads it off the stylesheet or names an identifier, so a
 * translation can never disagree with what the reader has to type.
 */
export interface DocsSplitSentence {
  readonly lead: string;
  readonly tail: string;
}

/** One step: the reasoning on the left, the thing to type on the right. */
export interface DocsStep {
  readonly caption: string;
  readonly note?: DocsFact;
  readonly skip?: string;
  readonly summary: string;
  readonly title: string;
  readonly worked: string;
}

/**
 * The first step is the one that names the size of the contract, and that
 * figure is counted off the contract rather than written down twice.
 */
export interface DocsInstallStep extends Omit<DocsStep, 'skip'> {
  readonly skip: (roles: number) => string;
}

/** The getting-started page, in one language. */
export interface DocsCopy {
  readonly eyebrow: string;
  readonly exit: {
    readonly components: string;
    readonly templates: string;
    readonly terminal: DocsSplitSentence;
  };
  readonly factLabels: {
    readonly skip: string;
    readonly worked: string;
  };
  readonly lead: string;
  readonly notice: DocsFact;
  readonly rail: {
    readonly done: {
      readonly fonts: string;
      readonly imports: string;
      readonly label: string;
      readonly packages: string;
      readonly providers: string;
      readonly roles: string;
    };
    readonly labour: DocsFact;
    readonly never: {
      readonly items: readonly string[];
      readonly label: string;
    };
    readonly stepsLabel: string;
  };
  readonly steps: {
    readonly fonts: DocsStep;
    readonly install: DocsInstallStep;
    readonly page: DocsStep;
    readonly provider: DocsStep;
  };
  readonly title: string;
  readonly wrapNote: DocsSplitSentence;
}

export const docs: Catalogue<DocsCopy> = {en: docsEn, zh: docsZh};
