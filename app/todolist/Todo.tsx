'use client';
import React, { useState } from 'react';
import { TODO } from './Todo_T01';

//MUI
import Box from '@mui/material/Box';
import {
  Chip,
  Stack,
  TextField,
  Typography,
  Divider,
  IconButton
} from '@mui/material';
import Calendar from '@mui/icons-material/Event';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import { ClearIcon } from '@mui/x-date-pickers';

import { useSortable } from '@dnd-kit/sortable';
import { Arguments, CSS } from '@dnd-kit/utilities';

interface TodoProps {
  todo: Readonly<TODO>;
  todoTypeList: Readonly<[]>;
  setTodoList: React.Dispatch<React.SetStateAction<TODO[]>>;
  setUpdateList: React.Dispatch<React.SetStateAction<string[]>>;
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function Todo({
  todo,
  todoTypeList,
  setTodoList,
  setUpdateList,
  setIsEditing
}: TodoProps) {
  /**************************************************
    변수, 상수 및 상태 정의
  **************************************************/
  const [clickedChips, setClickedChips] = useState({ ...todo.todoType }); // 작업유형 클릭여부
  // const [isEditing, setIsEditing] = useState(false); // 수정여부
  const [calOpen, setCalOpen] = useState({ START: false, END: false });
  const {
    attributes,
    listeners,
    setActivatorNodeRef,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: todo.id,
    data: { status: todo.status, compType: 'Item' }
  } as Arguments<any>);

  /**************************************************
    스타일 정의
  **************************************************/
  const style = {
    display: 'flex',
    alignItems: 'center',
    m: 1,
    border: '1px solid #bdbdbd',
    borderColor: isDragging ? 'primary.main' : '#bdbdbd',
    borderWidth: isDragging ? '2px' : '1px',
    borderRadius: 1,
    backgroundColor: 'white',
    opacity: 1,
    transform: CSS.Translate.toString(transform),
    transition,
    cursor: 'grab'
  };
  // 작업타입 Chip Sx
  const chipSx = (id) => {
    return {
      color: clickedChips[id] ? 'primary.main' : 'grey.400',
      borderWidth: clickedChips[id] ? '0.15em' : 1,
      borderColor: clickedChips[id] ? 'primary.main' : 'grey.400',
      margin: '0 8px 8px 0'
    };
  };

  // 내부 박스 Sx
  const inputBoxSx = {
    p: '10px',
    display: 'flex',
    alignItems: 'center'
  };

  /**************************************************
    useEffect
  **************************************************/

  /**************************************************
    EventHandler
  **************************************************/
  // updateList에 업데이트 대상 item 추가 후 수정여부(isEditing) 변경
  const onUpdate = () => {
    setUpdateList((prevList) => {
      return [...prevList, todo.id];
    });
    setIsEditing(true);
  };

  // 내용 수정 이벤트
  const onChange = (targetField, value) => {
    setTodoList((prevList) =>
      prevList.map((item) =>
        item.id === todo.id ? { ...item, [targetField]: value } : item
      )
    );
    onUpdate();
  };

  // 컴포넌트 초기화버튼 클릭이벤트
  const handleClear = (targetField) => {
    setTodoList((prevList) =>
      prevList.map((item) =>
        item.id === todo.id ? { ...item, [targetField]: '' } : item
      )
    );
    onUpdate();
  };

  // 작업타입 Chip 클릭이벤트
  const handleChipClick = (id) => {
    const newValue = !clickedChips[id];
    setClickedChips((prev) => ({
      ...prev,
      [id]: newValue // 클릭한 Chip의 상태를 토글
    }));

    setTodoList((prevList) =>
      prevList.map((item) =>
        item.id === todo.id
          ? { ...item, todoType: { ...item.todoType, [id]: newValue } }
          : item
      )
    );
    onUpdate();
  };

  // Calendar 오픈 핸들러
  const handleCalendarOpen = (id) => {
    setCalOpen((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  /**************************************************
    사용자 정의 함수
  **************************************************/

  /**************************************************
    Element 정의
  **************************************************/
  // 작업타입 리스트
  const typeList = () => {
    return todoTypeList.map(
      (item: { id: string; ord: number; typeName: string }) => (
        <Chip
          key={item.id}
          label={item.typeName}
          variant="outlined"
          size="small"
          sx={{
            ...chipSx(item.id)
          }}
          onClick={() => handleChipClick(item.id)}
        />
      )
    );
  };

  return (
    // <Box ref={preview ? dragPreviewRef : null}>
    <Box ref={setNodeRef} id={todo?.id} sx={{ ...style }}>
      <Stack direction="column">
        <Box sx={{ ...inputBoxSx }}>
          <div ref={setActivatorNodeRef} {...listeners}>
            <Typography
              sx={{ width: '45px', fontSize: '14px', fontWeight: '600' }}
            >
              제목
            </Typography>
          </div>
          <TextField
            fullWidth
            id="title"
            size="small"
            variant="outlined"
            value={todo?.title}
            onChange={(e) => onChange('title', e.target.value)}
          />
        </Box>
        <Divider />
        <Box sx={{ ...inputBoxSx }}>
          <Typography
            sx={{ width: '45px', fontSize: '14px', fontWeight: '600' }}
          >
            시작일자
          </Typography>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              value={dayjs(todo.dtmStart) || null}
              open={calOpen.START}
              onOpen={() => handleCalendarOpen('START')}
              onClose={() => handleCalendarOpen('START')}
              sx={{ width: '100%' }}
              slotProps={{
                textField: {
                  size: 'small',
                  id: 'dtmStart',
                  InputProps: {
                    endAdornment: (
                      <>
                        {todo.dtmStart && (
                          <IconButton
                            edge="end"
                            onClick={(event) => handleClear('dtmStart')}
                          >
                            <ClearIcon />
                          </IconButton>
                        )}
                        <IconButton
                          edge="end"
                          onClick={() => handleCalendarOpen('START')}
                        >
                          <Calendar />
                        </IconButton>
                      </>
                    )
                  }
                }
              }}
              format="YYYY-MM-DD"
              onChange={(value) =>
                onChange('dtmStart', value.format('YYYY-MM-DD'))
              }
            />
          </LocalizationProvider>
        </Box>
        <Divider />
        <Box sx={{ ...inputBoxSx }}>
          <Typography
            sx={{ width: '45px', fontSize: '14px', fontWeight: '600' }}
          >
            종료일자
          </Typography>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              value={todo.dtmEnd ? dayjs(todo.dtmEnd) : null}
              open={calOpen.END}
              onOpen={() => handleCalendarOpen('END')}
              onClose={() => handleCalendarOpen('END')}
              sx={{ width: '100%' }}
              slotProps={{
                textField: {
                  size: 'small',
                  id: 'dtmEnd',
                  InputProps: {
                    endAdornment: (
                      <>
                        {todo.dtmEnd && (
                          <IconButton
                            edge="end"
                            onClick={(event) => handleClear('dtmEnd')}
                          >
                            <ClearIcon />
                          </IconButton>
                        )}
                        <IconButton
                          edge="end"
                          onClick={() => handleCalendarOpen('END')}
                        >
                          <Calendar />
                        </IconButton>
                      </>
                    )
                  }
                }
              }}
              format="YYYY-MM-DD"
              onChange={(value) =>
                onChange('dtmEnd', value.format('YYYY-MM-DD'))
              }
            />
          </LocalizationProvider>
        </Box>
        <Divider />
        <Box sx={{ ...inputBoxSx }}>
          <Typography
            sx={{ width: '45px', fontSize: '14px', fontWeight: '600' }}
          >
            작업유형
          </Typography>
          <Box
            sx={{
              pt: 1,
              width: '100%',
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center'
            }}
          >
            {typeList()}
          </Box>
        </Box>
        <Divider />
        <Box sx={{ ...inputBoxSx }}>
          <Typography
            sx={{
              width: '45px',
              fontSize: '14px',
              fontWeight: '600'
            }}
          >
            상세내용
          </Typography>
          <TextField
            id="RMARK"
            value={todo?.rmark}
            fullWidth
            multiline
            rows={10}
            sx={{
              '& .MuiInputBase-root.MuiOutlinedInput-root': {
                padding: '10px', // 내부 여백 줄이기
                fontSize: '14px' // 폰트 사이즈 변경
              }
            }}
            slotProps={{
              input: {
                endAdornment: todo.rmark && (
                  <IconButton
                    onClick={(event) => handleClear('rmark')}
                    edge="end"
                  >
                    <ClearIcon />
                  </IconButton>
                )
              }
            }}
            onChange={(e) => onChange('rmark', e.target.value)}
          />
        </Box>
      </Stack>
    </Box>
  );
}
