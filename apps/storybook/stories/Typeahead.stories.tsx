import type {Meta, StoryObj} from '@storybook/react-vite';
import {useState} from 'react';

import {
  Field,
  Typeahead,
  TypeaheadItem,
  type TypeaheadOption,
} from '@misoto22/kioku-ui';

import {DemoFrame, StateGrid} from './support/StoryFrame';

// A list of options is a set, and a set sits on a surface with an edge — the
// same plate the component's own popup is painted with. Loose on the canvas
// the rows read as unplaced rather than as a picker.
const handRolledList = {
  backgroundColor: 'var(--kioku-ui-color-surface-raised)',
  borderRadius: 'var(--kioku-ui-radius-container)',
  boxShadow: 'var(--kioku-ui-elevation-medium)',
  listStyle: 'none',
  margin: 0,
  paddingBlock: 'var(--kioku-ui-spacing-xs)',
  paddingInline: 0,
  width: '100%',
} as const;

const meta = {
  title: 'Core/Typeahead',
  component: Typeahead,
  args: {
    inputValue: '',
    onInputValueChange: () => {},
    onSelect: () => {},
    options: [],
  },
  parameters: {layout: 'padded'},
} satisfies Meta<typeof Typeahead>;

export default meta;
type Story = StoryObj<typeof meta>;

const people: readonly TypeaheadOption[] = [
  {label: 'Ada Lovelace', value: 'ada'},
  {label: 'Alan Turing', value: 'alan'},
  {label: 'Grace Hopper', value: 'grace'},
];

function TypeaheadDemo(props: Partial<Parameters<typeof Typeahead>[0]>) {
  const [query, setQuery] = useState('');
  const matches = people.filter((person) =>
    person.label.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <Typeahead
      aria-label="Owner"
      {...props}
      inputValue={query}
      onInputValueChange={setQuery}
      onSelect={(option) => setQuery(option.label)}
      options={matches}
    />
  );
}

export const Default: Story = {
  render: (args) => (
    <DemoFrame>
      <TypeaheadDemo {...args} />
    </DemoFrame>
  ),
};

export const States: Story = {
  render: () => (
    <DemoFrame>
      <StateGrid
        items={[
          {label: 'empty', content: <TypeaheadDemo />},
          {
            label: 'custom empty message',
            content: <TypeaheadDemo emptyMessage="Nobody by that name" />,
          },
          {
            // TypeaheadItem is what a caller rendering its own list uses.
            label: 'options rendered by hand',
            content: (
              <ul
                aria-label="Owner suggestions"
                role="listbox"
                style={handRolledList}
              >
                <TypeaheadItem active description="Engineering">
                  Ada Lovelace
                </TypeaheadItem>
                <TypeaheadItem description="Design">Grace Hopper</TypeaheadItem>
                <TypeaheadItem disabled>Alan Turing</TypeaheadItem>
              </ul>
            ),
          },
        ]}
      />
    </DemoFrame>
  ),
};

// The suggestion plate only exists once something has been typed, so the
// story types.
export const Composition: Story = {
  render: () => (
    <DemoFrame>
      <Field label="Owner" description="Type to filter the list.">
        <TypeaheadDemo />
      </Field>
    </DemoFrame>
  ),
  play: async ({canvasElement, userEvent}) => {
    const input = canvasElement.querySelector<HTMLInputElement>(
      'input[role="combobox"]',
    );
    if (!input) {
      throw new Error('Typeahead field is missing');
    }
    await userEvent.type(input, 'a');
  },
};
