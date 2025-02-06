'use client';
import React, { Suspense } from 'react';
import Box from '@mui/material/Box';
import Navigation from './Navigation';
import { useFocus } from '@/app/components/FocusContext';

interface LayoutContentsProps {
  children: React.ReactNode;
}

/********************************************************************
  [컴포넌트 정보]
  layout에 FocusContext를 적용시키기 위해 contents 영역을 분리한 컴포넌트
 ********************************************************************/
/**************************************************
    스타일 정의
  **************************************************/
const rootSx = {
  display: 'flex',
  flexDirection: 'column',
  height: '100vh'
};

const bodySx = {
  m: 1,
  p: 1,
  border: '2px solid rgba(0, 0, 0, 0.12)',
  borderRadius: 2,
  flexGrow: 1,
  height: '100%'
};

export default function LayoutContents({ children }: LayoutContentsProps) {
  const { setFocusedId } = useFocus();

  /**************************************************
    EventHandler
  **************************************************/
  // 레이아웃 전체 영역 클릭 시 FocusedId를 초기화하여 todoItem의 선택상태를 해제
  const handleLayoutClick = () => {
    setFocusedId(null);
  };

  return (
    <Box sx={rootSx} onMouseDown={handleLayoutClick}>
      <Box sx={{ flexShrink: 0 }}>
        <Suspense fallback="false">
          <Navigation />
        </Suspense>
      </Box>
      <Box sx={bodySx}>{children}</Box>
    </Box>
  );
}
