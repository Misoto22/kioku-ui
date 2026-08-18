import {useRef, useState} from 'react';

import {
  Alert,
  Button,
  Card,
  CheckboxInput,
  Field,
  FormLayout,
  Heading,
  MetadataList,
  Section,
  Selector,
  Stack,
  Text,
  TextInput,
} from '@misoto22/kioku-ui';

const countries = [
  {label: 'Australia', value: 'AU'},
  {label: 'Japan', value: 'JP'},
  {label: 'United Kingdom', value: 'UK'},
];

const summary = [
  {detail: 'Team plan, 12 seats', term: 'Plan'},
  {detail: 'Monthly', term: 'Billing period'},
  {detail: 'A$480.00', term: 'Total'},
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
    <Stack gap="lg">
      <Heading level={1} size="section">
        Payment details
      </Heading>

      <Alert tone="info">
        Card details are handled by our payment provider and never reach this
        application.
      </Alert>

      <Card>
        <MetadataList entries={summary} layout="inline" />
      </Card>

      <Card>
        <FormLayout
          actions={<Button onClick={handleSubmit}>Pay A$480.00</Button>}
          onSubmit={(event) => {
            event.preventDefault();
            handleSubmit();
          }}
        >
          <Section>
            <Stack gap="md">
              <Heading level={2} size="subsection">
                Card
              </Heading>

              {/*
                Mount points for the provider's hosted fields. They render an
                iframe owned by the provider; nothing here reads their value.
              */}
              <Field label="Card number">
                <div data-provider-field="card-number" ref={cardFieldRef} />
              </Field>
              <Field label="Expiry">
                <div data-provider-field="expiry" ref={expiryFieldRef} />
              </Field>
              <Field label="Security code">
                <div data-provider-field="cvc" ref={securityFieldRef} />
              </Field>
            </Stack>
          </Section>

          <Section>
            <Stack gap="md">
              <Heading level={2} size="subsection">
                Billing address
              </Heading>
              <Field label="Name on card">
                <TextInput
                  autoComplete="cc-name"
                  onValueChange={setName}
                  value={name}
                />
              </Field>
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
