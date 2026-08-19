import {useRef, useState, type CSSProperties} from 'react';

import {
  Button,
  Card,
  CardHeader,
  CheckboxInput,
  Divider,
  Eyebrow,
  Field,
  FormLayout,
  Grid,
  HStack,
  Heading,
  Icon,
  MetadataList,
  Numeral,
  Section,
  Selector,
  Stack,
  Text,
  TextInput,
} from '@misoto22/kioku-ui';

const total = 'A$480.00';

// `Eyebrow` carries the type, so a section title that has to stay in the
// document outline keeps only its own box: no margin, and no inline strut of
// its own to make the row taller than the label inside it.
const eyebrowHeading: CSSProperties = {display: 'flex', margin: 0};

/**
 * The well a `TextInput` draws, reproduced exactly: the same sunken fill, the
 * same hairline in the strong border, the same 3px corner, the same control
 * height and inset. The provider paints its own iframe inside this box, so the
 * box has to be ours or the field will not match the ones beside it.
 *
 * It is written as a style object rather than as a component because these
 * elements must stay plain `div`s — see the note on the component below.
 */
const hostedField: CSSProperties = {
  backgroundColor: 'var(--kioku-ui-color-surface-muted)',
  borderColor: 'var(--kioku-ui-border-strong)',
  borderRadius: 'var(--kioku-ui-radius-element)',
  borderStyle: 'var(--kioku-ui-border-style)',
  borderWidth: 'var(--kioku-ui-border-width)',
  blockSize: 'var(--kioku-ui-size-control-md)',
  boxSizing: 'border-box',
  color: 'var(--kioku-ui-color-text)',
  // A card number is a figure: mono, tabular, and tightened with the rest.
  fontFamily: 'var(--kioku-ui-typography-font-family-mono)',
  fontSize: 'var(--kioku-ui-typography-font-size-md)',
  fontVariantNumeric: 'tabular-nums',
  letterSpacing: 'var(--kioku-ui-typography-letter-spacing-mono)',
  paddingBlock: 'var(--kioku-ui-spacing-xs)',
  paddingInline: 'var(--kioku-ui-spacing-sm)',
};

const countries = [
  {label: 'Australia', value: 'AU'},
  {label: 'Japan', value: 'JP'},
  {label: 'United Kingdom', value: 'UK'},
];

const order = [
  {detail: 'Team plan, 12 seats', term: 'Plan'},
  {detail: 'Monthly', term: 'Billing period'},
];

/**
 * A checkout form.
 *
 * The card number, expiry, and security code are deliberately NOT rendered as
 * inputs here. They are mounted by your payment provider into the elements
 * below, so the values live inside the provider's iframe and never enter this
 * application's DOM, state, or network requests.
 *
 * Handling raw card data yourself pulls your whole application into PCI DSS
 * scope. Every major provider — Stripe, Adyen, Braintree — ships hosted fields
 * for exactly this reason. Replace `mountProviderFields` with their SDK call
 * and submit the token it returns, never the card details.
 *
 * Pay is the only ink-filled button on the page — one seal per scope.
 * Everything else that could be a button here is paper with a hairline edge.
 */
export function PaymentFormPage() {
  const cardFieldRef = useRef<HTMLDivElement>(null);
  const expiryFieldRef = useRef<HTMLDivElement>(null);
  const securityFieldRef = useRef<HTMLDivElement>(null);

  const [name, setName] = useState('');
  const [postcode, setPostcode] = useState('');
  const [country, setCountry] = useState('AU');
  const [saveCard, setSaveCard] = useState(false);

  function handleSubmit() {
    // Ask the provider's SDK to tokenise its own fields, then send the token —
    // and only the token — to your server.
  }

  return (
    <Stack gap="xl">
      <Stack gap="sm">
        <Eyebrow>CHECKOUT</Eyebrow>
        <Heading level={1} size="section">
          Payment details
        </Heading>
      </Stack>

      {/*
        Paper, not a status surface. This is a reassurance the reader can act
        on, not a condition that has arisen, so it takes the same hairline
        plate as everything else rather than a tinted alert.
      */}
      <Card>
        <HStack align="start" gap="md">
          <Icon size="lg" tone="secondary">
            <path
              d="M7.2 10.5V7.8a4.8 4.8 0 0 1 9.6 0v2.7M5.1 10.5h13.8v9.6H5.1Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
            />
          </Icon>
          <Text size="sm" tone="secondary">
            Card details are handled by our payment provider and never reach
            this application.
          </Text>
        </HStack>
      </Card>

      <Card>
        <CardHeader>
          <h2 style={eyebrowHeading}>
            <Eyebrow>ORDER</Eyebrow>
          </h2>
        </CardHeader>
        <Stack gap="md">
          <MetadataList entries={order} layout="inline" />
          <Divider />
          <HStack align="baseline" gap="xl" justify="between">
            <Text>Total</Text>
            <Text size="lg">
              <Numeral>{total}</Numeral>
            </Text>
          </HStack>
        </Stack>
      </Card>

      <Card>
        <FormLayout
          actions={<Button onClick={handleSubmit}>{`Pay ${total}`}</Button>}
          onSubmit={(event) => {
            event.preventDefault();
            handleSubmit();
          }}
        >
          <Section>
            <Stack gap="md">
              <h2 style={eyebrowHeading}>
                <Eyebrow>CARD</Eyebrow>
              </h2>

              {/*
                Mount points for the provider's hosted fields. They render an
                iframe owned by the provider; nothing here reads their value.
                They must stay `div` elements — turning one into an `input`
                would put a card number into this application's DOM and pull
                the page back into PCI DSS scope.
              */}
              <Field label="Card number">
                <div
                  data-provider-field="card-number"
                  ref={cardFieldRef}
                  style={hostedField}
                />
              </Field>
              <Grid columns={2} gap="lg">
                <Field label="Expiry">
                  <div
                    data-provider-field="expiry"
                    ref={expiryFieldRef}
                    style={hostedField}
                  />
                </Field>
                <Field label="Security code">
                  <div
                    data-provider-field="cvc"
                    ref={securityFieldRef}
                    style={hostedField}
                  />
                </Field>
              </Grid>
            </Stack>
          </Section>

          <Divider />

          <Section>
            <Stack gap="md">
              <h2 style={eyebrowHeading}>
                <Eyebrow>BILLING ADDRESS</Eyebrow>
              </h2>
              <Field label="Name on card">
                <TextInput
                  autoComplete="cc-name"
                  onValueChange={setName}
                  value={name}
                />
              </Field>
              <Grid columns={2} gap="lg">
                <Field label="Postcode">
                  <TextInput
                    autoComplete="postal-code"
                    onValueChange={setPostcode}
                    value={postcode}
                  />
                </Field>
                <Field label="Country">
                  <Selector
                    autoComplete="country"
                    onValueChange={setCountry}
                    options={countries}
                    value={country}
                  />
                </Field>
              </Grid>
              <CheckboxInput
                checked={saveCard}
                description="Stored by the payment provider, not by us."
                label="Save this card for next time"
                onCheckedChange={setSaveCard}
              />
            </Stack>
          </Section>
        </FormLayout>
      </Card>

      <Text size="sm" tone="muted">
        Replace the mount points above with your provider's hosted fields before
        taking a real payment.
      </Text>
    </Stack>
  );
}
