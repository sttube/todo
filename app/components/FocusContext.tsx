'use client';

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useMemo
} from 'react';

/********************************************************************
  [컴포넌트 정보]
  화면 클릭 시, 클릭된 아이템 아이디를 컨트롤 하기 위한 목적의 컨텍스트
  자식에게 useFocus 훅을 통해 focusedId와 setFocusedId를 제공한다.
 ********************************************************************/

interface FocusContextType {
  focusedId: string | null;
  setFocusedId: React.Dispatch<React.SetStateAction<string | null>>;
}

const FocusContext = createContext<FocusContextType | undefined>(undefined);

export const FocusProvider = ({ children }: { children: ReactNode }) => {
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const props = useMemo(() => ({ focusedId, setFocusedId }), [focusedId]);
  return (
    <FocusContext.Provider value={props}>{children}</FocusContext.Provider>
  );
};

export const useFocus = () => {
  const context = useContext(FocusContext);
  if (!context) {
    throw new Error('useFocus must be used within a FocusProvider');
  }
  return context;
};
