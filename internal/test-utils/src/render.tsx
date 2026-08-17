import {render} from '@testing-library/react';
import React from 'react';

export function renderUi(ui: React.ReactElement) {
  return render(ui, {
    wrapper: ({children}) => <React.StrictMode>{children}</React.StrictMode>,
  });
}
