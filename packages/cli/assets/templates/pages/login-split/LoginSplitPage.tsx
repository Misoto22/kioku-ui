import {useState} from 'react';

import {
  Blockquote,
  Button,
  Field,
  FormLayout,
  Heading,
  Link,
  Stack,
  Text,
  TextInput,
} from '@misoto22/kioku-ui';

/**
 * A two-column sign-in page. The brand panel is decorative: it collapses away
 * on narrow viewports, and nothing a reader needs lives only there.
 */
export function LoginSplitPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  function handleSubmit() {
    // Replace with a call to your own authentication service.
  }

  return (
    <div
      style={{
        display: 'grid',
        gap: 'var(--kioku-ui-spacing-2xl)',
        gridTemplateColumns: 'repeat(auto-fit, minmax(20rem, 1fr))',
        minHeight: '100vh',
        padding: 'var(--kioku-ui-spacing-2xl)',
      }}
    >
      <Stack align="start" gap="lg">
        <Heading family="display" level={2} size="section">
          Your product
        </Heading>
        <Blockquote attribution="A customer, probably">
          The part that used to take an afternoon now takes a minute.
        </Blockquote>
      </Stack>

      <Stack gap="lg">
        <Stack gap="xs">
          <Heading level={1} size="section">
            Sign in
          </Heading>
          <Text tone="secondary">Use the account your team already has.</Text>
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
          No account yet? <Link href="/signup">Ask your administrator.</Link>
        </Text>
      </Stack>
    </div>
  );
}
