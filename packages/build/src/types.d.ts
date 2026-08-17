declare module '@stylexjs/postcss-plugin' {
  import type {Plugin} from 'postcss';

  interface StylexPostcssOptions {
    readonly babelConfig?: Record<string, unknown>;
    readonly cwd?: string;
    readonly include?: readonly string[];
    readonly useCSSLayers?: boolean;
  }

  export default function stylexPostcssPlugin(
    options?: StylexPostcssOptions,
  ): Plugin;
}
