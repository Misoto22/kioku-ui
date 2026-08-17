import './globals.css';

import type {Metadata} from 'next';
import type {ReactNode} from 'react';

export const metadata: Metadata = {
  title: 'Kioku UI source Next.js example',
};

export default function RootLayout({children}: {readonly children: ReactNode}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
