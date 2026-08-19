import {useState, type CSSProperties} from 'react';

import {
  Box,
  Button,
  Card,
  CardHeader,
  Dialog,
  Eyebrow,
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

// `Eyebrow` carries the type, so a card title that has to stay in the document
// outline keeps only its own box: no margin, and no inline strut of its own to
// make the row taller than the label inside it.
const eyebrowHeading: CSSProperties = {display: 'flex', margin: 0};

// One hairline apart, drawn with the gap rather than a border per row.
const tiles: CSSProperties = {
  backgroundColor: 'var(--kioku-ui-border-default)',
  display: 'grid',
  gap: 'var(--kioku-ui-border-width)',
};

interface Preferences {
  readonly digest: boolean;
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
  digest: false,
  liveUpdates: true,
  name: 'Ada Lovelace',
  timezone: 'perth',
};

function timezoneLabel(value: string) {
  return timezones.find((entry) => entry.value === value)?.label ?? value;
}

/**
 * Settings in a modal. Unlike a settings page, changes here are staged in a
 * draft and only committed on save — a modal can be dismissed by Escape or a
 * stray click, so applying immediately would let a reader lose a change
 * without ever seeing it happen.
 *
 * That is also why this is the one settings template with an emphatic button.
 * There is exactly one per scope: Save closes the dialog, Edit settings opens
 * it, and everything else is paper with a hairline edge.
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
    <Stack gap="xl">
      <Stack gap="sm">
        <Eyebrow>WORKSPACE</Eyebrow>
        <Heading level={1} size="section">
          General
        </Heading>
      </Stack>

      <Card>
        <CardHeader>
          <h2 style={eyebrowHeading}>
            <Eyebrow>IN EFFECT</Eyebrow>
          </h2>
        </CardHeader>
        <Stack gap="lg">
          <MetadataList
            entries={[
              {detail: saved.name, term: 'Display name'},
              {detail: timezoneLabel(saved.timezone), term: 'Time zone'},
              {detail: saved.liveUpdates ? 'On' : 'Off', term: 'Live updates'},
              {detail: saved.digest ? 'On' : 'Off', term: 'Daily digest'},
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
        <Stack gap="lg">
          <TabList
            label="Settings sections"
            onSelect={setSection}
            selectedId={section}
            tabs={sections}
          />

          {section === 'profile' ? (
            <Stack gap="md">
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
            </Stack>
          ) : (
            <div style={tiles}>
              <Box padding="md" surface="surface">
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
              </Box>
              <Box padding="md" surface="surface">
                <Item
                  description="One message each morning instead of many"
                  trailing={
                    <Switch
                      aria-label="Daily digest"
                      onPressedChange={(digest) =>
                        setDraft((current) => ({...current, digest}))
                      }
                      pressed={draft.digest}
                    />
                  }
                >
                  Daily digest
                </Item>
              </Box>
            </div>
          )}

          <Text size="sm" tone="muted">
            Nothing changes until you save.
          </Text>
        </Stack>
      </Dialog>
    </Stack>
  );
}
