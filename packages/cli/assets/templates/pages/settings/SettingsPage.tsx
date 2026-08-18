import {useState} from 'react';

import {
  AlertDialog,
  Button,
  Card,
  Divider,
  Field,
  Heading,
  Item,
  RadioList,
  Section,
  Selector,
  Stack,
  Switch,
  Text,
} from '@misoto22/kioku-ui';

const densities = [
  {description: 'Fits more on screen', label: 'Compact', value: 'compact'},
  {label: 'Standard', value: 'standard'},
];

const languages = [
  {label: 'English', value: 'en'},
  {label: '日本語', value: 'ja'},
  {label: '简体中文', value: 'zh'},
];

/**
 * A settings page. Switches apply the moment they are flipped — there is no
 * Save button, because a settings page with one invites a reader to change
 * three things and lose two. The destructive action is the exception: it
 * asks first.
 */
export function SettingsPage() {
  const [liveUpdates, setLiveUpdates] = useState(true);
  const [digest, setDigest] = useState(false);
  const [density, setDensity] = useState('compact');
  const [language, setLanguage] = useState('en');
  const [confirming, setConfirming] = useState(false);

  return (
    <Stack gap="lg">
      <Heading level={1} size="section">
        Settings
      </Heading>

      <Card>
        <Section>
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
            <Item
              description="One message each morning instead of many"
              trailing={
                <Switch
                  aria-label="Daily digest"
                  onPressedChange={setDigest}
                  pressed={digest}
                />
              }
            >
              Daily digest
            </Item>
          </Stack>
        </Section>
      </Card>

      <Card>
        <Section>
          <Stack gap="md">
            <Heading level={2} size="subsection">
              Appearance
            </Heading>
            <RadioList
              legend="Density"
              onValueChange={setDensity}
              options={densities}
              value={density}
            />
            <Field label="Language">
              <Selector
                onValueChange={setLanguage}
                options={languages}
                value={language}
              />
            </Field>
          </Stack>
        </Section>
      </Card>

      <Card>
        <Section>
          <Stack gap="md">
            <Heading level={2} size="subsection">
              Danger zone
            </Heading>
            <Text size="sm" tone="secondary">
              Deleting the workspace removes every release and cannot be undone.
            </Text>
            <div>
              <Button onClick={() => setConfirming(true)} variant="destructive">
                Delete workspace
              </Button>
            </div>
          </Stack>
        </Section>
      </Card>

      <Divider />

      <AlertDialog
        description="Every release, review, and archived note is removed. This cannot be undone."
        footer={
          <>
            <Button onClick={() => setConfirming(false)} variant="secondary">
              Keep workspace
            </Button>
            <Button onClick={() => setConfirming(false)} variant="destructive">
              Delete permanently
            </Button>
          </>
        }
        onDismiss={() => setConfirming(false)}
        open={confirming}
        size="sm"
        title="Delete this workspace?"
      />
    </Stack>
  );
}
