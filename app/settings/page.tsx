'use client';
import React, { useEffect, useState } from 'react';

// MUI
import Box from '@mui/material/Box';

import { Divider } from '@mui/material';
import TodoTypeListBox from '@/app/settings/TodoTypeListBox';

export default function Settings() {
  return (
    <main>
      <Box>
        <TodoTypeListBox />
        <Divider />
      </Box>
    </main>
  );
}
