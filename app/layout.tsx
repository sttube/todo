'use client';
import { Suspense } from 'react';

import './globals.css';
import Box from '@mui/material/Box';
import Navigation from './components/Navigation';

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            height: '100vh'
          }}
        >
          <Box sx={{ flexShrink: 0 }}>
            <Suspense fallback="false">
              <Navigation />
            </Suspense>
          </Box>
          <Box
            sx={{
              m: 1,
              p: 1,
              border: '2px solid rgba(0, 0, 0, 0.12)',
              borderRadius: 2,
              flexGrow: 1,
              height: '100%',
              overflow: 'hidden'
            }}
          >
            {children}
          </Box>
        </Box>
      </body>
    </html>
  );
}
