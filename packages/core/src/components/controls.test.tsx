// @vitest-environment happy-dom

import {cleanup, screen} from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import {userEvent} from '@testing-library/user-event';
import {afterEach, describe, expect, it, vi} from 'vitest';

vi.mock('@stylexjs/stylex', () => ({
  create: <Styles,>(styles: Styles) => styles,
  defineVars: <Vars,>(variables: Vars) => variables,
  props: (...styles: Array<Record<string, unknown> | undefined | false>) => ({
    style: Object.assign({}, ...styles.filter(Boolean)),
  }),
}));

import {renderUi} from '@misoto22/kioku-ui-test-utils';

import {
  Badge,
  Button,
  Field,
  IconButton,
  SegmentedControl,
  StatusDot,
  TextArea,
  TextInput,
  Toggle,
} from './index.js';

afterEach(() => {
  cleanup();
});

describe('button controls', () => {
  it('activates a Button with Space', async () => {
    const user = userEvent.setup();
    const action = vi.fn();
    renderUi(<Button onClick={action}>Save</Button>);

    await user.tab();
    await user.keyboard(' ');

    expect(action).toHaveBeenCalledOnce();
  });

  it('exposes disabled Button behavior natively', async () => {
    const user = userEvent.setup();
    const action = vi.fn();
    renderUi(
      <Button disabled onClick={action}>
        Save
      </Button>,
    );

    const button = screen.getByRole('button', {name: 'Save'});
    expect(button).toBeDisabled();
    await user.click(button);
    expect(action).not.toHaveBeenCalled();
  });

  it('requires an accessible label for an icon-only native button', async () => {
    const user = userEvent.setup();
    const action = vi.fn();
    renderUi(
      <IconButton aria-label="Close panel" onClick={action}>
        <span aria-hidden="true">×</span>
      </IconButton>,
    );

    const button = screen.getByRole('button', {name: 'Close panel'});
    await user.click(button);
    expect(action).toHaveBeenCalledOnce();
  });
});

describe('fields', () => {
  it('connects Field label and validation message to TextInput', () => {
    renderUi(
      <Field label="Email" status="Enter a valid address">
        <TextInput />
      </Field>,
    );

    const input = screen.getByRole('textbox', {name: 'Email'});
    expect(input).toHaveAccessibleDescription('Enter a valid address');
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  it('combines field description and status for a labelled TextArea', () => {
    renderUi(
      <Field
        description="Maximum 200 characters"
        label="Summary"
        status="This field is required"
      >
        <TextArea />
      </Field>,
    );

    expect(
      screen.getByRole('textbox', {name: 'Summary'}),
    ).toHaveAccessibleDescription(
      'Maximum 200 characters This field is required',
    );
  });

  it('supports uncontrolled and controlled text input contracts', async () => {
    const user = userEvent.setup();
    const onControlledChange = vi.fn();
    renderUi(
      <>
        <TextInput aria-label="Uncontrolled" defaultValue="Start" />
        <TextInput
          aria-label="Controlled"
          onValueChange={onControlledChange}
          value="Fixed"
        />
      </>,
    );

    const uncontrolled = screen.getByRole('textbox', {name: 'Uncontrolled'});
    await user.clear(uncontrolled);
    await user.type(uncontrolled, 'Changed');
    expect(uncontrolled).toHaveValue('Changed');

    const controlled = screen.getByRole('textbox', {name: 'Controlled'});
    await user.type(controlled, '!');
    expect(onControlledChange).toHaveBeenCalledWith('Fixed!');
    expect(controlled).toHaveValue('Fixed');
  });
});

describe('selection controls', () => {
  it('supports uncontrolled and controlled Toggle state without bypassing disabled behavior', async () => {
    const user = userEvent.setup();
    const onPressedChange = vi.fn();
    renderUi(
      <>
        <Toggle aria-label="Uncontrolled toggle" defaultPressed />
        <Toggle
          aria-label="Controlled toggle"
          onPressedChange={onPressedChange}
          pressed={false}
        />
        <Toggle aria-label="Disabled toggle" disabled />
      </>,
    );

    const uncontrolled = screen.getByRole('switch', {
      name: 'Uncontrolled toggle',
    });
    expect(uncontrolled).toBeChecked();
    await user.click(uncontrolled);
    expect(uncontrolled).not.toBeChecked();

    const controlled = screen.getByRole('switch', {name: 'Controlled toggle'});
    await user.click(controlled);
    expect(onPressedChange).toHaveBeenCalledWith(true);
    expect(controlled).not.toBeChecked();

    const disabled = screen.getByRole('switch', {name: 'Disabled toggle'});
    expect(disabled).toBeDisabled();
    await user.click(disabled);
    expect(disabled).not.toBeChecked();
  });

  it('moves segmented focus and selection with roving arrow keys while skipping disabled options', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderUi(
      <SegmentedControl
        aria-label="Alignment"
        defaultValue="start"
        onValueChange={onValueChange}
        options={[
          {label: 'Start', value: 'start'},
          {disabled: true, label: 'Center', value: 'center'},
          {label: 'End', value: 'end'},
        ]}
      />,
    );

    const start = screen.getByRole('radio', {name: 'Start'});
    const center = screen.getByRole('radio', {name: 'Center'});
    const end = screen.getByRole('radio', {name: 'End'});
    expect(start).toHaveAttribute('tabindex', '0');
    expect(center).toBeDisabled();
    expect(end).toHaveAttribute('tabindex', '-1');

    start.focus();
    await user.keyboard('{ArrowRight}');
    expect(end).toHaveFocus();
    expect(end).toBeChecked();
    expect(onValueChange).toHaveBeenLastCalledWith('end');

    await user.keyboard('{ArrowRight}');
    expect(start).toHaveFocus();
    expect(start).toBeChecked();
  });
});

describe('compact status indicators', () => {
  it('keeps badge copy visible and gives a status dot an accessible name', () => {
    renderUi(
      <>
        <Badge tone="success">Available</Badge>
        <StatusDot aria-label="Service available" tone="success" />
      </>,
    );

    expect(screen.getByText('Available')).toBeVisible();
    expect(
      screen.getByRole('status', {name: 'Service available'}),
    ).toBeVisible();
  });
});
