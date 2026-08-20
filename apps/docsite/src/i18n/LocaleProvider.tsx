import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import {InternationalizationProvider} from '@misoto22/kioku-ui';

import {libraryMessages} from './library.js';
import {
  readLocale,
  writeLocale,
  type Catalogue,
  type Locale,
} from './locale.js';

/** The language in use, and the way to change it. */
export interface LocaleValue {
  readonly locale: Locale;
  readonly setLocale: (locale: Locale) => void;
}

const LocaleContext = createContext<LocaleValue | undefined>(undefined);

/**
 * Supplies the language the site is written in.
 *
 * Two things follow from the locale and are done here rather than left to the
 * pages, because a page that forgot either would be wrong in a way nobody
 * notices until a Chinese reader arrives:
 *
 * `<html lang>` follows the locale, which is what a screen reader picks its
 * voice from and what the theme's `:lang(zh)` rules key off — the SC families
 * and the wider leading Chinese needs are already in the theme pack, waiting
 * for the document to declare which language it is in.
 *
 * The library's own `InternationalizationProvider` is wrapped around the tree
 * with the matching set of component strings. That provider is for the words
 * the components speak on their own account — "Close", "Next page" — and page
 * copy has no business in it; the catalogues below are where the site's own
 * prose lives.
 */
export function LocaleProvider({children}: {readonly children: ReactNode}) {
  const [locale, setCurrentLocale] = useState<Locale>(readLocale);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const value = useMemo(
    () => ({
      locale,
      setLocale: (next: Locale) => {
        writeLocale(next);
        setCurrentLocale(next);
      },
    }),
    [locale],
  );

  return (
    <LocaleContext value={value}>
      <InternationalizationProvider
        locale={locale}
        messages={libraryMessages[locale]}
      >
        {children}
      </InternationalizationProvider>
    </LocaleContext>
  );
}

/** The language in use. Throws without a provider, because there is no default
 * language this site could sensibly fall back to mid-render. */
export function useLocale(): LocaleValue {
  const value = useContext(LocaleContext);

  if (value === undefined) {
    throw new Error('useLocale requires a LocaleProvider above it.');
  }

  return value;
}

/**
 * Reads one section of copy in the language in use.
 *
 * A page imports its own catalogue and hands it here, so adding a page means
 * adding a pair of files beside it rather than editing a register every other
 * page also depends on.
 */
export function useCopy<Copy>(catalogue: Catalogue<Copy>): Copy {
  return catalogue[useLocale().locale];
}
