import {useState} from 'react';

import {
  Button,
  Card,
  Center,
  Field,
  FieldStatus,
  FormLayout,
  Heading,
  Stack,
  Text,
  TextInput,
} from '@misoto22/kioku-ui';

/**
 * A centred sign-in card. The submit handler is a stub: wire it to your own
 * authentication service, and never post credentials from this file directly.
 */
export function LoginCardPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  function handleSubmit() {
    if (email === '' || password === '') {
      setError('Enter your email address and password.');
      return;
    }
    setError('');
    // Replace with a call to your own authentication service.
  }

  return (
    <Center>
      <Card>
        <Stack gap="lg">
          <Stack gap="xs">
            <Heading level={1} size="subsection">
              Sign in
            </Heading>
            <Text size="sm" tone="secondary">
              Use the account your team already has.
            </Text>
          </Stack>
          <FormLayout
            actions={<Button onClick={handleSubmit}>Sign in</Button>}
            onSubmit={(event) => {
              event.preventDefault();
              handleSubmit();
            }}
          >
            <Field label="Email address">
              <TextInput
                autoComplete="email"
                onValueChange={setEmail}
                type="email"
                value={email}
              />
            </Field>
            <Field label="Password">
              <TextInput
                autoComplete="current-password"
                onValueChange={setPassword}
                type="password"
                value={password}
              />
            </Field>
            {error === '' ? null : (
              <FieldStatus tone="danger">{error}</FieldStatus>
            )}
          </FormLayout>
        </Stack>
      </Card>
    </Center>
  );
}
