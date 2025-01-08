'use client';
import React, { useState } from 'react';
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
  Divider
} from '@mui/material';

import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';

export default function Home({
  todo,
  setTodoList,
  changeTypeList
}: {
  todo: TODO;
  setTodoList: any;
  changeTypeList: {};
}) {
  const [clickedChips, setClickedChips] = useState({ ...todo.CHANGE_TYPE });

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
    pt: 1,
    pb: 1,
    pl: 2,
    pr: 2
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
  };
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

  // 작업타입 리스트
  const typeList = () => {
    const list = Object.entries(changeTypeList)
      .sort(([keyA]: [string, unknown], [keyB]: [string, unknown]) =>
        keyA.localeCompare(keyB)
      )
      .map(([key, value], index) => (
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

  const onDragStart = (e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = 'move';
    const itemId = e.currentTarget.id;
    e.dataTransfer.setData('text', itemId);
    console.log('itemId : ', itemId);
  };

  const onBlur = async (e: React.FocusEvent) => {
    console.log('onblur');
    const itemRef = doc(fireStore, 'todo', 'todo_item_' + todo.ID);
    await updateDoc(itemRef, {
      ...todo
    } as CollectionReference<string>);
  };

  const onChange = (targetField, value) => {
    console.log('1');
    setTodoList((prevList) =>
      prevList.map((item) =>
        item.ID === todo.ID ? { ...item, [targetField]: value } : item
      )
    );
    console.log('2');
  };

  return (
    <Box
      id={todo?.ID}
      draggable
      onDragStart={onDragStart}
      onBlur={onBlur}
      sx={{
        m: 1,
        border: '1px solid #bdbdbd',
        borderRadius: 1
      }}
    >
      <Stack direction="column">
        <Box sx={{ ...inputBoxSx }}>
          <Typography sx={{ fontSize: '14px' }}>
            <strong>제목</strong>
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
          <Typography sx={{ fontSize: '14px' }}>
            <strong>시작일자</strong>
          </Typography>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              value={dayjs(todo.DTM_START) || null}
              sx={{ width: '100%' }}
              slotProps={{
                textField: {
                  size: 'small',
                  id: 'DTM_START'
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
          <Typography sx={{ fontSize: '14px' }}>
            <strong>종료일자</strong>
          </Typography>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              value={dayjs(todo.DTM_END) || null}
              sx={{ width: '100%' }}
              slotProps={{
                textField: {
                  size: 'small',
                  id: 'DTM_END'
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
          <Typography sx={{ fontSize: '14px' }}>
            <strong>작업유형</strong>
          </Typography>
          <Box
            sx={{
              pt: 1,
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
          <Typography sx={{ fontSize: '14px' }}>
            <strong>상세내용</strong>
          </Typography>
          <TextField
            id="RMARK"
            value={todo?.RMARK}
            fullWidth
            multiline
            rows={5}
            sx={{
              '& .MuiInputBase-root.MuiOutlinedInput-root': {
                padding: '10px', // 내부 여백 줄이기
                fontSize: '14px' // 폰트 사이즈 변경
              }
            }}
            onChange={(e) => onChange('RMARK', e.target.value)}
          />
        </Box>
      </Stack>
    </Box>
  );
}
