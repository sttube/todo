'use client';
import React, { useEffect, useState } from 'react';
import { TODO } from './Todo_t01';
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

export default function Todo({
  todo,
  setTodoList,
  setUpdateList,
  setIsEditing,
  changeTypeList
}: {
  todo: any;
  setTodoList: any;
  setUpdateList: any;
  setIsEditing: any;
  changeTypeList: {};
}) {
  /**************************************************
    변수, 상수 및 상태 정의
  **************************************************/
  const [clickedChips, setClickedChips] = useState({ ...todo.CHANGE_TYPE }); // 작업유형 클릭여부
  // const [isEditing, setIsEditing] = useState(false); // 수정여부
  const [calOpen, setCalOpen] = useState({ START: false, END: false });
  const SAVE_DELAY = 5000; // 저장딜레이

  /**************************************************
    스타일 정의
  **************************************************/
  // 작업타입 Chip Sx
  const chipSx = (index) => {
    return {
      color: clickedChips[index] ? 'primary.main' : 'grey.400',
      borderWidth: clickedChips[index] ? '0.15em' : 1,
      borderColor: clickedChips[index] ? 'primary.main' : 'grey.400',
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

  // 드래그 시작이벤트
  const onDragStart = (e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = 'move';
    const itemId = e.currentTarget.id;
    e.dataTransfer.setData('text', itemId);
  };

  // 포커스 잃을 때 저장 이벤트
  // 안쓴다
  const onBlur = async (e: React.FocusEvent) => {
    const itemRef = doc(fireStore, 'todo', 'todo_item_' + todo.ID);
    await updateDoc(itemRef, {
      ...todo
    } as CollectionReference<string>);
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
    const list = Object.entries(changeTypeList)
      .sort(([keyA]: [string, unknown], [keyB]: [string, unknown]) =>
        keyA.localeCompare(keyB)
      )
      .map(([key, value]) => (
        <Chip
          key={key}
          label={value as string}
          variant="outlined"
          size="small"
          sx={{
            ...chipSx(key)
          }}
          onClick={() => handleChipClick(key)}
        />
      ));
    return list;
  };

  return (
    <Box
      id={todo?.ID}
      draggable
      onDragStart={onDragStart}
      // onBlur={onBlur}
      sx={{
        m: 1,
        border: '1px solid #bdbdbd',
        borderRadius: 1
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
    </Box>
  );
}
