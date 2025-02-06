'use client';
import React, { RefObject, useEffect, useRef, useState } from 'react';

// MUI
import Box from '@mui/material/Box';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';

import { IconButton, TextField } from '@mui/material';
import { useSortable } from '@dnd-kit/sortable';
import { Arguments, CSS } from '@dnd-kit/utilities';
import { TYPE_ITEM } from './Settings_T01';

export default function TodoType({
  typeItem,
  handleOnChange,
  handleClickRemoveButton,
  setTodoTypeList
}: {
  typeItem: TYPE_ITEM;
  handleOnChange: (key: string, value: string) => void;
  handleClickRemoveButton: (delKey: string) => Promise<void>;
  setTodoTypeList: React.Dispatch<React.SetStateAction<TYPE_ITEM[]>>;
}) {
  /**************************************************
    변수, 상수 및 상태 정의
  **************************************************/
  const options = {
    id: typeItem.id
  };

  const {
    attributes,
    listeners,
    setActivatorNodeRef,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable(options as Arguments<any>);

  const style = {
    display: 'flex',
    alignItems: 'center',
    transform: CSS.Translate.toString(transform),
    transition,
    background: isDragging ? '#e0f7fa' : '#fff',
    padding: 2,
    // marginBottom: 4,
    cursor: 'grab'
  };

  return (
    <Box ref={setNodeRef} style={style}>
      <TextField
        fullWidth
        id="type"
        size="small"
        variant="outlined"
        sx={{ width: '200px' }}
        value={typeItem.typeName}
        onChange={(e) => handleOnChange(typeItem.id, e.target.value)}
      />
      <div ref={setActivatorNodeRef} {...listeners}>
        <IconButton>
          <UnfoldMoreIcon />
        </IconButton>
      </div>
    </Box>
  );
}
