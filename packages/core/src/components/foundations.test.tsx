// @vitest-environment happy-dom

import {cleanup, screen} from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import {afterEach, describe, expect, it, vi} from 'vitest';

vi.mock('@stylexjs/stylex', () => ({
  create: <Styles,>(styles: Styles) => styles,
  defineVars: <Vars,>(variables: Vars) => variables,
  keyframes: () => 'test-spin',
  props: (...styles: Array<Record<string, unknown> | undefined>) => {
    const appliedStyles = Object.assign({}, ...styles);

    return {
      style: appliedStyles,
      'data-stylex-contract': JSON.stringify(appliedStyles),
    };
  },
}));

import {renderUi} from '@misoto22/kioku-ui-test-utils';

import {
  Card,
  CardFooter,
  CardHeader,
  Center,
  Divider,
  Grid,
  Heading,
  Section,
  Stack,
  Text,
  VisuallyHidden,
} from './index.js';

afterEach(() => {
  cleanup();
});

describe('foundation components', () => {
  it('renders Heading with the requested semantic level and token-backed variant', () => {
    renderUi(
      <Heading level={2} size="section">
        Account settings
      </Heading>,
    );

    const heading = screen.getByRole('heading', {
      level: 2,
      name: 'Account settings',
    });

    expect(heading).toBeVisible();
    expect(heading.style.getPropertyValue('color')).toBe(
      'var(--kioku-ui-color-text)',
    );
    expect(heading.style.getPropertyValue('font-family')).toBe(
      'var(--kioku-ui-typography-font-family-heading)',
    );
    expect(heading.style.getPropertyValue('font-size')).toBe(
      'var(--kioku-ui-typography-font-size-lg)',
    );
    expect(heading.style.getPropertyValue('font-weight')).toBe(
      'var(--kioku-ui-typography-font-weight-strong)',
    );
    expect(heading.style.getPropertyValue('line-height')).toBe(
      'var(--kioku-ui-typography-line-height-heading)',
    );
  });

  it('hides VisuallyHidden text visually while preserving its accessible name', () => {
    renderUi(
      <button type="button">
        <VisuallyHidden>Open navigation</VisuallyHidden>
      </button>,
    );

    expect(screen.getByRole('button', {name: 'Open navigation'})).toBeVisible();
    const hiddenText = screen.getByText('Open navigation');
    const appliedStyles = JSON.parse(
      hiddenText.getAttribute('data-stylex-contract') ?? '{}',
    );
    expect(appliedStyles).toEqual({
      clip: 'rect(0 0 0 0)',
      clipPath: 'inset(50%)',
      height: 1,
      margin: -1,
      overflow: 'hidden',
      position: 'absolute',
      whiteSpace: 'nowrap',
      width: 1,
    });
  });

  it('preserves native landmark and content semantics in composed layout primitives', () => {
    renderUi(
      <Section aria-label="Preferences">
        <Stack>
          <Heading level={2}>Notifications</Heading>
          <Text>Choose when to receive updates.</Text>
          <Grid columns={2}>
            <Card>
              <CardHeader>Delivery</CardHeader>
              <Divider />
              <CardFooter>Enabled</CardFooter>
            </Card>
            <Center>Secondary content</Center>
          </Grid>
        </Stack>
      </Section>,
    );

    expect(screen.getByRole('region', {name: 'Preferences'})).toBeVisible();
    expect(
      screen.getByRole('heading', {level: 2, name: 'Notifications'}),
    ).toBeVisible();
    expect(screen.getByText('Choose when to receive updates.').tagName).toBe(
      'P',
    );
    expect(screen.getByRole('article')).toBeVisible();
    expect(screen.getByRole('separator')).toBeVisible();
  });
});
