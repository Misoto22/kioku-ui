/** The two languages this site is written in. Neither is a translation. */
export const locales = ['zh', 'en'] as const;

/** A language the site is written in. */
export type Locale = (typeof locales)[number];

/**
 * A section of copy held in both languages.
 *
 * The two entries are written independently rather than derived from each
 * other, so a page is free to say a thing in one language it does not say in
 * the other. Where that happens the shared shape declares the member optional
 * and only one locale supplies it.
 */
export type Catalogue<Copy> = Readonly<Record<Locale, Copy>>;

/**
 * What each language calls itself. An autonym does not localise: a reader who
 * cannot read the current page still has to recognise their own language in
 * the menu, so both entries read the same whichever locale is live.
 */
export const localeNames: Readonly<Record<Locale, string>> = {
  en: 'English',
  zh: '中文',
};

/**
 * U+2005 FOUR-PER-EM SPACE, set at every boundary between CJK and a Latin word
 * or a numeral.
 *
 * Chinese sets no word space, so a Latin run dropped into a Chinese line
 * collides with the glyph on either side of it. A quarter of an em is the
 * conventional parting, and it is a character rather than a margin so it
 * survives being copied out of the page.
 */
export const quarter = '\u2005';

const storageKey = 'kioku-ui-docsite-locale';

function isLocale(value: string | null): value is Locale {
  return value !== null && (locales as readonly string[]).includes(value);
}

/**
 * The locale to open at: the reader's last choice if they have made one,
 * otherwise what their browser asks for, otherwise English.
 *
 * Storage can throw — a browser with cookies blocked treats `localStorage` as
 * a security error rather than as an empty store — so a failure here falls
 * through to detection instead of taking the page down with it.
 */
export function readLocale(): Locale {
  if (typeof window === 'undefined') {
    return 'en';
  }

  try {
    const stored = window.localStorage.getItem(storageKey);
    if (isLocale(stored)) {
      return stored;
    }
  } catch {
    // A blocked store is not an error worth reporting to the reader; the
    // browser's own language is a good enough answer.
  }

  return window.navigator.language.toLowerCase().startsWith('zh') ? 'zh' : 'en';
}

/** Remembers the reader's choice, and says nothing when it cannot. */
export function writeLocale(locale: Locale): void {
  try {
    window.localStorage.setItem(storageKey, locale);
  } catch {
    // The choice still holds for this visit; only its memory is lost.
  }
}
