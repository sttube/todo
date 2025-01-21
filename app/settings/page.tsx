'use client';
import React, { useEffect, useState } from 'react';

// MUI
import Box from '@mui/material/Box';

import { Divider } from '@mui/material';
import TodoType from '@/app/settings/TodoType';

export default function Settings() {
  return (
    <main>
      <Box>
        <TodoType />
        <Divider />
      </Box>
    </main>
  );
}
