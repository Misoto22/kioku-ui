import '@misoto22/kioku-ui/reset.css';
import '@misoto22/kioku-ui/styles.css';
import '@misoto22/kioku-ui-theme-kioku/theme.css';

import type {Metadata} from 'next';
import type {ReactNode} from 'react';

export const metadata: Metadata = {
  title: 'Kioku UI compiled Next.js example',
};

export default function RootLayout({children}: {readonly children: ReactNode}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
