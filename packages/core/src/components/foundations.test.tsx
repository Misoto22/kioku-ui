// @vitest-environment jsdom

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
  it('preserves typography semantics while accepting tone and family APIs', () => {
    renderUi(
      <>
        <Text tone="secondary">Supporting copy</Text>
        <Text tone="muted">Updated recently</Text>
        <Heading level={2}>Interface heading</Heading>
        <Heading family="display" level={1}>
          Editorial title
        </Heading>
      </>,
    );

    const interfaceHeading = screen.getByRole('heading', {
      level: 2,
      name: 'Interface heading',
    });
    const displayHeading = screen.getByRole('heading', {
      level: 1,
      name: 'Editorial title',
    });

    expect(interfaceHeading.tagName).toBe('H2');
    expect(displayHeading.tagName).toBe('H1');
    expect(screen.getByText('Supporting copy').tagName).toBe('P');
    expect(screen.getByText('Updated recently').tagName).toBe('P');
    expect(interfaceHeading).not.toHaveAttribute('family');
    expect(displayHeading).not.toHaveAttribute('family');
    expect(screen.getByText('Supporting copy')).not.toHaveAttribute('tone');
    expect(screen.getByText('Updated recently')).not.toHaveAttribute('tone');
  });

  it('preserves Card article structure across elevation variants', () => {
    renderUi(
      <>
        <Card aria-label="Standard card">
          <CardHeader>Standard header</CardHeader>
          <CardFooter>Standard footer</CardFooter>
        </Card>
        <Card aria-label="Low card" elevation="low">
          Low content
        </Card>
        <Card aria-label="Medium card" elevation="medium">
          Medium content
        </Card>
      </>,
    );

    for (const name of ['Standard card', 'Low card', 'Medium card']) {
      expect(screen.getByRole('article', {name}).tagName).toBe('ARTICLE');
      expect(screen.getByRole('article', {name})).not.toHaveAttribute(
        'elevation',
      );
    }
    expect(screen.getByText('Standard header').tagName).toBe('HEADER');
    expect(screen.getByText('Standard footer').tagName).toBe('FOOTER');
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
              <Text>Orders are ready for dispatch.</Text>
              <CardFooter>Enabled</CardFooter>
            </Card>
            <Center>Secondary content</Center>
          </Grid>
          <Divider />
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
