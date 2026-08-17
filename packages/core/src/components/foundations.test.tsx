// @vitest-environment happy-dom

import {cleanup, screen} from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import {afterEach, describe, expect, it, vi} from 'vitest';

vi.mock('@stylexjs/stylex', () => ({
  create: <Styles,>(styles: Styles) => styles,
  defineVars: <Vars,>(variables: Vars) => variables,
  props: () => ({}),
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

    expect(
      screen.getByRole('heading', {level: 2, name: 'Account settings'}),
    ).toBeVisible();
  });

  it('hides VisuallyHidden text visually while preserving its accessible name', () => {
    renderUi(
      <button type="button">
        <VisuallyHidden>Open navigation</VisuallyHidden>
      </button>,
    );

    expect(screen.getByRole('button', {name: 'Open navigation'})).toBeVisible();
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
