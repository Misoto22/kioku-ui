/**
 * The site's language layer.
 *
 * Two languages, neither derived from the other. A page holds its copy in a
 * pair of files beside its own catalogue module — `<page>.zh.ts`, `<page>.en.ts`
 * and a `<page>.ts` that declares the shared shape and pairs them — and reads
 * it with `useCopy`. Nothing here is a register that every page has to be
 * added to, so a page arrives without touching another page's copy.
 *
 * Where the two languages do not say the same things, the shared shape
 * declares the member optional and one locale leaves it out. The Chinese home
 * page carries a band the English one does not, and that is the mechanism.
 */
export {Emphasis} from './Emphasis.js';
export {
  LocaleProvider,
  useCopy,
  useLocale,
  type LocaleValue,
} from './LocaleProvider.js';
export {
  localeNames,
  locales,
  quarter,
  type Catalogue,
  type Locale,
} from './locale.js';
