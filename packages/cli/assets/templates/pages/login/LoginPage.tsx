import {useState} from 'react';

import {
  Alert,
  Button,
  Center,
  Field,
  FormLayout,
  Heading,
  Link,
  Stack,
  Text,
  TextInput,
} from '@misoto22/kioku-ui';

/**
 * A plain sign-in form. The submit handler is a stub: wire it to your own
 * authentication service. Never post credentials from this file directly, and
 * keep the failure message vague — saying which field was wrong tells an
 * attacker which addresses exist.
 */
export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [failed, setFailed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function handleSubmit() {
    setSubmitting(true);
    // Replace with a call to your own authentication service.
    setFailed(email === '' || password === '');
    setSubmitting(false);
  }

  return (
    <Center>
      <Stack gap="lg">
        <Stack gap="xs">
          <Heading level={1} size="section">
            Sign in
          </Heading>
          <Text tone="secondary">Use the account your team already has.</Text>
        </Stack>

        {failed ? (
          <Alert tone="danger">Those details did not match an account.</Alert>
        ) : null}

        <FormLayout
          actions={
            <Button loading={submitting} onClick={handleSubmit}>
              Sign in
            </Button>
          }
          onSubmit={(event) => {
            event.preventDefault();
            handleSubmit();
          }}
        >
          <Field label="Email address">
            <TextInput
              autoComplete="email"
              onValueChange={setEmail}
              required
              type="email"
              value={email}
            />
          </Field>
          <Field label="Password">
            <TextInput
              autoComplete="current-password"
              onValueChange={setPassword}
              required
              type="password"
              value={password}
            />
          </Field>
        </FormLayout>

        <Text size="sm" tone="secondary">
          <Link href="/reset-password">Forgot your password?</Link>
        </Text>
      </Stack>
    </Center>
  );
}
