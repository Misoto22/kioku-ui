import {useState} from 'react';

import {
  Button,
  Card,
  Center,
  Collapsible,
  Divider,
  Eyebrow,
  Field,
  FormLayout,
  HStack,
  Heading,
  Icon,
  Stack,
  Text,
  TextInput,
} from '@misoto22/kioku-ui';

// The measure the card is set to. The spacing scale has no name for a measure,
// so it is built out of the scale rather than written as a length.
const cardMeasure = 'calc(12 * var(--kioku-ui-spacing-2xl))';

/**
 * Single sign-on first, with the email form folded away behind it. The
 * fallback stays in the DOM while folded, so a password manager and
 * find-in-page can both still reach it.
 *
 * Only the work account carries the ink: one emphatic action per scope, and
 * the fallback below the rule is the subordinate one.
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
      <div style={{maxWidth: cardMeasure, width: '100%'}}>
        <Card>
          <Stack gap="xl">
            <Stack gap="sm">
              <Heading level={1} size="section">
                Sign in
              </Heading>
              <Text tone="secondary">
                Most people sign in with their work account.
              </Text>
            </Stack>

            <Stack gap="md">
              <Button onClick={() => startSso('workspace')}>
                <Icon>
                  <path
                    d="M4 20V4.5l8-1.5V20M12 9h8v11M7 8h2M7 12h2M7 16h2M15 12h2M15 16h2"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </Icon>
                Continue with your work account
              </Button>
              <Button onClick={() => startSso('saml')} variant="secondary">
                <Icon>
                  <circle
                    cx="7.5"
                    cy="12"
                    fill="none"
                    r="3.9"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <path
                    d="M11.4 12h9.3M17.1 12v3.6M20.7 12v3"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </Icon>
                Continue with SAML
              </Button>
            </Stack>

            <HStack gap="md">
              <div style={{flexGrow: 1}}>
                <Divider />
              </div>
              <Eyebrow>or</Eyebrow>
              <div style={{flexGrow: 1}}>
                <Divider />
              </div>
            </HStack>

            <Collapsible label="Sign in with an email address instead">
              <FormLayout
                actions={
                  // The subordinate seal: it still takes the whole measure, so
                  // the fallback reads as the same form the other variants
                  // show, but the ink stays with the work account above.
                  <div style={{display: 'grid', flexGrow: 1}}>
                    <Button onClick={handleSubmit} variant="secondary">
                      Sign in
                    </Button>
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
      </div>
    </Center>
  );
}
