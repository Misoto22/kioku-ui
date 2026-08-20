import {useState} from 'react';

import {
  Card,
  Divider,
  Field,
  FormLayout,
  HStack,
  Heading,
  RadioList,
  SegmentedControl,
  Selector,
  Stack,
  Switch,
  Text,
  TextInput,
} from '@misoto22/kioku-ui';

// Settings that take effect as they are changed, and settings that are saved.
// They are not the same page and should not pretend to be: the appearance
// block says so in a line under its own heading and carries no Save, while the
// account block below it is an ordinary form with actions at its foot.

const skins = [
  {
    description: 'Warm paper and ink, with plant-dyed accents.',
    label: 'Paper',
    value: 'paper',
  },
  {
    description: 'Cool walls and pale timber, green-grey accent.',
    label: 'Plain',
    value: 'plain',
  },
  {
    description: 'High contrast, near monochrome, one white sheet.',
    label: 'Ink',
    value: 'ink',
  },
];

export function AppearanceSettingsPage() {
  const [skin, setSkin] = useState('paper');
  const [density, setDensity] = useState('compact');
  const [mode, setMode] = useState('system');
  const [digest, setDigest] = useState(true);

  return (
    <Stack gap="2xl">
      <Stack gap="lg">
        <Stack gap="xs">
          <Heading level={2} size="section">
            Appearance
          </Heading>
          <Text size="sm" tone="muted">
            Applies immediately. Nothing here needs saving.
          </Text>
        </Stack>

        {/*
          The skins carry a sentence each because the names alone do not tell a
          reader what changes — and the choice is one of several, so it is a
          radio list rather than a row of cards.
        */}
        <RadioList
          legend="Skin"
          onValueChange={setSkin}
          options={skins}
          value={skin}
        />

        <HStack align="start" gap="2xl" wrap>
          <Stack gap="xs">
            <Text size="sm" tone="muted">
              Density
            </Text>
            <SegmentedControl
              aria-label="Density"
              onValueChange={setDensity}
              options={[
                {label: 'Compact', value: 'compact'},
                {label: 'Standard', value: 'standard'},
              ]}
              value={density}
            />
          </Stack>
          <Stack gap="xs">
            <Text size="sm" tone="muted">
              Appearance
            </Text>
            <SegmentedControl
              aria-label="Appearance"
              onValueChange={setMode}
              options={[
                {label: 'System', value: 'system'},
                {label: 'Light', value: 'light'},
                {label: 'Dark', value: 'dark'},
              ]}
              value={mode}
            />
          </Stack>
        </HStack>
      </Stack>

      <Divider />

      <Stack gap="lg">
        <Heading level={2} size="section">
          Account
        </Heading>
        <Card>
          <FormLayout columns={2}>
            <Field
              description="Used for the footer signature and exported files."
              label="Display name"
            >
              <TextInput defaultValue="Alex Doe" />
            </Field>
            <Field
              description="Day boundaries and seasonal markers follow this."
              label="Time zone"
            >
              <Selector
                onValueChange={() => undefined}
                options={[
                  {label: 'Australian Eastern (UTC+10)', value: 'aet'},
                  {label: 'Coordinated Universal (UTC)', value: 'utc'},
                  {label: 'Pacific (UTC−8)', value: 'pt'},
                ]}
                value="aet"
              />
            </Field>
          </FormLayout>
        </Card>

        <Card>
          <HStack align="center" gap="md" justify="between">
            <Stack gap="xs">
              <Text>Daily digest</Text>
              <Text size="sm" tone="muted">
                A summary of the day, sent each evening at 21:00.
              </Text>
            </Stack>
            <Switch
              aria-label="Daily digest"
              onPressedChange={setDigest}
              pressed={digest}
            />
          </HStack>
        </Card>
      </Stack>
    </Stack>
  );
}
