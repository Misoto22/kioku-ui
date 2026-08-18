// @vitest-environment jsdom

import {cleanup, screen} from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import {afterEach, describe, expect, it, vi} from 'vitest';

vi.mock('@stylexjs/stylex', () => ({
  create: <Styles,>(styles: Styles) => styles,
  defineVars: <Vars,>(variables: Vars) => variables,
  keyframes: () => 'test-spin',
  props: (...styles: Array<Record<string, unknown> | undefined | false>) => ({
    style: Object.assign({}, ...styles.filter(Boolean)),
  }),
}));

import {renderUi} from '@misoto22/kioku-ui-test-utils';

import {Alert} from './index.js';

afterEach(() => {
  cleanup();
});

describe('Alert', () => {
  it('uses assertive alert semantics only for danger feedback', () => {
    renderUi(
      <>
        <Alert tone="info">Saved for later</Alert>
        <Alert tone="danger">Could not save</Alert>
      </>,
    );

    expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite');
    expect(screen.getByRole('alert')).toHaveAttribute('aria-live', 'assertive');
  });
  it('pairs every Alert tone with a stable hidden default icon', () => {
    renderUi(
      <>
        {(['info', 'success', 'warning', 'danger'] as const).map((tone) => (
          <Alert data-testid={`alert-${tone}`} key={tone} tone={tone}>
            {tone} feedback
          </Alert>
        ))}
      </>,
    );

    for (const tone of ['info', 'success', 'warning', 'danger'] as const) {
      const alert = screen.getByTestId(`alert-${tone}`);
      const icon = alert.querySelector(`[data-alert-icon="${tone}"]`);
      expect(icon).toHaveAttribute('aria-hidden', 'true');
      expect(icon?.querySelector('svg')).toBeInTheDocument();
    }
  });
  it('keeps a custom Alert icon decorative without a duplicate live region', () => {
    renderUi(
      <Alert
        data-testid="custom-alert"
        icon={<span role="status">Custom status artwork</span>}
      >
        Workspace settings were updated.
      </Alert>,
    );

    const alert = screen.getByTestId('custom-alert');
    const icon = alert.querySelector('[data-alert-icon="custom"]');
    expect(icon).toHaveAttribute('aria-hidden', 'true');
    expect(icon).toHaveTextContent('Custom status artwork');
    expect(screen.getAllByRole('status')).toEqual([alert]);
  });
});
