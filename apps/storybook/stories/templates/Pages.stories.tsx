import type {Meta, StoryObj} from '@storybook/react-vite';

import {Card, Heading, Stack, Text} from '@misoto22/kioku-ui';

// Templates are imported from the CLI's asset directory rather than copied
// here, so what this previews is exactly what `kioku-ui add` writes out. It
// also brings the templates under a typecheck, which nothing else covered.
import {BlankPage} from '../../../../packages/cli/assets/templates/pages/blank/BlankPage';
import {DashboardPage} from '../../../../packages/cli/assets/templates/pages/dashboard/DashboardPage';
import {LoginPage} from '../../../../packages/cli/assets/templates/pages/login/LoginPage';
import {LoginCardPage} from '../../../../packages/cli/assets/templates/pages/login-card/LoginCardPage';
import {LoginSplitPage} from '../../../../packages/cli/assets/templates/pages/login-split/LoginSplitPage';
import {LoginSsoPage} from '../../../../packages/cli/assets/templates/pages/login-sso/LoginSsoPage';
import {ContactFormPage} from '../../../../packages/cli/assets/templates/pages/contact-form/ContactFormPage';
import {TwoColumnFormPage} from '../../../../packages/cli/assets/templates/pages/form-two-column/TwoColumnFormPage';
import {PaymentFormPage} from '../../../../packages/cli/assets/templates/pages/payment-form/PaymentFormPage';
import {SettingsPage} from '../../../../packages/cli/assets/templates/pages/settings/SettingsPage';
import {SettingsDialogPage} from '../../../../packages/cli/assets/templates/pages/settings-dialog/SettingsDialogPage';
import {SettingsSidebarPage} from '../../../../packages/cli/assets/templates/pages/settings-sidebar/SettingsSidebarPage';
import {MessagingShell} from '../../../../packages/cli/assets/templates/pages/messaging-shell/MessagingShell';
import {NavShell} from '../../../../packages/cli/assets/templates/pages/shell-nav/NavShell';
import {SideNavShell} from '../../../../packages/cli/assets/templates/pages/shell-side-nav/SideNavShell';
import {TopNavShell} from '../../../../packages/cli/assets/templates/pages/shell-top-nav/TopNavShell';

const meta = {
  id: 'templates-pages',
  title: 'Templates/Pages',
  parameters: {layout: 'fullscreen'},
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Blank: Story = {render: () => <BlankPage />};
export const Dashboard: Story = {render: () => <DashboardPage />};
export const Login: Story = {render: () => <LoginPage />};
export const LoginCard: Story = {render: () => <LoginCardPage />};
export const LoginSplit: Story = {render: () => <LoginSplitPage />};
export const LoginSso: Story = {render: () => <LoginSsoPage />};

// The shells frame a page rather than being one, so they need a body.
function SampleBody() {
  return (
    <Stack gap="md">
      <Heading level={1} size="section">
        Release 12
      </Heading>
      <Card>
        <Text>
          Replace this with your own page. The shell owns navigation and the
          skip link; everything here is the main region.
        </Text>
      </Card>
    </Stack>
  );
}

export const ShellTopNav: Story = {
  render: () => (
    <TopNavShell>
      <SampleBody />
    </TopNavShell>
  ),
};

export const ShellSideNav: Story = {
  render: () => (
    <SideNavShell>
      <SampleBody />
    </SideNavShell>
  ),
};

export const ShellNav: Story = {
  render: () => (
    <NavShell>
      <SampleBody />
    </NavShell>
  ),
};

export const MessagingShellPage: Story = {render: () => <MessagingShell />};

export const ContactForm: Story = {render: () => <ContactFormPage />};
export const FormTwoColumn: Story = {render: () => <TwoColumnFormPage />};
export const PaymentForm: Story = {render: () => <PaymentFormPage />};
export const Settings: Story = {render: () => <SettingsPage />};
export const SettingsSidebar: Story = {render: () => <SettingsSidebarPage />};
export const SettingsDialog: Story = {render: () => <SettingsDialogPage />};
