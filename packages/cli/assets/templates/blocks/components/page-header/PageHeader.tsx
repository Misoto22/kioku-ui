import type {ReactNode} from 'react';

import {
  Breadcrumbs,
  HStack,
  Heading,
  Stack,
  Text,
  type BreadcrumbItem,
} from '@misoto22/kioku-ui';

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
    <Stack gap="sm">
      {breadcrumbs === undefined ? null : <Breadcrumbs items={breadcrumbs} />}
      <HStack align="start" justify="between">
        <Stack gap="xs">
          <Heading level={1} size="section">
            {title}
          </Heading>
          {description === undefined ? null : (
            <Text tone="secondary">{description}</Text>
          )}
        </Stack>
        {actions === undefined ? null : <HStack gap="sm">{actions}</HStack>}
      </HStack>
    </Stack>
  );
}
