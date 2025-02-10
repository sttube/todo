import React, { useEffect, useState } from 'react';
import {
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import { TODO } from '@/app/todolist/Todo_T01';
import Box from '@mui/material/Box';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import { ClearIcon } from '@mui/x-date-pickers';
import Calendar from '@mui/icons-material/Event';

/********************************************************************
  [컴포넌트 정보]
  todoItem 편집 다이얼로그
 ********************************************************************/
interface EditTodoDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function EditTodoDialog({
  open,
  onClose,
  editProps
}: {
  open: boolean;
  onClose: () => void;
  editProps: {
    todo: TODO;
    todoList: TODO[];
    todoTypeList: Readonly<[]>;
    setTodoList: React.Dispatch<React.SetStateAction<TODO[]>>;
    setUpdateList: React.Dispatch<React.SetStateAction<string[]>>;
    setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
  };
}) {
  const [value, setValue] = useState(editProps.todo);

  // 다이얼로그가 열릴 때마다 초기값을 업데이트
  React.useEffect(() => {
    setValue(editProps.todo);
  }, [editProps.todo, open]);

  /**************************************************
      변수, 상수 및 상태 정의
    **************************************************/
  const [clickedChips, setClickedChips] = useState({
    ...editProps.todo.todoType
  }); // 작업유형 클릭여부
  // const [isEditing, setIsEditing] = useState(false); // 수정여부
  const [calOpen, setCalOpen] = useState({
    START: false,
    END: false,
    DEADLINE: false
  });

  /**************************************************
      스타일 정의
    **************************************************/
  const style = {
    display: 'flex',
    alignItems: 'center',
    m: 2,
    backgroundColor: 'white'
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
    alignItems: 'center',

    '&.rmark': {
      width: '800px'
    }
  };

  const typoSx = {
    width: '45px',
    fontSize: '14px',
    fontWeight: '600'
  };

  /**************************************************
    EventHandler
  **************************************************/
  // updateList에 업데이트 대상 item 추가 후 수정여부(isEditing) 변경
  const onUpdate = () => {
    editProps.setUpdateList((prevList) => {
      return [...prevList, editProps.todo.id];
    });
    editProps.setIsEditing(true);
  };

  // 내용 수정 이벤트
  const onChange = (targetField, value) => {
    editProps.setTodoList((prevList) =>
      prevList.map((item) =>
        item.id === editProps.todo.id ? { ...item, [targetField]: value } : item
      )
    );
    onUpdate();
  };

  // 컴포넌트 초기화버튼 클릭이벤트
  const handleClear = (targetField) => {
    editProps.setTodoList((prevList) =>
      prevList.map((item) =>
        item.id === editProps.todo.id ? { ...item, [targetField]: '' } : item
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

    editProps.setTodoList((prevList) =>
      prevList.map((item) =>
        item.id === editProps.todo.id
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
      Element 정의
    **************************************************/
  // 작업타입 리스트
  const typeList = () => {
    return editProps.todoTypeList.map(
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
    <Dialog open={open} onClose={onClose} maxWidth="lg">
      <Box id={editProps.todo?.id} sx={{ ...style }}>
        <Stack direction="column">
          <Box sx={{ ...inputBoxSx }}>
            <Typography sx={typoSx}>제목</Typography>
            <TextField
              fullWidth
              id="title"
              size="small"
              variant="standard"
              value={editProps.todo?.title}
              onChange={(e) => onChange('title', e.target.value)}
            />
          </Box>
          <Divider />
          <Stack direction="row" sx={{ width: '100%' }}>
            <Stack direction="column" sx={{ width: '300px' }}>
              <Box sx={{ ...inputBoxSx }}>
                <Typography sx={typoSx}>시작일자</Typography>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    value={
                      editProps.todo.dtmStart
                        ? dayjs(editProps.todo.dtmStart)
                        : null
                    }
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
                              {editProps.todo.dtmStart && (
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

              <Box sx={{ ...inputBoxSx }}>
                <Typography sx={typoSx}>종료일자</Typography>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    value={
                      editProps.todo.dtmEnd
                        ? dayjs(editProps.todo.dtmEnd)
                        : null
                    }
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
                              {editProps.todo.dtmEnd && (
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
                <Typography sx={typoSx}>마감기한</Typography>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    value={
                      editProps.todo.dtmDeadLine
                        ? dayjs(editProps.todo.dtmDeadLine)
                        : null
                    }
                    open={calOpen.DEADLINE}
                    onOpen={() => handleCalendarOpen('DEADLINE')}
                    onClose={() => handleCalendarOpen('DEADLINE')}
                    sx={{ width: '100%' }}
                    slotProps={{
                      textField: {
                        size: 'small',
                        id: 'dtmDeadLine',
                        InputProps: {
                          endAdornment: (
                            <>
                              {editProps.todo.dtmDeadLine && (
                                <IconButton
                                  edge="end"
                                  onClick={(event) =>
                                    handleClear('dtmDeadLine')
                                  }
                                >
                                  <ClearIcon />
                                </IconButton>
                              )}
                              <IconButton
                                edge="end"
                                onClick={() => handleCalendarOpen('DEADLINE')}
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
                      onChange('dtmDeadLine', value.format('YYYY-MM-DD'))
                    }
                  />
                </LocalizationProvider>
              </Box>
              <Divider />
              <Box sx={{ ...inputBoxSx }}>
                <Typography sx={typoSx}>작업유형</Typography>
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
            </Stack>
            <Divider orientation="vertical" flexItem />
            <Box className="rmark" sx={{ ...inputBoxSx }}>
              <TextField
                value={editProps.todo?.rmark}
                fullWidth
                multiline
                rows={25}
                sx={{
                  '& .MuiInputBase-root.MuiOutlinedInput-root': {
                    padding: '10px', // 내부 여백 줄이기
                    fontSize: '14px' // 폰트 사이즈 변경
                  }
                }}
                slotProps={{
                  input: {
                    endAdornment: editProps.todo.rmark && (
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
        </Stack>
      </Box>
    </Dialog>
  );
}
