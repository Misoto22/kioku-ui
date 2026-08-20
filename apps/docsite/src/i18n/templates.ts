import {templatesEn} from './templates.en.js';
import {templatesZh} from './templates.zh.js';
import type {Catalogue} from './locale.js';
import type {TemplateCategory} from '../data/templateCatalog.js';

/**
 * The template gallery.
 *
 * `categories` is keyed by the catalogue's own category union, so a category
 * added there fails the build here rather than showing up untranslated.
 */
export interface TemplatesCopy {
  readonly categories: Readonly<Record<TemplateCategory, string>>;
  readonly categoryLabel: string;
  readonly command: string;
  readonly copyOneIn: string;
  readonly counts: {
    readonly inCatalogue: string;
    readonly planned: string;
    readonly ready: string;
  };
  readonly eyebrow: string;
  readonly intro: string;
  readonly planned: {
    readonly label: string;
    readonly note: string;
  };
  readonly ready: {
    readonly label: string;
    readonly note: string;
  };
  readonly title: string;
}

export const templates: Catalogue<TemplatesCopy> = {
  en: templatesEn,
  zh: templatesZh,
};
