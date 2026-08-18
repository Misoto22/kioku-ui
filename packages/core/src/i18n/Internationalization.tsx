import {createContext, useContext, useMemo, type ReactNode} from 'react';

import {defaultMessages, type Messages} from './messages.js';

/** The locale settings and strings available to descendants. */
export interface InternationalizationValue {
  readonly direction: 'ltr' | 'rtl';
  readonly locale: string;
  readonly messages: Messages;
}

const InternationalizationContext = createContext<
  InternationalizationValue | undefined
>(undefined);

/** Props for the locale and string provider. */
export interface InternationalizationProviderProps {
  readonly children: ReactNode;
  readonly direction?: 'ltr' | 'rtl';
  readonly locale?: string;
  readonly messages?: Messages;
}

/**
 * Supplies the locale, writing direction, and strings the system speaks. The
 * library ships English and owns no translation pipeline; a host replaces the
 * whole message set for another language.
 */
export function InternationalizationProvider({
  children,
  direction = 'ltr',
  locale = 'en',
  messages = defaultMessages,
}: InternationalizationProviderProps) {
  const value = useMemo(
    () => ({direction, locale, messages}),
    [direction, locale, messages],
  );

  return (
    <InternationalizationContext.Provider value={value}>
      <div dir={direction} lang={locale}>
        {children}
      </div>
    </InternationalizationContext.Provider>
  );
}

/**
 * Reads the active locale settings. Without a provider it reports the built-in
 * English defaults, so a component never has to guard for a missing host.
 */
export function useInternationalization(): InternationalizationValue {
  return (
    useContext(InternationalizationContext) ?? {
      direction: 'ltr',
      locale: 'en',
      messages: defaultMessages,
    }
  );
}

/** Reads one string by key from the active message set. */
export function useMessage(key: keyof Messages): string {
  return useInternationalization().messages[key];
}
