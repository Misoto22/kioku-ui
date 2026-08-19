import {useState, type CSSProperties} from 'react';

import {
  AlertDialog,
  Box,
  Button,
  Card,
  CardHeader,
  Eyebrow,
  Field,
  Grid,
  HStack,
  Heading,
  Item,
  RadioList,
  Selector,
  Stack,
  Switch,
  TextInput,
} from '@misoto22/kioku-ui';

// `Eyebrow` carries the type, so a card title that has to stay in the document
// outline keeps only its own box: no margin, and no inline strut of its own to
// make the row taller than the label inside it. Nothing below is a literal
// value: a template that hard-codes a colour or a length stops following the
// theme the moment one is swapped.
const eyebrowHeading: CSSProperties = {display: 'flex', margin: 0};

// A tiled set draws its rules with the gap, not with a border per cell:
// bordering every row would draw each interior line twice.
const tiles: CSSProperties = {
  backgroundColor: 'var(--kioku-ui-border-default)',
  display: 'grid',
  gap: 'var(--kioku-ui-border-width)',
};

// The note beside the title is a marginal hand, parted from the page by a rule
// rather than by a box. Its measure is the scale, ten steps of it, because the
// scale has no name for a column width.
const marginNote: CSSProperties = {
  boxShadow:
    'inset var(--kioku-ui-border-width) 0 0 var(--kioku-ui-border-strong)',
  color: 'var(--kioku-ui-color-text-secondary)',
  fontFamily: 'var(--kioku-ui-typography-font-family-body)',
  fontSize: 'var(--kioku-ui-typography-font-size-sm)',
  letterSpacing: 'var(--kioku-ui-typography-letter-spacing-body)',
  lineHeight: 'var(--kioku-ui-typography-line-height-body)',
  margin: 0,
  maxInlineSize: 'calc(11 * var(--kioku-ui-spacing-2xl))',
  paddingInlineStart: 'var(--kioku-ui-spacing-lg)',
};

const densities = [
  {description: 'Fits more on screen', label: 'Compact', value: 'compact'},
  {description: 'The default spacing', label: 'Standard', value: 'standard'},
];

const languages = [
  {label: 'English', value: 'en'},
  {label: '日本語', value: 'ja'},
  {label: '简体中文', value: 'zh'},
];

const timezones = [
  {label: 'Australia/Perth', value: 'perth'},
  {label: 'Asia/Tokyo', value: 'tokyo'},
];

/**
 * A settings page. Every control here applies the moment it is changed, which
 * is why the page carries no Save button at all — a settings page with one
 * invites a reader to change three things and lose two. The destructive action
 * is the single exception: it asks first.
 *
 * That also means no emphatic button appears anywhere on the page. Do not add
 * one out of habit; there is nothing here to submit.
 */
export function SettingsPage() {
  const [name, setName] = useState('Ada Lovelace');
  const [timezone, setTimezone] = useState('perth');
  const [language, setLanguage] = useState('en');
  const [liveUpdates, setLiveUpdates] = useState(true);
  const [digest, setDigest] = useState(false);
  const [density, setDensity] = useState('compact');
  const [confirming, setConfirming] = useState(false);

  return (
    <Stack gap="xl">
      <HStack align="end" gap="xl" justify="between">
        <Stack gap="sm">
          <Eyebrow>WORKSPACE</Eyebrow>
          <Heading level={1} size="section">
            General
          </Heading>
        </Stack>
        <p style={marginNote}>
          No Save button. Every control here applies the moment it is changed —
          only the destructive action asks first.
        </p>
      </HStack>

      <Card>
        <CardHeader>
          <h2 style={eyebrowHeading}>
            <Eyebrow>WORKSPACE</Eyebrow>
          </h2>
        </CardHeader>
        <Grid columns={2} gap="lg">
          <Field label="Display name">
            <TextInput onValueChange={setName} value={name} />
          </Field>
          <Field
            description="Used for every timestamp shown to you."
            label="Time zone"
          >
            <Selector
              onValueChange={setTimezone}
              options={timezones}
              value={timezone}
            />
          </Field>
          <Field label="Language">
            <Selector
              onValueChange={setLanguage}
              options={languages}
              value={language}
            />
          </Field>
          <Field label="Workspace ID">
            <TextInput defaultValue="ws_0f42a1c9" readOnly />
          </Field>
        </Grid>
      </Card>

      <Card>
        <CardHeader>
          <h2 style={eyebrowHeading}>
            <Eyebrow>NOTIFICATIONS</Eyebrow>
          </h2>
        </CardHeader>
        <div style={tiles}>
          <Box padding="md" surface="surface">
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
          </Box>
          <Box padding="md" surface="surface">
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
          </Box>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <h2 style={eyebrowHeading}>
            <Eyebrow>APPEARANCE</Eyebrow>
          </h2>
        </CardHeader>
        <RadioList
          legend="Density"
          onValueChange={setDensity}
          options={densities}
          value={density}
        />
      </Card>

      <Card>
        <CardHeader>
          <h2 style={eyebrowHeading}>
            <Eyebrow tone="danger">DANGER ZONE</Eyebrow>
          </h2>
        </CardHeader>
        <Item
          description="Every release, review, and archived note is removed. This cannot be undone, and it asks for confirmation first."
          trailing={
            <Button onClick={() => setConfirming(true)} variant="destructive">
              Delete workspace
            </Button>
          }
        >
          Delete this workspace
        </Item>
      </Card>

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
