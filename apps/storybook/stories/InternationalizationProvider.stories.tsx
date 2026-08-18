import type {Meta, StoryObj} from '@storybook/react-vite';

import {
  Breadcrumbs,
  Button,
  Card,
  InternationalizationProvider,
  Stack,
  Text,
  defaultMessages,
  type Messages,
} from '@misoto22/kioku-ui';

import {DemoFrame, StateGrid} from './support/StoryFrame';

const meta = {
  id: 'core-internationalization-provider',
  title: 'Core/InternationalizationProvider',
  component: InternationalizationProvider,
  args: {children: null},
  parameters: {layout: 'padded'},
} satisfies Meta<typeof InternationalizationProvider>;

export default meta;
type Story = StoryObj<typeof meta>;

// A partial spread over the defaults keeps every key present and typed.
const french: Messages = {
  ...defaultMessages,
  close: 'Fermer',
  remove: 'Supprimer',
  skipToContent: 'Aller au contenu principal',
};

// The States story shows three locales side by side, so each sample needs its
// own landmark name — three navs all called "Breadcrumb" is a landmark-unique
// violation, and a real page has the same problem.
function Sample({name = 'Sample'}: {readonly name?: string}) {
  return (
    <Card>
      <Stack gap="sm">
        <Breadcrumbs
          items={[{href: '/', label: 'Accueil'}, {label: 'Version 12'}]}
          label={`Breadcrumb, ${name}`}
        />
        <Text>Twelve releases are ready to review.</Text>
        <Button variant="secondary">Publish</Button>
      </Stack>
    </Card>
  );
}

export const Default: Story = {
  render: (args) => (
    <DemoFrame>
      <InternationalizationProvider {...args}>
        <Sample />
      </InternationalizationProvider>
    </DemoFrame>
  ),
};

export const States: Story = {
  render: () => (
    <DemoFrame>
      <StateGrid
        items={[
          {
            label: 'en, ltr',
            content: (
              <InternationalizationProvider>
                <Sample name="English" />
              </InternationalizationProvider>
            ),
          },
          {
            label: 'fr, ltr',
            content: (
              <InternationalizationProvider locale="fr" messages={french}>
                <Sample name="French" />
              </InternationalizationProvider>
            ),
          },
          {
            label: 'ar, rtl',
            content: (
              <InternationalizationProvider direction="rtl" locale="ar">
                <Sample name="Arabic" />
              </InternationalizationProvider>
            ),
          },
        ]}
      />
    </DemoFrame>
  ),
};

export const Composition: Story = {
  render: () => (
    <DemoFrame>
      <Stack gap="md">
        <InternationalizationProvider direction="rtl" locale="ar">
          <Sample />
        </InternationalizationProvider>
        <Text size="sm" tone="muted">
          A host replaces the whole message set rather than patching keys, so a
          missing translation is a type error instead of an English word
          appearing mid-sentence.
        </Text>
      </Stack>
    </DemoFrame>
  ),
};
