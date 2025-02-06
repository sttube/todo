'use client';
import React from 'react';

import './globals.css';
import { FocusProvider } from '@/app/components/FocusContext';
import LayoutContents from './components/LayoutContents';

/********************************************************************
  [컴포넌트 정보]
  Root Layout
 ********************************************************************/

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <FocusProvider>
          <LayoutContents>{children}</LayoutContents>
        </FocusProvider>
      </body>
    </html>
  );
}
