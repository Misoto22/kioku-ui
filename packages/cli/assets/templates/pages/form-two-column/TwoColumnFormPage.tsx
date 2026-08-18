import {useState} from 'react';

import {
  Button,
  Card,
  CheckboxList,
  DateInput,
  Divider,
  Field,
  FormLayout,
  Heading,
  Section,
  Selector,
  Stack,
  Text,
  TextArea,
  TextInput,
} from '@misoto22/kioku-ui';

const owners = [
  {label: 'Ada Lovelace', value: 'ada'},
  {label: 'Grace Hopper', value: 'grace'},
];

const channels = [
  {label: 'Email', value: 'email'},
  {description: 'Posts to the release channel', label: 'Chat', value: 'chat'},
];

/**
 * A long form broken into titled sections. Two columns collapse to one when
 * the container is narrow, so the form never forces sideways scrolling — and
 * related fields stay next to each other rather than being split by the fold.
 */
export function TwoColumnFormPage() {
  const [title, setTitle] = useState('Release 12');
  const [owner, setOwner] = useState('ada');
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');
  const [notify, setNotify] = useState<readonly string[]>(['email']);

  return (
    <Card>
      <Stack gap="lg">
        <Heading level={1} size="section">
          New release
        </Heading>

        <FormLayout
          actions={
            <>
              <Button variant="secondary">Save draft</Button>
              <Button>Create release</Button>
            </>
          }
          columns={2}
          onSubmit={(event) => {
            event.preventDefault();
            // Replace with a call to your own endpoint.
          }}
        >
          <Field label="Title">
            <TextInput onValueChange={setTitle} value={title} />
          </Field>
          <Field label="Owner" description="Who signs this release off.">
            <Selector onValueChange={setOwner} options={owners} value={owner} />
          </Field>
          <Field label="Target date">
            <DateInput onValueChange={setDate} value={date} />
          </Field>
          <CheckboxList
            legend="Announce through"
            onValueChange={setNotify}
            options={channels}
            value={notify}
          />
        </FormLayout>

        <Divider />

        <Section>
          <Stack gap="md">
            <Stack gap="xs">
              <Heading level={2} size="subsection">
                Release notes
              </Heading>
              <Text size="sm" tone="secondary">
                Shown to every subscriber when the release publishes.
              </Text>
            </Stack>
            <Field label="Notes">
              <TextArea onValueChange={setNotes} value={notes} />
            </Field>
          </Stack>
        </Section>
      </Stack>
    </Card>
  );
}
