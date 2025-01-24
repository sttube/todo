'use client';

import React, { useEffect, useRef, useState } from 'react';

// MUI
import Box from '@mui/material/Box';

// React DnD
import { useDragLayer, useDrop } from 'react-dnd';
import Todo from '@/app/todolist/Todo';
import { TODO } from '@/app/todolist/Todo_T01';
import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { Arguments } from '@dnd-kit/utilities';

export default function TodoListBox({
  status,
  filteredList,
  todoProps
}: {
  status: string;
  filteredList: TODO[];
  todoProps: {
    todoList: TODO[];
    todoTypeList: {};
    setTodoList: React.Dispatch<React.SetStateAction<TODO[]>>;
    setUpdateList: React.Dispatch<React.SetStateAction<string[]>>;
    setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
    onDrop: (TODO, string) => void;
  };
}) {
  /**************************************************
    변수, 상수 및 상태 정의
  **************************************************/
  const { setNodeRef } = useDroppable({
    id: status,
    data: { status: status, compType: 'Box' }
  } as Arguments<any>);
  /**************************************************
    스타일 정의
  **************************************************/
  const listBoxSx = {
    height: '100%',
    flexGrow: 1,
    backgroundColor: 1 ? '#e0f7fa' : '#f5f5f5',
    border: '2px solid primary.main'
  };

  /**************************************************
    DOM 연결과 스타일 적용
  **************************************************/
  return (
    <SortableContext
      key={status}
      items={filteredList.map((todo) => todo.id)}
      strategy={verticalListSortingStrategy}
    >
      <Box
        ref={setNodeRef}
        sx={listBoxSx} // 스타일을 적용
      >
        {
          filteredList.map((todo: TODO) => (
            <Todo key={todo.id} todo={todo} {...todoProps} />
          )) as React.ReactNode
        }
      </Box>
    </SortableContext>
  );
}
