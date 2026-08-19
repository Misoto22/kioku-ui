import {useState} from 'react';

import {
  Blockquote,
  Button,
  Field,
  FormLayout,
  HStack,
  Heading,
  Icon,
  Link,
  Stack,
  Text,
  TextInput,
} from '@misoto22/kioku-ui';

// The width a half holds before the two stack. The spacing scale has no name
// for a measure, so it is built out of the scale rather than written as a
// length.
const panelMeasure = 'calc(12 * var(--kioku-ui-spacing-2xl))';

// Both halves are set the same way; only the paper under them differs.
const panel = {
  display: 'grid',
  gap: 'var(--kioku-ui-spacing-xl)',
  padding: 'var(--kioku-ui-spacing-2xl)',
};

/**
 * A two-column sign-in page. The brand panel is decorative: it wraps away on
 * narrow viewports, and nothing a reader needs lives only there.
 *
 * The submit handler is a stub: wire it to your own authentication service,
 * and never post credentials from this file directly.
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
        // The halves tile: the hairline between them is the grid's own gap
        // showing the border colour through, so the rule is drawn once rather
        // than once per panel.
        backgroundColor: 'var(--kioku-ui-border-default)',
        display: 'grid',
        gap: 'var(--kioku-ui-border-width)',
        gridTemplateColumns: `repeat(auto-fit, minmax(min(100%, ${panelMeasure}), 1fr))`,
        minHeight: '100vh',
      }}
    >
      <div
        style={{
          ...panel,
          alignContent: 'space-between',
          backgroundColor: 'var(--kioku-ui-color-surface)',
        }}
      >
        <HStack gap="sm">
          <Icon size="lg">
            <rect
              fill="none"
              height="17"
              rx="1.5"
              stroke="currentColor"
              strokeWidth="2"
              width="17"
              x="3.5"
              y="3.5"
            />
            <path
              d="M3.5 14h17M12 3.5v17"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            />
          </Icon>
          <Heading family="display" level={2} size="subsection">
            Your product
          </Heading>
        </HStack>

        <Blockquote attribution="A customer, probably">
          The part that used to take an afternoon now takes a minute.
        </Blockquote>
      </div>

      <div
        style={{
          ...panel,
          alignContent: 'center',
          backgroundColor: 'var(--kioku-ui-color-canvas)',
        }}
      >
        <Stack gap="sm">
          <Heading level={1} size="section">
            Sign in
          </Heading>
          <Text tone="secondary">Use the account your team already has.</Text>
        </Stack>

        <FormLayout
          actions={
            // One action, so it takes the whole column: a seal pressed across
            // the sheet rather than a button in the corner of a row it shares
            // with nothing.
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
        </FormLayout>

        <Text size="sm" tone="secondary">
          No account yet? <Link href="/signup">Ask your administrator.</Link>
        </Text>
      </div>
    </div>
  );
}
