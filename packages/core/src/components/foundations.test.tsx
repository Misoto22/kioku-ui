// @vitest-environment happy-dom

import {cleanup, screen} from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import {afterEach, describe, expect, it, vi} from 'vitest';

vi.mock('@stylexjs/stylex', () => ({
  create: <Styles,>(styles: Styles) => styles,
  defineVars: <Vars,>(variables: Vars) => variables,
  props: (...styles: Array<Record<string, unknown> | undefined>) => ({
    style: Object.assign({}, ...styles),
  }),
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
    const appliedStyles = hiddenText.getAttribute('style') ?? '';
    expect(appliedStyles).toContain('clip-path: inset(50%);');
    expect(appliedStyles).toContain('height: 1px;');
    expect(appliedStyles).toContain('overflow: hidden;');
    expect(appliedStyles).toContain('position: absolute;');
    expect(appliedStyles).toContain('white-space: nowrap;');
    expect(appliedStyles).toContain('width: 1px;');
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
