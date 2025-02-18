"use client";
import React, { useEffect, useState } from "react";
import { TODO } from "./Todo_T01";

//MUI
import Box from "@mui/material/Box";
import {
  Button,
  Chip,
  Divider,
  Stack,
  styled,
  Tooltip,
  Typography,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

import { useSortable } from "@dnd-kit/sortable";
import { useFocus } from "@/app/components/FocusContext";
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
  WebkitLineClamp: 1,
  p: 3,
  whiteSpace: "pre-line",
  "&.rmark": {
    WebkitLineClamp: 3,
  },
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
  const { todoTypeList } = useTodoStore();

  const { listeners, setActivatorNodeRef, setNodeRef, isDragging } =
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
                pl: 1,
                pr: 1,
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <Box>
                <Tooltip title="우선순위" placement="top">
                  <Chip
                    label="매우높음"
                    size="small"
                    sx={{ mr: 0.5, fontWeight: "bold" }}
                  />
                </Tooltip>
                <Tooltip title="마감기한" placement="top">
                  <Chip
                    label="D-12"
                    size="small"
                    sx={{ mr: 0.5, fontWeight: "bold" }}
                  />
                </Tooltip>
              </Box>
              <Box
                className="iconBox"
                sx={{ visibility: "hidden", whiteSpace: "nowrap" }}
              >
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
                  onClose={() => handleDialogClose("Edit")}
                  todo={todo}
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
                <RemoveDialog
                  open={removeDialogOpen}
                  onClose={() => handleDialogClose("Remove")}
                  todoId={todo.id}
                />
              </Box>
            </Stack>
            <Divider sx={{ mt: 1, mb: 1 }} />
            {(todo.dtmStart || todo.dtmEnd) && (
              <>
                <Stack
                  direction="row"
                  sx={{
                    pl: 1,
                    pr: 1,
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  {todo.dtmStart && (
                    <Chip
                      label={`시작 | ${todo.dtmStart}`}
                      size="small"
                      sx={{ fontWeight: "bold" }}
                    />
                  )}
                  {todo.dtmEnd && (
                    <Chip
                      label={`종료 | ${todo.dtmEnd}`}
                      size="small"
                      sx={{ fontWeight: "bold" }}
                    />
                  )}
                </Stack>
                <Divider sx={{ mt: 1, mb: 1 }} />
              </>
            )}
            <CustomTypography
              sx={{
                pl: 1,
                pr: 1,
                fontSize: "14px",
                fontWeight: "600",
                color: todo.title ? "default" : "grey.400",
              }}
            >
              {todo.title ?? "제목이 없습니다."}
            </CustomTypography>
            <Divider sx={{ mt: 1, mb: 1 }} />
            <CustomTypography
              className="rmark"
              sx={{ pl: 1, pr: 1, color: todo.rmark ? "default" : "grey.400" }}
            >
              {todo.rmark ?? "내용이 없습니다."}
            </CustomTypography>
          </Stack>
        </Box>
      </div>
    </Box>
  );
}
