'use client';
import React, { useEffect, useRef, useState } from 'react';
import { TODO } from './Todo_T01';
import { doc, CollectionReference, updateDoc } from 'firebase/firestore';
import fireStore from '../../firebase/firestore';

//MUI
import Box from '@mui/material/Box';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
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

import {
  DragPreviewImage,
  useDrag,
  useDragLayer,
  DragPreviewOptions
} from 'react-dnd';

interface TodoProps {
  todo: Readonly<any>;
  changeTypeList: Readonly<[]>;
  setTodoList: React.Dispatch<React.SetStateAction<any>>;
  setUpdateList: React.Dispatch<React.SetStateAction<any>>;
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function Todo({
  todo,
  changeTypeList,
  setTodoList,
  setUpdateList,
  setIsEditing
}: TodoProps) {
  /**************************************************
    변수, 상수 및 상태 정의
  **************************************************/
  const [clickedChips, setClickedChips] = useState({ ...todo.CHANGE_TYPE }); // 작업유형 클릭여부
  // const [isEditing, setIsEditing] = useState(false); // 수정여부
  const [calOpen, setCalOpen] = useState({ START: false, END: false });
  const SAVE_DELAY = 5000; // 저장딜레이
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const [{ isDragging }, dragRef, previewRef] = useDrag({
    type: 'BOX', // 드래그 가능한 아이템의 타입
    item: () => todo,
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  });

  previewRef(null, {});

  // dragRef는 useDrag에서 반환된 콜백형 ref이며 이를 Box의 ref로 전달
  const dragTargetRef = useRef(null);
  useEffect(() => {
    dragRef(dragTargetRef.current); // dragRef를 dragTargetRef에 연결
  }, [dragRef]);

  /**************************************************
    스타일 정의
  **************************************************/
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

  // useEffect(() => {
  //   setUpdateList((prevList) => {
  //     if (!prevList.includes(todo.ID)) {
  //       return { ...prevList, [todo.ID]: { todo } }; // id가 이미 포함되어 있지 않으면 추가
  //     }
  //     return prevList;
  //   });
  // }, [todo]);

  // 마지막 수정 후 5초간 입력 없으면 저장
  // useEffect(() => {
  //   if (isEditing) {
  //     const timer = setTimeout(async () => {
  //       const itemRef = doc(fireStore, 'todo', 'todo_item_' + todo.ID);
  //       await updateDoc(itemRef, {
  //         ...todo
  //       } as CollectionReference<string>);
  //       setIsEditing(false); // 저장 완료 후 수정여부 상태 리셋
  //     }, SAVE_DELAY);
  //
  //     return () => clearTimeout(timer); // 입력이 이어지면 이전 타이머 취소
  //   }
  // }, [todo, isEditing]);

  /**************************************************
    EventHandler
  **************************************************/
  // updateList에 todo 추가 및 수정여부 업데이트
  const onUpdate = () => {
    console.log('update');
    setUpdateList((prevList) => ({
      ...prevList,
      [todo.ID]: todo
    }));
    setIsEditing(true);
  };

  // 내용 수정 이벤트
  const onChange = (targetField, value) => {
    setTodoList((prevList) =>
      prevList.map((item) =>
        item.ID === todo.ID ? { ...item, [targetField]: value } : item
      )
    );
    onUpdate();
  };

  // 컴포넌트 초기화버튼 클릭이벤트
  const handleClear = (targetField) => {
    setTodoList((prevList) =>
      prevList.map((item) =>
        item.ID === todo.ID ? { ...item, [targetField]: '' } : item
      )
    );
    onUpdate();
  };

  // 작업타입 Chip 클릭이벤트
  const handleChipClick = (id) => {
    setClickedChips((prev) => ({
      ...prev,
      [id]: !prev[id] // 클릭한 Chip의 상태를 토글
    }));

    setTodoList((prevList) =>
      prevList.map((item) =>
        item.ID === todo.ID
          ? { ...item, CHANGE_TYPE: { ...item.CHANGE_TYPE, [id]: true } }
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
  const taskDvSelector = () => {
    return (
      <FormControl fullWidth>
        <InputLabel id="task-dv"></InputLabel>
        <Select
          labelId="task-dv"
          id="task-dv-select"
          value={todo.TASK_DV}
          label="Age"
          // onChange={handleChange}
        >
          <MenuItem value={10}>Ten</MenuItem>
          <MenuItem value={20}>Twenty</MenuItem>
          <MenuItem value={30}>Thirty</MenuItem>
        </Select>
      </FormControl>
    );
  };

  /**************************************************
    Element 정의
  **************************************************/
  // 작업타입 리스트
  const typeList = () => {
    return changeTypeList.map(
      (item: { id: number; ord: number; typeName: string }) => (
        <Chip
          key={item.id}
          label={item.typeName}
          variant="outlined"
          size="small"
          sx={{
            ...chipSx(item.ord)
          }}
          onClick={() => handleChipClick(item.id)}
        />
      )
    );
  };

  return (
    // <Box ref={preview ? dragPreviewRef : null}>
    <Box
      ref={dragTargetRef}
      id={todo?.ID}
      sx={{
        m: 1,
        border: '1px solid #bdbdbd',
        borderColor: isDragging ? 'primary.main' : '#bdbdbd',
        borderWidth: isDragging ? '2px' : '1px',
        borderRadius: 1,
        backgroundColor: 'white',
        opacity: isDragging ? '1' : '1',
        // display: isDragging ? 'none' : 'flex',
        cursor: 'move'
      }}
    >
      <Stack direction="column">
        <Box sx={{ ...inputBoxSx }}>
          <Typography
            sx={{ width: '45px', fontSize: '14px', fontWeight: '600' }}
          >
            제목
          </Typography>
          <TextField
            fullWidth
            id="TITLE"
            size="small"
            variant="outlined"
            value={todo?.TITLE}
            onChange={(e) => onChange('TITLE', e.target.value)}
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
              value={dayjs(todo.DTM_START) || null}
              open={calOpen.START}
              onOpen={() => handleCalendarOpen('START')}
              onClose={() => handleCalendarOpen('START')}
              sx={{ width: '100%' }}
              slotProps={{
                textField: {
                  size: 'small',
                  id: 'DTM_START',
                  InputProps: {
                    endAdornment: (
                      <>
                        {todo.DTM_START && (
                          <IconButton
                            edge="end"
                            onClick={(event) => handleClear('DTM_START')}
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
                onChange('DTM_START', value.format('YYYY-MM-DD'))
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
              value={todo.DTM_END ? dayjs(todo.DTM_END) : null}
              open={calOpen.END}
              onOpen={() => handleCalendarOpen('END')}
              onClose={() => handleCalendarOpen('END')}
              sx={{ width: '100%' }}
              slotProps={{
                textField: {
                  size: 'small',
                  id: 'DTM_END',
                  InputProps: {
                    endAdornment: (
                      <>
                        {todo.DTM_END && (
                          <IconButton
                            edge="end"
                            onClick={(event) => handleClear('DTM_END')}
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
                onChange('DTM_END', value.format('YYYY-MM-DD'))
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
            value={todo?.RMARK}
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
                endAdornment: todo.RMARK && (
                  <IconButton
                    onClick={(event) => handleClear('DTM_END')}
                    edge="end"
                  >
                    <ClearIcon />
                  </IconButton>
                )
              }
            }}
            onChange={(e) => onChange('RMARK', e.target.value)}
          />
        </Box>
      </Stack>
      {/*</Box>*/}
    </Box>
  );
}
