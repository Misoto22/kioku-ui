import type {CSSProperties, ReactNode} from 'react';

import {useLocale} from './LocaleProvider.js';

/**
 * Stress emphasis, set the way the writing system sets it.
 *
 * English slants the word. Chinese may not: there is no italic in the Chinese
 * writing system, and a browser asked for one synthesises a shear of the
 * upright forms — a distortion, not a style. What Chinese has instead is the
 * 着重号, one ink dot under each glyph, which is the structural equivalent
 * rather than a quotation of the Latin device.
 *
 * Both are `<em>`, because both are the same thing to a reader who is
 * listening rather than looking. Only the paint differs.
 *
 * `text-emphasis` is still prefixed in WebKit, so each of the three properties
 * is declared twice; a Chinese page that drew its dots in Chrome and dropped
 * them in Safari would lose the emphasis altogether rather than degrade.
 */
const marked: CSSProperties = {
  color: 'var(--kioku-ui-color-text)',
  fontStyle: 'normal',
  textEmphasis: 'dot',
  textEmphasisColor: 'currentColor',
  textEmphasisPosition: 'under right',
  WebkitTextEmphasis: 'dot',
  WebkitTextEmphasisColor: 'currentColor',
  WebkitTextEmphasisPosition: 'under right',
};

const slanted: CSSProperties = {
  color: 'var(--kioku-ui-color-text)',
  fontStyle: 'italic',
};

/**
 * The emphasised run only. Punctuation stays outside it: a full stop carries
 * no dot, and a Chinese full stop already owns a full em of its own.
 */
export function Emphasis({children}: {readonly children: ReactNode}) {
  const {locale} = useLocale();

  return <em style={locale === 'zh' ? marked : slanted}>{children}</em>;
}
