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

import {Card} from './Card/index.js';
import {CardFooter} from './CardFooter/index.js';
import {CardHeader} from './CardHeader/index.js';
import {Center} from './Center/index.js';
import {Divider} from './Divider/index.js';
import {Grid} from './Grid/index.js';
import {Heading} from './Heading/index.js';
import {Section} from './Section/index.js';
import {Stack} from './Stack/index.js';
import {Text} from './Text/index.js';

afterEach(() => {
  cleanup();
});

describe('composed layout primitives', () => {
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
