'use client';

import Todo from './components/todo';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid2';

const stage = {
  p: 2,
  border: '1px dashed grey',
  display: 'flex',
  justifyContent: 'center'
};

export default function Home() {
  return (
    <>
      <header>
        <Box sx={{ height: '100px', alignItems: 'center', ...stage }}>
          Todo List
        </Box>
      </header>
      <main>
        <Box>
          <Grid container spacing={2}>
            <Grid size={{ lg: 3 }}>
              <Box component="section" sx={stage}>
                Todo List
              </Box>
              <Todo />
            </Grid>
            <Grid size={{ lg: 3 }}>
              <Box component="section" sx={stage}>
                진행중
              </Box>
              <Todo />
            </Grid>
            <Grid size={{ lg: 3 }}>
              <Box component="section" sx={stage}>
                완료
              </Box>
              <Todo />
            </Grid>
            <Grid size={{ lg: 3 }}>
              <Box component="section" sx={stage}>
                주간보고서
              </Box>
              <Todo />
            </Grid>
          </Grid>
        </Box>
      </main>
      <footer></footer>
    </>
  );
}
