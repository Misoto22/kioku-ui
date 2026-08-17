import {expect, test} from 'vitest';
import {renderUi} from '@misoto22/kioku-ui-test-utils';

test('exports renderUi for workspace consumers', () => {
  expect(renderUi).toBeTypeOf('function');
});
