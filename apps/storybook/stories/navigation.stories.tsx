import type {Meta, StoryObj} from '@storybook/react-vite';

import {
  Link as LinkComponent,
  LinkProvider as LinkProviderComponent,
} from '@misoto22/kioku-ui';

const meta = {
  title: 'Navigation',
  component: LinkComponent,
} satisfies Meta<typeof LinkComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Link: Story = {
  render: () => (
    <LinkComponent
      href="/records"
      style={{color: 'var(--kioku-ui-color-text)'}}
    >
      Open records
    </LinkComponent>
  ),
};

export const LinkProvider: Story = {
  render: () => (
    <LinkProviderComponent
      renderLink={({children, ...props}) => (
        <a {...props} data-host-router-link="true">
          {children}
        </a>
      )}
    >
      <LinkComponent
        href="/timeline"
        style={{color: 'var(--kioku-ui-color-text)'}}
      >
        Open timeline with host routing
      </LinkComponent>
    </LinkProviderComponent>
  ),
};
