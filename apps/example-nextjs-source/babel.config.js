import {createKiokuUiBabelConfig} from '@misoto22/kioku-ui-build/babel';

export default createKiokuUiBabelConfig({
  presets: ['next/babel'],
  rootDir: import.meta.dirname,
});
