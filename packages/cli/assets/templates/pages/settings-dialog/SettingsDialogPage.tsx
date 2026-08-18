import {useState} from 'react';

import {
  Button,
  Card,
  Dialog,
  Field,
  Heading,
  Item,
  MetadataList,
  Selector,
  Stack,
  Switch,
  TabList,
  Text,
  TextInput,
} from '@misoto22/kioku-ui';

interface Preferences {
  readonly liveUpdates: boolean;
  readonly name: string;
  readonly timezone: string;
}

const sections = [
  {id: 'profile', label: 'Profile'},
  {id: 'notifications', label: 'Notifications'},
];

const timezones = [
  {label: 'Australia/Perth', value: 'perth'},
  {label: 'Asia/Tokyo', value: 'tokyo'},
];

const initial: Preferences = {
  liveUpdates: true,
  name: 'Ada Lovelace',
  timezone: 'perth',
};

/**
 * Settings in a modal. Unlike a settings page, changes here are staged in a
 * draft and only committed on save — a modal can be dismissed by Escape or a
 * stray click, so applying immediately would let a reader lose a change
 * without ever seeing it happen.
 */
export function SettingsDialogPage() {
  const [saved, setSaved] = useState(initial);
  const [draft, setDraft] = useState(initial);
  const [section, setSection] = useState('profile');
  const [open, setOpen] = useState(false);

  function openDialog() {
    setDraft(saved);
    setSection('profile');
    setOpen(true);
  }

  function save() {
    setSaved(draft);
    setOpen(false);
  }

  return (
    <Stack gap="lg">
      <Heading level={1} size="section">
        Workspace
      </Heading>

      <Card>
        <Stack gap="md">
          <MetadataList
            entries={[
              {detail: saved.name, term: 'Display name'},
              {
                detail:
                  saved.timezone === 'perth' ? 'Australia/Perth' : 'Asia/Tokyo',
                term: 'Time zone',
              },
              {detail: saved.liveUpdates ? 'On' : 'Off', term: 'Live updates'},
            ]}
            layout="inline"
          />
          <div>
            <Button onClick={openDialog} variant="secondary">
              Edit settings
            </Button>
          </div>
        </Stack>
      </Card>

      <Dialog
        footer={
          <>
            <Button onClick={() => setOpen(false)} variant="secondary">
              Cancel
            </Button>
            <Button onClick={save}>Save changes</Button>
          </>
        }
        onDismiss={() => setOpen(false)}
        open={open}
        title="Settings"
      >
        <Stack gap="md">
          <TabList
            label="Settings sections"
            onSelect={setSection}
            selectedId={section}
            tabs={sections}
          />

          {section === 'profile' ? (
            <>
              <Field label="Display name">
                <TextInput
                  onValueChange={(name) =>
                    setDraft((current) => ({...current, name}))
                  }
                  value={draft.name}
                />
              </Field>
              <Field label="Time zone">
                <Selector
                  onValueChange={(timezone) =>
                    setDraft((current) => ({...current, timezone}))
                  }
                  options={timezones}
                  value={draft.timezone}
                />
              </Field>
            </>
          ) : (
            <Item
              description="Takes effect when you save"
              trailing={
                <Switch
                  aria-label="Live updates"
                  onPressedChange={(liveUpdates) =>
                    setDraft((current) => ({...current, liveUpdates}))
                  }
                  pressed={draft.liveUpdates}
                />
              }
            >
              Live updates
            </Item>
          )}

          <Text size="sm" tone="muted">
            Nothing changes until you save.
          </Text>
        </Stack>
      </Dialog>
    </Stack>
  );
}
