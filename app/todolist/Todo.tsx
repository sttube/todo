"use client";
import React, { useEffect, useState } from "react";
import { TODO } from "./Todo_T01";

//MUI
import Box from "@mui/material/Box";
import {
  Button,
  Chip,
  createTheme,
  Dialog,
  Divider,
  Stack,
  styled,
  ThemeProvider,
  Typography,
} from "@mui/material";
import Calendar from "@mui/icons-material/Event";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import { ClearIcon } from "@mui/x-date-pickers";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

import { useSortable } from "@dnd-kit/sortable";
import { useFocus } from "@/app/components/FocusContext";
import { deleteDoc, doc } from "firebase/firestore";
import fireStore from "@/firebase/firestore";
import TodoEditDialog from "@/app/todolist/TodoEditDialog";
import { useTodoStore } from "@/app/todolist/todoStore";
import RemoveDialog from "../components/RemoveDialog";

/********************************************************************
  [컴포넌트 정보]
  TodoListBox 내부에 리스트로 렌더링되는 개별 아이템
 ********************************************************************/
const CustomTypography = styled(Typography)(() => ({
  display: "-webkit-box",
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
  // 원하는 줄 수로 제한
  WebkitLineClamp: 3,
  p: 3,
  whiteSpace: "pre-line",
}));

export default function Todo({
  isOverlay = false,
  todo,
}: {
  isOverlay: boolean;
  todo: TODO;
}) {
  /**************************************************
    변수, 상수 및 상태 정의
  **************************************************/
  const { focusedId, setFocusedId } = useFocus();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  // 작업유형 클릭여부
  type TodoType = { [key: string]: boolean };
  const [clickedChips, setClickedChips] = useState<TodoType>(
    todo.todoType ?? {},
  );
  // const [isEditing, setIsEditing] = useState(false); // 수정여부
  const [calOpen, setCalOpen] = useState({ START: false, END: false });
  const { todoList, todoTypeList, removeTodo } = useTodoStore();

  const { attributes, listeners, setActivatorNodeRef, setNodeRef, isDragging } =
    useSortable({
      id: todo.id,
      data: { status: todo.status, item: todo, compType: "Item" },
    });

  useEffect(() => {
    setIsFocused(focusedId === todo.id || isDragging || isOverlay);
  }, [isDragging, isOverlay, focusedId]);

  /**************************************************
    스타일 정의
  **************************************************/
  const style = {
    display: "flex",
    alignItems: "center",
    m: 1,
    border: "1px solid #bdbdbd",
    borderRadius: 1,
    outline: "solid",
    outlineColor: "primary.main",
    outlineWidth: isFocused ? "2px" : "0px",
    backgroundColor: "white",
    boxShadow: isOverlay ? 0 : 2,
    opacity: isOverlay ? 0.7 : 1,

    "&:hover .iconBox": {
      visibility: "visible",
    },
  };
  // 작업타입 Chip Sx
  const chipSx = (id: string) => {
    return {
      color: clickedChips[id] ? "primary.main" : "grey.400",
      borderWidth: clickedChips[id] ? "0.15em" : 1,
      borderColor: clickedChips[id] ? "primary.main" : "grey.400",
      margin: "0 8px 8px 0",
    };
  };

  // 내부 박스 Sx
  const inputBoxSx = {
    p: "10px",
    display: "flex",
    alignItems: "center",
    width: "100%",
  };

  // 아이콘 박스 Sx
  const iconBoxSx = {
    borderRadius: 1,
    backgroundColor: "grey.200",
    p: 0.3,
    cursor: "pointer",
  };

  /**************************************************
    useEffect
  **************************************************/

  /**************************************************
    EventHandler
  **************************************************/
  const handleItemClick = (e: React.MouseEvent<HTMLDivElement>, id: string) => {
    // 아이템 클릭 시 상위 컨테이너의 클릭 이벤트가 발생하지 않도록 중지
    e.stopPropagation();
    setFocusedId(id);
  };

  const handleDialogOpen = (target: string) => {
    if (target === "Edit") {
      setEditDialogOpen(true);
      return;
    }
    if (target === "Remove") {
      setRemoveDialogOpen(true);
      return;
    }
  };

  const handleDialogClose = (target: string) => {
    if (target === "Edit") {
      setEditDialogOpen(false);
      return;
    }
    if (target === "Remove") {
      setRemoveDialogOpen(false);
      return;
    }
  };

  // 작업유형 제거버튼 클릭 이벤트
  const handleRemoveClick = async () => {
    const todoRef = doc(fireStore, "todo", "userId_01", "todoItem", todo.id);
    try {
      await deleteDoc(todoRef);
    } catch (error) {
      console.log("TODO 아이템을 제거하는 과정에서 오류가 발생하였습니다.");
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
            ...chipSx(item.id),
          }}
        />
      ),
    );
  };

  return (
    <Box
      id={`${todo.status}_${todo.ord}`}
      component="div"
      ref={setNodeRef}
      sx={style}
      onMouseDown={(e) => handleItemClick(e, todo.id)}
    >
      <div ref={setActivatorNodeRef} style={{ width: "100%" }} {...listeners}>
        <Box sx={inputBoxSx}>
          <Stack direction="column" sx={{ width: "100%" }}>
            <Stack
              direction="row"
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Typography
                sx={{ width: "45px", fontSize: "14px", fontWeight: "600" }}
              >
                {todo?.title}
              </Typography>
              <Box className="iconBox" sx={{ visibility: "hidden" }}>
                <EditIcon
                  sx={{
                    ...iconBoxSx,
                    mr: 0.5,
                    "&:hover": {
                      color: "primary.main", // 예시: hover 시 색상 변경
                    },
                  }}
                  color="disabled"
                  onClick={() => handleDialogOpen("Edit")}
                />
                <TodoEditDialog
                  open={editDialogOpen}
                  todo={todo}
                  onClose={() => handleDialogClose("Edit")}
                />
                <DeleteIcon
                  sx={{
                    ...iconBoxSx,
                    "&:hover": {
                      color: "#d50000", // 예시: hover 시 색상 변경
                    },
                  }}
                  color="disabled"
                  onClick={() => handleDialogOpen("Remove")}
                />
                <Dialog open={removeDialogOpen}>
                  <RemoveDialog
                    handleClickRemove={() => removeTodo(todo.id)}
                    handleClickCancle={() => handleDialogClose("Remove")}
                  />
                </Dialog>
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
              sx={{ color: todo?.rmark ? "default" : "grey.400" }}
            >
              {todo?.rmark ? todo?.rmark : "내용이 없습니다."}
            </CustomTypography>
          </Stack>
        </Box>
      </div>
    </Box>
  );
}
