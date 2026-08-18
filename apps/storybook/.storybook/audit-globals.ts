import {kiokuThemes} from '@misoto22/kioku-ui-theme-kioku';

const densityItems = [
  {title: 'Compact', value: 'compact'},
  {title: 'Standard', value: 'standard'},
] as const;
const modeItems = [
  {title: 'Light', value: 'light'},
  {title: 'Dark', value: 'dark'},
] as const;
const themeItems = kiokuThemes.map(({id, label}) => ({
  title: label,
  value: id,
}));

export const storybookGlobalTypes = {
  density: {
    description: 'Spatial scale',
    toolbar: {
      icon: 'component',
      items: densityItems,
    },
  },
  mode: {
    description: 'Color mode',
    toolbar: {
      icon: 'mirror',
      items: modeItems,
    },
  },
  theme: {
    description: 'Kioku theme',
    toolbar: {
      icon: 'paintbrush',
      items: themeItems,
    },
  },
};

export const storybookInitialGlobals = {
  density: densityItems[0].value,
  mode: modeItems[0].value,
  theme: themeItems[0]?.value,
};
