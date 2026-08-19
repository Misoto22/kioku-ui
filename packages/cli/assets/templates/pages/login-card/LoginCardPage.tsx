import {useState} from 'react';

import {
  Button,
  Card,
  Center,
  Field,
  FieldStatus,
  FormLayout,
  Heading,
  Link,
  Stack,
  Text,
  TextInput,
} from '@misoto22/kioku-ui';

// The measure the card is set to. The spacing scale has no name for a measure,
// so it is built out of the scale rather than written as a length.
const cardMeasure = 'calc(12 * var(--kioku-ui-spacing-2xl))';

/**
 * A centred sign-in card: the default frame. The card is the only thing this
 * variant adds to the plain form — same type, same fields, same seal.
 *
 * The submit handler is a stub: wire it to your own authentication service,
 * and never post credentials from this file directly.
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
      <div style={{maxWidth: cardMeasure, width: '100%'}}>
        <Card>
          <Stack gap="xl">
            <Stack gap="sm">
              <Heading level={1} size="section">
                Sign in
              </Heading>
              <Text tone="secondary">
                Use the account your team already has.
              </Text>
            </Stack>

            <FormLayout
              actions={
                // One action, so it takes the whole card: a seal pressed
                // across the sheet rather than a button in the corner of a row
                // it shares with nothing.
                <div style={{display: 'grid', flexGrow: 1}}>
                  <Button onClick={handleSubmit}>Sign in</Button>
                </div>
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
              {error === '' ? null : (
                <FieldStatus tone="danger">{error}</FieldStatus>
              )}
            </FormLayout>

            <Text size="sm" tone="secondary">
              <Link href="/reset-password">Forgot your password?</Link>
            </Text>
          </Stack>
        </Card>
      </div>
    </Center>
  );
}
