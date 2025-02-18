"use client";

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
} from "react";
import { TODO } from "@/app/todolist/Todo_T01";
import { useTodoStore } from "@/app/todolist/todoStore";

/********************************************************************
  [컴포넌트 정보]

 ********************************************************************/

// 캘린더 오픈 상태 타입 (예시)
export type CalOpenState = {
  start: boolean;
  end: boolean;
};

interface EditContextType {
  draftTodo: TODO;
  setDraftTodo: (todo: TODO) => void;
  clickedChips: Record<string, boolean>;
  setClickedChips: React.Dispatch<
    React.SetStateAction<Record<string, boolean>>
  >;
  calOpen: CalOpenState;
  setCalOpen: React.Dispatch<React.SetStateAction<CalOpenState>>;
  onUpdate: (todo: TODO) => void;
  handleOnChange: <K extends keyof TODO>(
    targetField: K,
    value: TODO[K],
  ) => void;
  handleClear: (targetField: keyof TODO) => void;
  handleChipClick: (id: string) => void;
  handleCalendarOpen: (id: keyof CalOpenState) => void;
  handleRemoveClick: () => void;
}

const EditContext = createContext<EditContextType | undefined>(undefined);

export const useEditContext = () => {
  const context = useContext(EditContext);
  if (!context) {
    throw new Error("useEditContext must be used within an EditProvider");
  }
  return context;
};

interface EditProviderProps {
  children: ReactNode;
  initialTodo: TODO;
  updateGlobalTodo: (todo: TODO) => void;
  removeTodo: (id: string) => void;
  onClose: () => void;
}

export const EditProvider: React.FC<EditProviderProps> = ({
  children,
  initialTodo,
  updateGlobalTodo,
  removeTodo,
  onClose,
}) => {
  // 로컬 편집 상태
  const [draftTodo, setDraftTodo] = useState<TODO>({ ...initialTodo });
  const [clickedChips, setClickedChips] = useState<Record<string, boolean>>({});
  const [calOpen, setCalOpen] = useState<CalOpenState>({
    start: false,
    end: false,
  });
  const { setTodoList } = useTodoStore();

  // 업데이트: 로컬 상태를 갱신하고 전역 todoList 업데이트를 위한 콜백 호출
  const onUpdate = useCallback(
    (todo: TODO) => {
      updateGlobalTodo(todo);
      setDraftTodo(todo);
    },
    [updateGlobalTodo],
  );

  // 내용 수정 이벤트: 특정 필드의 값을 업데이트
  const handleOnChange = useCallback(
    <K extends keyof TODO>(targetField: K, value: TODO[K]) => {
      onUpdate({ ...draftTodo, [targetField]: value });
    },
    [draftTodo, onUpdate],
  );

  // 초기화 이벤트: 해당 필드를 null로 설정하여 초기화
  const handleClear = useCallback(
    (targetField: keyof TODO) => {
      onUpdate({ ...draftTodo, [targetField]: null });
    },
    [draftTodo, onUpdate],
  );

  // 작업타입 Chip 클릭 이벤트: 클릭 상태 토글 및 업데이트
  const handleChipClick = useCallback(
    (id: string) => {
      const newValue = !clickedChips[id];
      setClickedChips((prev) => ({ ...prev, [id]: newValue }));
      onUpdate({
        ...draftTodo,
        todoType: { ...draftTodo.todoType, [id]: newValue },
      });
    },
    [clickedChips, draftTodo, onUpdate],
  );

  // Calendar 오픈 핸들러: calOpen 상태 토글
  const handleCalendarOpen = useCallback((id: keyof CalOpenState) => {
    setCalOpen((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  // 삭제 핸들러: 해당 todo를 삭제 후 다이얼로그 닫기
  const handleRemoveClick = useCallback(() => {
    removeTodo(draftTodo.id);
    onClose();
  }, [draftTodo.id, removeTodo, onClose]);

  return (
    <EditContext.Provider
      value={{
        draftTodo,
        setDraftTodo,
        clickedChips,
        setClickedChips,
        calOpen,
        setCalOpen,
        onUpdate,
        handleOnChange,
        handleClear,
        handleChipClick,
        handleCalendarOpen,
        handleRemoveClick,
      }}
    >
      {children}
    </EditContext.Provider>
  );
};
