import {useState} from 'react';

import {
  Alert,
  Button,
  Card,
  Field,
  FieldStatus,
  FormLayout,
  Heading,
  Link,
  Selector,
  Stack,
  Text,
  TextArea,
  TextInput,
} from '@misoto22/kioku-ui';

const topics = [
  {label: 'Billing', value: 'billing'},
  {label: 'Technical support', value: 'support'},
  {label: 'Something else', value: 'other'},
];

interface Errors {
  readonly email?: string;
  readonly message?: string;
  readonly name?: string;
  readonly topic?: string;
}

/**
 * An enquiry form. It collects every problem before reporting any of them —
 * a form that fails on the first error makes a reader fix one thing, submit,
 * and discover the next.
 */
export function ContactFormPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [topic, setTopic] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState(false);

  function validate(): Errors {
    const next: Errors = {
      ...(name.trim() === '' ? {name: 'Enter your name.'} : {}),
      ...(email.includes('@')
        ? {}
        : {email: 'Enter an email address we can reply to.'}),
      ...(topic === '' ? {topic: 'Choose what this is about.'} : {}),
      ...(message.trim().length < 10
        ? {message: 'Tell us a little more — at least ten characters.'}
        : {}),
    };
    return next;
  }

  function handleSubmit() {
    const found = validate();
    setErrors(found);

    if (Object.keys(found).length === 0) {
      // Replace with a call to your own endpoint.
      setSent(true);
    }
  }

  const problems = Object.values(errors);

  return (
    <Card>
      <Stack gap="lg">
        <Stack gap="xs">
          <Heading level={1} size="section">
            Get in touch
          </Heading>
          <Text tone="secondary">
            We reply to most messages within one working day.
          </Text>
        </Stack>

        {sent ? (
          <Alert tone="success">Thanks — your message is on its way.</Alert>
        ) : null}

        {problems.length > 0 ? (
          <Alert tone="danger">
            {problems.length === 1
              ? 'One field needs attention.'
              : `${problems.length} fields need attention.`}
          </Alert>
        ) : null}

        <FormLayout
          actions={<Button onClick={handleSubmit}>Send message</Button>}
          onSubmit={(event) => {
            event.preventDefault();
            handleSubmit();
          }}
        >
          <Field label="Your name">
            <TextInput
              autoComplete="name"
              aria-invalid={errors.name !== undefined}
              onValueChange={setName}
              value={name}
            />
            {errors.name === undefined ? null : (
              <FieldStatus tone="danger">{errors.name}</FieldStatus>
            )}
          </Field>

          <Field label="Email address">
            <TextInput
              autoComplete="email"
              aria-invalid={errors.email !== undefined}
              onValueChange={setEmail}
              type="email"
              value={email}
            />
            {errors.email === undefined ? null : (
              <FieldStatus tone="danger">{errors.email}</FieldStatus>
            )}
          </Field>

          <Field label="What is this about?">
            <Selector
              aria-invalid={errors.topic !== undefined}
              onValueChange={setTopic}
              options={topics}
              placeholder="Choose a topic"
              value={topic}
            />
            {errors.topic === undefined ? null : (
              <FieldStatus tone="danger">{errors.topic}</FieldStatus>
            )}
          </Field>

          <Field label="Message">
            <TextArea
              aria-invalid={errors.message !== undefined}
              onValueChange={setMessage}
              value={message}
            />
            {errors.message === undefined ? null : (
              <FieldStatus tone="danger">{errors.message}</FieldStatus>
            )}
          </Field>
        </FormLayout>

        <Text size="sm" tone="muted">
          By sending this you accept our{' '}
          <Link href="/privacy">privacy notice</Link>.
        </Text>
      </Stack>
    </Card>
  );
}
