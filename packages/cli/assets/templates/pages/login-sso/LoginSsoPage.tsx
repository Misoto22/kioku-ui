import {useState} from 'react';

import {
  Button,
  Card,
  Center,
  Collapsible,
  Divider,
  Field,
  FormLayout,
  Heading,
  Stack,
  Text,
  TextInput,
} from '@misoto22/kioku-ui';

const providers = [
  {id: 'workspace', label: 'Continue with your work account'},
  {id: 'saml', label: 'Continue with SAML'},
];

/**
 * Single sign-on first, with the email form folded away behind it. The
 * fallback stays in the DOM while folded, so a password manager and
 * find-in-page can both still reach it.
 */
export function LoginSsoPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  function startSso(providerId: string) {
    // Replace with a redirect to your own identity provider.
    void providerId;
  }

  function handleSubmit() {
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
              Most people sign in with their work account.
            </Text>
          </Stack>

          <Stack gap="sm">
            {providers.map((provider) => (
              <Button key={provider.id} onClick={() => startSso(provider.id)}>
                {provider.label}
              </Button>
            ))}
          </Stack>

          <Divider />

          <Collapsible label="Sign in with an email address instead">
            <FormLayout
              actions={
                <Button onClick={handleSubmit} variant="secondary">
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
            </FormLayout>
          </Collapsible>
        </Stack>
      </Card>
    </Center>
  );
}
