import {AppShell, Card, Heading, Text, TopNav} from '@misoto22/kioku-ui';

/**
 * A page with nothing but the shell around it. Own this file: connect it to
 * your own routes, data, and copy.
 */
export function BlankPage() {
  return (
    <AppShell header={<TopNav brand="Your product" />}>
      <Heading level={1} size="section">
        Page title
      </Heading>
      <Card>
        <Text>Replace this card with the content of your page.</Text>
      </Card>
    </AppShell>
  );
}
