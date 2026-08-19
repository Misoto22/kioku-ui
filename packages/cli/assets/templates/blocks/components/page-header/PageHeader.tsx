import type {CSSProperties, ReactNode} from 'react';

import {
  Breadcrumbs,
  HStack,
  Heading,
  Stack,
  Text,
  type BreadcrumbItem,
} from '@misoto22/kioku-ui';

// The same opening `Layout` draws for a page it frames: the head is parted
// from the body by a rule in the strong border, one weight above the hairlines
// that separate rows. A page head without it reads as the first block of
// content rather than as the opening of the page.
const head: CSSProperties = {
  boxShadow:
    'inset 0 calc(-1 * var(--kioku-ui-border-width)) 0 var(--kioku-ui-border-strong)',
  paddingBlockEnd: 'var(--kioku-ui-spacing-lg)',
};

interface PageHeaderProps {
  readonly actions?: ReactNode;
  readonly breadcrumbs?: readonly BreadcrumbItem[];
  readonly description?: ReactNode;
  readonly title: ReactNode;
}

/** A page title with its trail and primary actions. */
export function PageHeader({
  actions,
  breadcrumbs,
  description,
  title,
}: PageHeaderProps) {
  return (
    <header style={head}>
      <Stack gap="sm">
        {breadcrumbs === undefined ? null : <Breadcrumbs items={breadcrumbs} />}
        <HStack align="start" gap="lg" justify="between">
          <Stack gap="xs">
            <Heading level={1} size="section">
              {title}
            </Heading>
            {description === undefined ? null : (
              <Text size="sm" tone="secondary">
                {description}
              </Text>
            )}
          </Stack>
          {actions === undefined ? null : <HStack gap="sm">{actions}</HStack>}
        </HStack>
      </Stack>
    </header>
  );
}
