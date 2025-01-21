'use client';

import React, { useEffect, useRef, useState } from 'react';

// MUI
import Box from '@mui/material/Box';

// React DnD
import { useDragLayer, useDrop } from 'react-dnd';
import Todo from '@/app/todolist/Todo';
import { TODO } from '@/app/todolist/Todo_T01';

export default function TodoListBox({
  state,
  todoProps
}: {
  state: string;
  todoProps: {
    todoList: [];
    changeTypeList: {};
    setTodoList: React.Dispatch<React.SetStateAction<TODO[]>>;
    setUpdateList: React.Dispatch<React.SetStateAction<{}>>;
    setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
    onDrop: (TODO, string) => void;
  };
}) {
  /**************************************************
    변수, 상수 및 상태 정의
  **************************************************/
  const [offset, setOffset] = useState({ X: 0, Y: 0 });
  const [{ isOver }, dropRef] = useDrop(() => ({
    accept: 'BOX', // 드롭 허용되는 아이템 타입
    drop: (item) => {
      todoProps.onDrop(item, state);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver()
    })
  }));

  // dropRef는 useDrop에서 반환된 콜백형 ref이며 이를 Box의 ref로 전달
  const dropTargetRef = useRef(null);
  React.useEffect(() => {
    dropRef(dropTargetRef.current); // dropRef를 dropTargetRef에 연결
  }, [dropRef]);

  /**************************************************
    스타일 정의
  **************************************************/
  const listBoxSx = {
    height: '100%',
    flexGrow: 1,
    backgroundColor: isOver ? '#e0f7fa' : '#f5f5f5',
    border: '2px solid primary.main'
  };

  /**************************************************
    드래그 미리보기 컴포넌트 정의
  **************************************************/
  const CustomDragLayer = () => {
    const {
      isDragging,
      itemType,
      item,
      initialOffset,
      currentOffset,
      sourceOffset
    } = useDragLayer((monitor) => ({
      isDragging: monitor.isDragging(),
      itemType: monitor.getItemType(),
      item: monitor.getItem(),
      initialOffset: monitor.getInitialClientOffset(),
      currentOffset: monitor.getClientOffset(),
      sourceOffset: monitor.getSourceClientOffset()
    }));

    if (!isDragging) return null;

    const offsetX = currentOffset?.x
      ? currentOffset?.x + (sourceOffset?.x - initialOffset?.x)
      : 0;
    const offsetY = currentOffset?.y
      ? currentOffset?.y + (sourceOffset?.y - initialOffset?.y)
      : 0;

    const style = {
      // position: 'absolute',
      // top: offsetY,
      // left: offsetX,
      pointerEvents: 'none',
      zIndex: 100,
      backgroundColor: 'lightblue',
      borderRadius: '5px',
      fontSize: '16px',
      color: 'darkblue'
    };

    // 드래그중이 아니라면 렌더링 하지 않음
    if (!isDragging) return null;

    return (
      <Box
        sx={{
          ...style
        }}
      >
        <Todo todo={item} {...todoProps} />
      </Box>
    );
  };

  /**************************************************
    DOM 연결과 스타일 적용
  **************************************************/
  return (
    <Box
      ref={dropTargetRef} // React DnD에서 제공된 dropRef 연결
      sx={listBoxSx} // 스타일을 적용
    >
      {
        todoProps.todoList
          .filter((todo: TODO) => todo.STATE === state)
          .map((todo: TODO) => (
            <Todo key={todo.ID} todo={todo} {...todoProps} />
          )) as React.ReactNode
      }
      <CustomDragLayer />
    </Box>
  );
}
