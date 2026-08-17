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

export interface ThemePersistence {
  read(): string | undefined;
  write(themeId: string): void;
}

export interface ThemeProviderProps {
  readonly children: ReactNode;
  readonly defaultThemeId: string;
  readonly persistence?: ThemePersistence;
  readonly themes: readonly ThemeDefinition[];
}

export interface ThemeContextValue {
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
  const value = useMemo(() => ({setThemeId, theme}), [setThemeId, theme]);

  return (
    <ThemeContext value={value}>
      <div data-theme={theme.id} style={themeStyle(theme)}>
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
