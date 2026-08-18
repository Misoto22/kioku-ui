import * as stylex from '@stylexjs/stylex';
import type {HTMLAttributes} from 'react';

import {semanticTokens} from '../authoring.stylex.js';
import {Avatar, type AvatarSize} from '../Avatar/index.js';

const styles = stylex.create({
  group: {
    alignItems: 'center',
    display: 'inline-flex',
    fontFamily: semanticTokens.fontFamilyBody,
  },
  // The ring is painted in the surface the stack sits on, so the overlap
  // reads as one avatar in front of another rather than as a merged blob.
  slot: {
    borderColor: semanticTokens.colorSurface,
    borderRadius: semanticTokens.radiusFull,
    borderStyle: semanticTokens.borderStyle,
    borderWidth: semanticTokens.focusWidth,
    display: 'inline-flex',
    marginInlineStart: `calc(-1 * ${semanticTokens.spacingSm})`,
  },
  first: {marginInlineStart: 0},
  overflow: {
    alignItems: 'center',
    backgroundColor: semanticTokens.colorSurfaceMuted,
    borderRadius: semanticTokens.radiusFull,
    color: semanticTokens.colorTextSecondary,
    display: 'inline-flex',
    flexShrink: 0,
    fontFamily: semanticTokens.fontFamilyMono,
    fontVariantNumeric: 'tabular-nums',
    fontWeight: semanticTokens.fontWeightMedium,
    justifyContent: 'center',
    letterSpacing: semanticTokens.letterSpacingMono,
    lineHeight: 1,
  },
  overflowSm: {
    fontSize: semanticTokens.fontSizeXs,
    height: semanticTokens.sizeControlSm,
    width: semanticTokens.sizeControlSm,
  },
  overflowMd: {
    fontSize: semanticTokens.fontSizeSm,
    height: semanticTokens.sizeControlMd,
    width: semanticTokens.sizeControlMd,
  },
  overflowLg: {
    fontSize: semanticTokens.fontSizeMd,
    height: semanticTokens.sizeControlLg,
    width: semanticTokens.sizeControlLg,
  },
});

const overflowSizes = {
  sm: styles.overflowSm,
  md: styles.overflowMd,
  lg: styles.overflowLg,
} as const;

/** One member of an avatar group. */
export interface AvatarGroupMember {
  readonly name: string;
  readonly src?: string;
}

/** Props for a capped, overlapping row of avatars. */
export interface AvatarGroupProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'children' | 'className'
> {
  readonly label: string;
  readonly max?: number;
  readonly members: readonly AvatarGroupMember[];
  readonly size?: AvatarSize;
}

/**
 * Shows several people as one overlapping row. Everyone past `max` is counted
 * rather than drawn, and the group carries a single label so a screen reader
 * hears "4 reviewers" instead of four separate images.
 */
export function AvatarGroup({
  label,
  max = 4,
  members,
  size = 'md',
  ...props
}: AvatarGroupProps) {
  const shown = members.slice(0, max);
  const hidden = members.length - shown.length;

  return (
    <div
      {...props}
      aria-label={`${label}: ${members.length}`}
      role="group"
      {...stylex.props(styles.group)}
    >
      {shown.map((member, index) => (
        <span
          key={member.name}
          {...stylex.props(styles.slot, index === 0 && styles.first)}
        >
          <Avatar
            name={member.name}
            size={size}
            {...(member.src === undefined ? {} : {src: member.src})}
          />
        </span>
      ))}
      {hidden > 0 ? (
        <span {...stylex.props(styles.slot)}>
          <span
            aria-hidden="true"
            {...stylex.props(styles.overflow, overflowSizes[size])}
          >
            +{hidden}
          </span>
        </span>
      ) : null}
    </div>
  );
}
