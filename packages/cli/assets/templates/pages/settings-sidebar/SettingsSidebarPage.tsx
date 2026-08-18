import {useState} from 'react';

import {
  Card,
  Field,
  Heading,
  Item,
  Selector,
  Stack,
  Switch,
  TabList,
  Text,
  TextInput,
} from '@misoto22/kioku-ui';

const sections = [
  {id: 'profile', label: 'Profile'},
  {id: 'notifications', label: 'Notifications'},
  {id: 'security', label: 'Security'},
];

const timezones = [
  {label: 'Australia/Perth', value: 'perth'},
  {label: 'Asia/Tokyo', value: 'tokyo'},
];

/**
 * Settings split into sections. `TabList` is used rather than a nav rail
 * because these are panels of one page, not separate destinations — the URL
 * does not change, so a link would lie about what activating it does.
 */
export function SettingsSidebarPage() {
  const [section, setSection] = useState('profile');
  const [name, setName] = useState('Ada Lovelace');
  const [timezone, setTimezone] = useState('perth');
  const [liveUpdates, setLiveUpdates] = useState(true);
  const [twoFactor, setTwoFactor] = useState(false);

  return (
    <Stack gap="lg">
      <Heading level={1} size="section">
        Settings
      </Heading>

      <TabList
        label="Settings sections"
        onSelect={setSection}
        selectedId={section}
        tabs={sections}
      />

      <Card>
        {section === 'profile' ? (
          <Stack gap="md">
            <Heading level={2} size="subsection">
              Profile
            </Heading>
            <Field label="Display name">
              <TextInput onValueChange={setName} value={name} />
            </Field>
            <Field
              label="Time zone"
              description="Used for every timestamp shown to you."
            >
              <Selector
                onValueChange={setTimezone}
                options={timezones}
                value={timezone}
              />
            </Field>
          </Stack>
        ) : null}

        {section === 'notifications' ? (
          <Stack gap="md">
            <Heading level={2} size="subsection">
              Notifications
            </Heading>
            <Item
              description="Applies as soon as it is flipped"
              trailing={
                <Switch
                  aria-label="Live updates"
                  onPressedChange={setLiveUpdates}
                  pressed={liveUpdates}
                />
              }
            >
              Live updates
            </Item>
          </Stack>
        ) : null}

        {section === 'security' ? (
          <Stack gap="md">
            <Heading level={2} size="subsection">
              Security
            </Heading>
            <Item
              description="Ask for a code from your authenticator at sign-in"
              trailing={
                <Switch
                  aria-label="Two-factor authentication"
                  onPressedChange={setTwoFactor}
                  pressed={twoFactor}
                />
              }
            >
              Two-factor authentication
            </Item>
            <Text size="sm" tone="muted">
              Changing a password belongs behind its own confirmation step, not
              on a settings panel.
            </Text>
          </Stack>
        ) : null}
      </Card>
    </Stack>
  );
}
