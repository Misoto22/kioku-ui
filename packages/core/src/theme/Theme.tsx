import * as stylex from '@stylexjs/stylex';
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';

import {
  tokenCustomProperties,
  tokenNames,
  validateThemeDefinition,
  type ThemeDefinition,
} from '../tokens/contracts.js';
import {semanticTokens} from '../authoring.stylex.js';

/*
 * Grain. Paper is never flat, and a flat fill is the strongest tell that a
 * surface was generated rather than made. Drawn with feTurbulence, so nothing
 * is fetched and nothing is stored, and masked rather than blended so the
 * speckle takes the theme's own ink instead of a grey wash. A theme that wants
 * none makes the colour transparent and pays nothing else.
 *
 * It sits above the content, where a printed texture sits. The stacking step
 * is 1 rather than a nine-thousand, so a host's own layers still out-rank it.
 */
const grainMask =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.82' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)'/%3E%3C/svg%3E\")";

const styles = stylex.create({
  root: {
    position: 'relative',
    '::after': {
      backgroundColor: semanticTokens.textureGrain,
      content: '',
      inset: 0,
      maskImage: grainMask,
      pointerEvents: 'none',
      position: 'absolute',
      zIndex: 1,
    },
  },
});

interface CompiledStyleXVarGroup {
  readonly __varGroupHash__: string;
}

// StyleX emits semantic-token bridge variables for this generated scope. The
// host theme values live on ThemeProvider, so the scope must live there too.
const semanticTokenScopeClass = (
  semanticTokens as unknown as CompiledStyleXVarGroup
).__varGroupHash__;

export type Density = 'compact' | 'standard';

const densities: readonly Density[] = ['compact', 'standard'];

// A theme pack fulfills the token contract twice, once per density. Density is
// therefore a root attribute rather than a token value: the pack's CSS decides
// what each step measures, and the library only says which one is selected.
export interface ThemePersistence {
  read(): string | undefined;
  write(themeId: string): void;
  readDensity?(): string | undefined;
  writeDensity?(density: Density): void;
}

export interface ThemeProviderProps {
  readonly children: ReactNode;
  readonly defaultDensity?: Density;
  readonly defaultThemeId: string;
  readonly persistence?: ThemePersistence;
  readonly themes: readonly ThemeDefinition[];
}

export interface ThemeContextValue {
  readonly density: Density;
  readonly setDensity: (density: Density) => void;
  readonly setThemeId: (themeId: string) => void;
  readonly theme: ThemeDefinition;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function validateThemes(themes: readonly ThemeDefinition[]) {
  const themeIds = new Set<string>();

  for (const theme of themes) {
    if (themeIds.has(theme.id)) {
      throw new Error(`Duplicate theme ID: ${theme.id}`);
    }
    themeIds.add(theme.id);

    const missingTokens = validateThemeDefinition(theme);
    if (missingTokens.length > 0) {
      throw new Error(
        `Theme "${theme.id}" is missing token roles: ${missingTokens.join(', ')}`,
      );
    }
  }
}

function requiredDensity(density: string | undefined, fallback: Density) {
  return densities.includes(density as Density)
    ? (density as Density)
    : fallback;
}

function requiredTheme(themes: readonly ThemeDefinition[], themeId: string) {
  const theme = themes.find(({id}) => id === themeId);
  if (!theme) {
    throw new Error(`Unknown theme ID: ${themeId}`);
  }
  return theme;
}

function themeStyle(theme: ThemeDefinition): CSSProperties {
  return Object.fromEntries(
    tokenNames.map((tokenName) => [
      tokenCustomProperties[tokenName],
      theme.tokens[tokenName],
    ]),
  ) as CSSProperties;
}

export function ThemeProvider({
  children,
  defaultDensity = 'compact',
  defaultThemeId,
  persistence,
  themes,
}: ThemeProviderProps) {
  validateThemes(themes);

  const [themeId, setCurrentThemeId] = useState(
    () => persistence?.read() ?? defaultThemeId,
  );
  const theme = requiredTheme(themes, themeId);
  const setThemeId = useCallback(
    (nextThemeId: string) => {
      requiredTheme(themes, nextThemeId);
      persistence?.write(nextThemeId);
      setCurrentThemeId(nextThemeId);
    },
    [persistence, themes],
  );
  const [density, setCurrentDensity] = useState(() =>
    requiredDensity(persistence?.readDensity?.(), defaultDensity),
  );
  const setDensity = useCallback(
    (nextDensity: Density) => {
      const resolved = requiredDensity(nextDensity, defaultDensity);
      persistence?.writeDensity?.(resolved);
      setCurrentDensity(resolved);
    },
    [defaultDensity, persistence],
  );
  const value = useMemo(
    () => ({density, setDensity, setThemeId, theme}),
    [density, setDensity, setThemeId, theme],
  );

  const {className, style} = stylex.props(styles.root);

  return (
    <ThemeContext value={value}>
      <div
        className={[semanticTokenScopeClass, className]
          .filter(Boolean)
          .join(' ')}
        data-density={density}
        data-theme={theme.id}
        style={{...style, ...themeStyle(theme)}}
      >
        {children}
      </div>
    </ThemeContext>
  );
}

export function useTheme(): ThemeContextValue {
  const theme = useContext(ThemeContext);
  if (!theme) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return theme;
}
