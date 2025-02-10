'use client';
import React, { useEffect, useState } from 'react';
import { TODO } from './Todo_T01';

//MUI
import Box from '@mui/material/Box';
import { Chip, Divider, Stack, styled, Typography } from '@mui/material';
import Calendar from '@mui/icons-material/Event';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import { ClearIcon } from '@mui/x-date-pickers';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

import { useSortable } from '@dnd-kit/sortable';
import { Arguments, CSS } from '@dnd-kit/utilities';
import { width } from '@mui/system';
import { useFocus } from '@/app/components/FocusContext';
import { TYPE_ITEM } from '@/app/settings/Settings_T01';
import { arrayRemove, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import fireStore from '@/firebase/firestore';
import TodoEditDialog from '@/app/todolist/TodoEditDialog';

/********************************************************************
  [컴포넌트 정보]
  TodoListBox 내부에 리스트로 렌더링되는 개별 아이템
 ********************************************************************/
const CustomTypography = styled(Typography)(({ theme }) => ({
  display: '-webkit-box',
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
  // 원하는 줄 수로 제한
  WebkitLineClamp: 3,
  p: 3,
  whiteSpace: 'pre-line'
}));

interface TodoProps {
  todo: TODO;
  todoList: TODO[];
  todoTypeList: Readonly<[]>;
  setTodoList: React.Dispatch<React.SetStateAction<TODO[]>>;
  setUpdateList: React.Dispatch<React.SetStateAction<string[]>>;
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
}
interface TodoComponentProps extends TodoProps {
  isOverlay: boolean;
}

export default function Todo({
  isOverlay,
  todo,
  todoList,
  todoTypeList,
  setTodoList,
  setUpdateList,
  setIsEditing
}: TodoComponentProps) {
  /**************************************************
    변수, 상수 및 상태 정의
  **************************************************/
  const { focusedId, setFocusedId } = useFocus();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [clickedChips, setClickedChips] = useState({ ...todo.todoType }); // 작업유형 클릭여부
  // const [isEditing, setIsEditing] = useState(false); // 수정여부
  const [calOpen, setCalOpen] = useState({ START: false, END: false });

  const { attributes, listeners, setActivatorNodeRef, setNodeRef, isDragging } =
    useSortable({
      id: todo.id,
      data: { status: todo.status, item: todo, compType: 'Item' }
    } as Arguments<any>);

  useEffect(() => {
    setIsFocused(focusedId === todo.id || isDragging || isOverlay);
  }, [isDragging, isOverlay, focusedId]);

  /**************************************************
    스타일 정의
  **************************************************/
  const style = {
    display: 'flex',
    alignItems: 'center',
    m: 1,
    border: '1px solid #bdbdbd',
    borderRadius: 1,
    outline: 'solid',
    outlineColor: 'primary.main',
    outlineWidth: isFocused ? '2px' : '0px',
    backgroundColor: 'white',
    boxShadow: isOverlay ? 0 : 2,
    opacity: isOverlay ? 0.7 : 1,

    '&:hover .iconBox': {
      visibility: 'visible'
    }
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
    width: '100%'
  };

  // 아이콘 박스 Sx
  const iconBoxSx = {
    borderRadius: 1,
    backgroundColor: 'grey.200',
    p: 0.3
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

  const handleItemClick = (e: React.MouseEvent<HTMLDivElement>, id: string) => {
    // 아이템 클릭 시 상위 컨테이너의 클릭 이벤트가 발생하지 않도록 중지
    e.stopPropagation();
    setFocusedId(id);
  };

  const handleEditClick = () => {
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  // 작업유형 제거버튼 클릭 이벤트
  const handleClickRemoveButton = async () => {
    const todoRef = doc(fireStore, 'todo', 'userId_01', 'todoItem', todo.id);
    try {
      await deleteDoc(todoRef);
    } catch (error) {
      console.log('TODO 아이템을 제거하는 과정에서 오류가 발생하였습니다.');
    }
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

  const editProps = {
    todo: todo,
    todoList: todoList,
    todoTypeList: todoTypeList,
    setTodoList: setTodoList,
    setUpdateList: setUpdateList,
    setIsEditing: setIsEditing,
    focusedId: focusedId,
    setFocusedId: setFocusedId
  };

  return (
    <Box
      id={`${todo.status}_${todo.ord}`}
      component="div"
      ref={setNodeRef}
      sx={style}
      onMouseDown={(e) => handleItemClick(e, todo.id)}
    >
      <div ref={setActivatorNodeRef} style={{ width: '100%' }} {...listeners}>
        <Box sx={inputBoxSx}>
          <Stack direction="column" sx={{ width: '100%' }}>
            <Stack
              direction="row"
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <Typography
                sx={{ width: '45px', fontSize: '14px', fontWeight: '600' }}
              >
                {todo?.title}
              </Typography>
              <Box className="iconBox" sx={{ visibility: 'hidden' }}>
                <EditIcon
                  sx={{ ...iconBoxSx, mr: 0.5 }}
                  color="disabled"
                  onClick={handleEditClick}
                />
                <TodoEditDialog
                  open={dialogOpen}
                  editProps={editProps}
                  onClose={handleDialogClose}
                />
                <DeleteIcon
                  sx={iconBoxSx}
                  color="disabled"
                  onClick={handleClickRemoveButton}
                />
              </Box>
            </Stack>
            <Divider sx={{ mt: 1, mb: 1 }} />
            <Stack direction="row">
              <Typography>
                {todo?.dtmStart} ~ {todo?.dtmEnd}
              </Typography>
            </Stack>
            <Divider sx={{ mt: 1, mb: 1 }} />
            <CustomTypography
              sx={{ color: todo?.rmark ? 'default' : 'grey.400' }}
            >
              {todo?.rmark ? todo?.rmark : '내용이 없습니다.'}
            </CustomTypography>
          </Stack>
        </Box>
      </div>
    </Box>
  );
}
