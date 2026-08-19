import type {Meta, StoryObj} from '@storybook/react-vite';
import {useState} from 'react';

import {
  BottomSheetSwitcher,
  Button,
  Stack,
  Text,
  type BottomSheetSwitcherView,
} from '@misoto22/kioku-ui';

import {DemoFrame} from './support/StoryFrame';

// The views are written once and handed the navigation the sheet is driven
// by, so the story and the args table show the same three screens.
function shareViews(
  show: (viewId: string) => void,
): readonly BottomSheetSwitcherView[] {
  return [
    {
      content: (
        <Stack gap="sm">
          <Text>Anyone with the link can view this release.</Text>
          <Button
            onClick={() => {
              show('link');
            }}
            variant="secondary"
          >
            Copy link
          </Button>
          <Button
            onClick={() => {
              show('people');
            }}
            variant="secondary"
          >
            People with access
          </Button>
        </Stack>
      ),
      id: 'share',
      title: 'Share release',
    },
    {
      content: (
        <Text>
          The link expires in seven days and can be revoked at any time.
        </Text>
      ),
      id: 'link',
      parentId: 'share',
      title: 'Copy link',
    },
    {
      content: <Text>Dana Okoye and two others can edit this release.</Text>,
      id: 'people',
      parentId: 'share',
      title: 'People with access',
    },
  ];
}

const meta = {
  id: 'core-bottom-sheet-switcher',
  title: 'Core/BottomSheetSwitcher',
  component: BottomSheetSwitcher,
  args: {open: false, views: shareViews(() => {})},
  parameters: {layout: 'padded'},
} satisfies Meta<typeof BottomSheetSwitcher>;

export default meta;
type Story = StoryObj<typeof meta>;

function ShareSheetDemo({
  backLabel,
  label = 'Share release',
  startOpen = false,
  startViewId = 'share',
}: {
  readonly backLabel?: string;
  readonly label?: string;
  readonly startOpen?: boolean;
  readonly startViewId?: string;
}) {
  const [open, setOpen] = useState(startOpen);
  const [viewId, setViewId] = useState(startViewId);

  return (
    <>
      <Button
        onClick={() => {
          setViewId(startViewId);
          setOpen(true);
        }}
      >
        {label}
      </Button>
      <BottomSheetSwitcher
        backLabel={backLabel}
        onDismiss={() => {
          setOpen(false);
        }}
        onViewChange={setViewId}
        open={open}
        viewId={viewId}
        views={shareViews(setViewId)}
      />
    </>
  );
}

export const Default: Story = {
  render: (args) => (
    <DemoFrame>
      <ShareSheetDemo backLabel={args.backLabel} />
    </DemoFrame>
  ),
};

// The sheet opens on a child view, so the back control is on screen where it
// actually appears rather than one interaction away.
export const Composition: Story = {
  render: () => (
    <DemoFrame>
      <Stack gap="md">
        <Text tone="secondary">
          One sheet, several named views. A switch swaps the body and the
          heading in place and moves focus to the new heading; a view that names
          a parent gets a back control instead of closing to go up.
        </Text>
        <ShareSheetDemo label="Open" startOpen startViewId="people" />
      </Stack>
    </DemoFrame>
  ),
};
