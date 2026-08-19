import {useState, type CSSProperties} from 'react';

import {
  Avatar,
  Box,
  Card,
  CardHeader,
  Eyebrow,
  Field,
  Grid,
  Heading,
  Icon,
  Item,
  Layout,
  Link,
  NavIcon,
  NavItem,
  NavMenu,
  Selector,
  SideNav,
  SideNavSection,
  Stack,
  Switch,
  TextInput,
} from '@misoto22/kioku-ui';

// `Eyebrow` carries the type, so a card title that has to stay in the document
// outline keeps only its own box: no margin, and no inline strut of its own to
// make the row taller than the label inside it.
const eyebrowHeading: CSSProperties = {display: 'flex', margin: 0};

// Rows tile: one hairline apart, drawn with the gap rather than a border per
// cell, so no interior line is painted twice.
const tiles: CSSProperties = {
  backgroundColor: 'var(--kioku-ui-border-default)',
  display: 'grid',
  gap: 'var(--kioku-ui-border-width)',
};

const sections = [
  {
    items: [
      {
        glyph: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 8a7 7 0 0 1 14 0',
        href: '/settings/profile',
        label: 'Profile',
      },
      {
        glyph:
          'M6 10a6 6 0 0 1 12 0c0 3.9 1.2 5.6 1.8 6.3H4.2C4.8 15.6 6 13.9 6 10Zm3.9 9.5a2.4 2.4 0 0 0 4.2 0',
        href: '/settings/notifications',
        label: 'Notifications',
      },
      {
        glyph: 'M7.2 10.5V7.8a4.8 4.8 0 0 1 9.6 0v2.7M5.1 10.5h13.8v9.6H5.1Z',
        href: '/settings/security',
        label: 'Security',
      },
    ],
    title: 'Account',
  },
  {
    items: [
      {
        glyph:
          'M12 15.3a3.3 3.3 0 1 0 0-6.6 3.3 3.3 0 0 0 0 6.6ZM12 3.3v2.4M12 18.3v2.4M20.7 12h-2.4M5.7 12H3.3M18.2 5.8 16.5 7.5M7.5 16.5l-1.7 1.7M18.2 18.2 16.5 16.5M7.5 7.5 5.8 5.8',
        href: '/settings/general',
        label: 'General',
      },
      {
        glyph:
          'M9.3 12.6a3.6 3.6 0 1 0 0-7.2 3.6 3.6 0 0 0 0 7.2ZM3.3 19.5a6 6 0 0 1 12 0M15.6 6.2a3.3 3.3 0 0 1 0 5.7M17.4 19.5a5.4 5.4 0 0 0-2.3-3.8',
        href: '/settings/members',
        label: 'Members',
      },
      {
        glyph: 'M3.3 6h17.4v12H3.3ZM3.3 10.2h17.4M6.9 14.7h3.9',
        href: '/settings/billing',
        label: 'Billing',
      },
    ],
    title: 'Workspace',
  },
];

interface SettingsSidebarPageProps {
  readonly currentHref?: string;
}

const timezones = [
  {label: 'Australia/Perth', value: 'perth'},
  {label: 'Asia/Tokyo', value: 'tokyo'},
];

const languages = [
  {label: 'English', value: 'en'},
  {label: '日本語', value: 'ja'},
];

/**
 * Settings spread across sections, each of them a destination of its own with
 * its own URL — which is why the sections are reached from a navigation rail
 * rather than a `TabList`. If your sections are panels of a single page and
 * the URL does not change, use `TabList` instead: a link that does not
 * navigate lies about what activating it does.
 *
 * The rail marks the reader's location with ink alone — no bar, no added
 * weight. A rail is a short column of short words, and `aria-current` carries
 * the fact for anyone who cannot see the difference. Nothing on the panel
 * submits: every control applies as it is changed.
 */
export function SettingsSidebarPage({
  currentHref = '/settings/general',
}: SettingsSidebarPageProps) {
  const [name, setName] = useState('Ada Lovelace');
  const [timezone, setTimezone] = useState('perth');
  const [language, setLanguage] = useState('en');
  const [liveUpdates, setLiveUpdates] = useState(true);
  const [digest, setDigest] = useState(false);

  return (
    <Layout
      mainId="settings"
      pageHead={
        <>
          <Eyebrow>WORKSPACE</Eyebrow>
          <Heading level={1} size="section">
            General
          </Heading>
        </>
      }
      sidebar={
        <SideNav
          footer={
            <Item
              description={<Eyebrow tone="muted">OWNER</Eyebrow>}
              leading={<Avatar name="Ada Lovelace" size="sm" />}
              trailing={<Link href="/sign-out">Sign out</Link>}
            >
              Ada Lovelace
            </Item>
          }
        >
          {sections.map((section) => (
            <SideNavSection key={section.title} title={section.title}>
              <NavMenu label={section.title}>
                {section.items.map((item) => (
                  <NavItem
                    current={item.href === currentHref}
                    href={item.href}
                    key={item.href}
                    leading={
                      <NavIcon>
                        <Icon>
                          <path
                            d={item.glyph}
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.6"
                          />
                        </Icon>
                      </NavIcon>
                    }
                  >
                    {item.label}
                  </NavItem>
                ))}
              </NavMenu>
            </SideNavSection>
          ))}
        </SideNav>
      }
    >
      <Stack gap="xl">
        <Card>
          <CardHeader>
            <h2 style={eyebrowHeading}>
              <Eyebrow>WORKSPACE</Eyebrow>
            </h2>
          </CardHeader>
          <Grid columns={2} gap="lg">
            <Field label="Display name">
              <TextInput onValueChange={setName} value={name} />
            </Field>
            <Field
              description="Used for every timestamp shown to you."
              label="Time zone"
            >
              <Selector
                onValueChange={setTimezone}
                options={timezones}
                value={timezone}
              />
            </Field>
            <Field label="Language">
              <Selector
                onValueChange={setLanguage}
                options={languages}
                value={language}
              />
            </Field>
            <Field label="Workspace ID">
              <TextInput defaultValue="ws_0f42a1c9" readOnly />
            </Field>
          </Grid>
        </Card>

        <Card>
          <CardHeader>
            <h2 style={eyebrowHeading}>
              <Eyebrow>NOTIFICATIONS</Eyebrow>
            </h2>
          </CardHeader>
          <div style={tiles}>
            <Box padding="md" surface="surface">
              <Item
                description="Applies as soon as it is flipped"
                trailing={
                  <Switch
                    aria-label="Live updates"
                    onPressedChange={setLiveUpdates}
                    pressed={liveUpdates}
                  />
                }
              >
                Live updates
              </Item>
            </Box>
            <Box padding="md" surface="surface">
              <Item
                description="One message each morning instead of many"
                trailing={
                  <Switch
                    aria-label="Daily digest"
                    onPressedChange={setDigest}
                    pressed={digest}
                  />
                }
              >
                Daily digest
              </Item>
            </Box>
          </div>
        </Card>
      </Stack>
    </Layout>
  );
}
