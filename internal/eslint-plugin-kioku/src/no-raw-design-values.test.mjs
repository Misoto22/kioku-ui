import {RuleTester} from 'eslint';
import {describe, it} from 'vitest';

import {noRawDesignValues} from './no-raw-design-values.mjs';

const ruleTester = new RuleTester({
  languageOptions: {ecmaVersion: 'latest', sourceType: 'module'},
});

describe('no-raw-design-values', () => {
  it('accepts token references and rejects literals', () => {
    ruleTester.run('no-raw-design-values', noRawDesignValues, {
      valid: [
        {
          name: 'a token reference',
          code: `stylex.create({base: {color: semanticTokens.colorText}});`,
        },
        {
          name: 'a neutral keyword',
          code: `stylex.create({base: {backgroundColor: 'transparent', borderColor: 'currentColor'}});`,
        },
        {
          name: 'zero',
          code: `stylex.create({base: {margin: 0, padding: 0}});`,
        },
        {
          name: 'a layout value the contract does not model',
          code: `stylex.create({base: {width: '50%', gridTemplateColumns: '1fr'}});`,
        },
        {
          name: 'a literal outside stylex.create',
          code: `const style = {color: '#ff0000'};`,
        },
      ],
      invalid: [
        {
          name: 'a literal colour',
          code: `stylex.create({base: {color: '#ff0000'}});`,
          errors: [{messageId: 'rawValue'}],
        },
        {
          name: 'a literal spacing value',
          code: `stylex.create({base: {gap: '12px'}});`,
          errors: [{messageId: 'rawValue'}],
        },
        {
          name: 'a literal font size',
          code: `stylex.create({base: {fontSize: '1rem'}});`,
          errors: [{messageId: 'rawValue'}],
        },
      ],
    });
  });
});
