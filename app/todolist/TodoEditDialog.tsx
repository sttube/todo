"use client";
import React, { useEffect, useRef, useState } from "react";
import isEqual from "lodash/isEqual";
import {
  Box,
  Chip,
  Dialog,
  Divider,
  IconButton,
  IconContainerProps,
  Rating,
  Stack,
  styled,
  TextField,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { ClearIcon } from "@mui/x-date-pickers";
import RectangleIcon from "@mui/icons-material/Rectangle";

import { useTodoStore } from "@/app/todolist/todoStore";
import { TODO } from "@/app/todolist/Todo_T01";
import CustomCalendar from "../components/CustomCalendar";
import DeleteIcon from "@mui/icons-material/Delete";
import RemoveDialog from "@/app/components/RemoveDialog";

/********************************************************************
 [컴포넌트 정보]
 todoItem 편집 다이얼로그
 ********************************************************************/
export default ({
  open,
  onClose,
  todo,
}: {
  open: boolean;
  onClose: () => void;
  todo: TODO;
}) => {
  /**************************************************
      변수, 상수 및 상태 정의
    **************************************************/
  const [draftTodo, setDraftTodo] = useState(todo);
  const [clickedChips, setClickedChips] = useState<Record<string, boolean>>({
    ...todo.todoType,
  }); // 작업유형 클릭여부
  const {
    isEditing,
    todoList,
    todoTypeList,
    priorityScheme,
    setIsEditing,
    setTodoList,
    setUpdatedTodos,
  } = useTodoStore();

  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [hover, setHover] = React.useState(-1);
  const isInitialMount = useRef(true);

  /**************************************************
      useEffect
   **************************************************/
  useEffect(() => {
    if (todoList === undefined) return;

    if (!isEqual(todo, draftTodo)) {
      setTodoList(
        todoList.map((item) => {
          return item.id === draftTodo.id ? draftTodo : item;
        }),
      );
      setIsEditing(true);
      setUpdatedTodos(draftTodo);
    }
  }, [draftTodo]);

  /**************************************************
      스타일 정의
    **************************************************/
  const style = {
    display: "flex",
    alignItems: "center",
    justifyContent: "start",
    backgroundColor: "white",
    width: "100%",
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
    justifyContent: "start",
    alignItems: "center",
    width: "100%",
    "&.titleBox": {
      p: 2,
      backgroundColor: priorityScheme[draftTodo.priority ?? 2].bgColor,
    },
  };

  const typoSx = {
    pr: 1,
    textAlign: "center",
    minWidth: "65px",
    fontSize: "13px",
    fontWeight: "600",
    color: "grey.600",
    whiteSpace: "nowrap",
  };

  // 아이콘 박스 Sx
  const iconBoxSx = {
    borderRadius: 1,
    backgroundColor: "grey.200",
    p: 0.3,
    cursor: "pointer",
  };

  /**************************************************
    EventHandler
  **************************************************/
  // 내용 수정 이벤트
  const handleOnChange = <Key extends keyof TODO>(
    targetField: Key,
    value: TODO[Key],
  ) => {
    if (value === "") {
      // value가 빈 값이면 targetField를 제거한 나머지 속성들로 새 객체 생성
      const { [targetField]: _, ...rest } = draftTodo;
      setDraftTodo(rest as TODO);
    } else {
      setDraftTodo({ ...draftTodo, [targetField]: value });
    }
  };

  // 컴포넌트 초기화버튼 클릭이벤트
  const handleClear = <Key extends keyof TODO>(targetField: Key) => {
    const { [targetField]: _, ...rest } = draftTodo;
    setDraftTodo(rest as TODO);
  };

  // 작업타입 Chip 클릭이벤트
  const handleChipClick = (id: string) => {
    const newValue = !clickedChips[id];
    setClickedChips((prev) => ({
      ...prev,
      [id]: newValue, // 클릭한 Chip의 상태를 토글
    }));

    setDraftTodo({
      ...draftTodo,
      todoType: { ...draftTodo.todoType, [id]: newValue },
    });
  };

  // 삭제 다이얼로그 오픈 핸들러
  const handleClickRemove = () => {
    setRemoveDialogOpen(true);
  };

  const handleItemClick = (e: React.PointerEvent<HTMLDivElement>) => {
    // 아이템 클릭 시 상위 컨테이너의 클릭 이벤트가 발생하지 않도록 중지
    e.stopPropagation();
  };

  /**************************************************
      Element 정의
    **************************************************/
  // 작업타입 리스트
  const TypeList = () => {
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
          onClick={() => handleChipClick(item.id)}
        />
      ),
    );
  };

  // 중요도 선택 박스
  const RatingBox = () => {
    return (
      <Box>
        <Stack direction="row" sx={{ display: "flex", alignItems: "end" }}>
          <StyledRating
            value={draftTodo.priority}
            defaultValue={2}
            IconContainerComponent={IconContainer}
            getLabelText={(value: number) => priorityScheme[value].label}
            highlightSelectedOnly
            max={4}
            onChange={(_, value) => handleOnChange("priority", value ?? 2)}
            onChangeActive={(_, newHover) => {
              setHover(newHover);
            }}
          />
          <Typography
            sx={{
              ml: 1,
              pb: 0.2,
              fontSize: "13px",
              fontWeight: "600",
              color: "grey.600",
              whiteSpace: "nowrap",
            }}
          >
            {
              priorityScheme[hover !== -1 ? hover : (draftTodo.priority ?? 2)]
                .label
            }
          </Typography>
        </Stack>
      </Box>
    );
  };

  const StyledRating = styled(Rating)(({ theme }) => ({
    "& .MuiRating-iconEmpty .MuiSvgIcon-root": {
      color: theme.palette.action.disabled,
    },
  }));

  function IconContainer(props: IconContainerProps) {
    const { value, ...other } = props;
    return (
      <span {...other}>
        <RectangleIcon sx={{ color: priorityScheme[value].bgColor }} />
      </span>
    );
  }

  // 본문
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      onPointerDown={(event) => handleItemClick(event)}
    >
      <Box id={draftTodo.id} content="div" sx={{ ...style }}>
        <Stack direction="column" width="70vw">
          <Stack
            className="titleBox"
            direction="row"
            sx={{
              ...inputBoxSx,
            }}
          >
            {/*상단 제목 섹션*/}
            <Box sx={{ width: "100%" }}>
              <TextField
                fullWidth
                id="title"
                size="small"
                variant="standard"
                value={draftTodo.title ?? ""}
                placeholder="제목을 입력하세요."
                sx={{
                  "& .MuiInputBase-input": {
                    fontSize: "20px",
                    fontWeight: "bold",
                  },
                }}
                onChange={(e) => handleOnChange("title", e.target.value)}
              />
            </Box>
            <CloseIcon
              sx={{
                ml: 2,
                fontSize: "30px",
                cursor: "pointer",
                color: "grey.400",
                "&:hover": { color: "black" },
              }}
              onClick={onClose}
            />
          </Stack>
          <Divider />
          <Stack direction="row" sx={{ width: "100%" }}>
            {/*하단 좌측 내용 섹션*/}
            <Box className="rmark" sx={{ ...inputBoxSx }}>
              <TextField
                fullWidth
                value={draftTodo.rmark ?? ""}
                placeholder="내용을 입력하세요."
                multiline
                rows={25}
                sx={{
                  "& .MuiInputBase-root.MuiOutlinedInput-root": {
                    padding: "10px", // 내부 여백 줄이기
                    fontSize: "14px", // 폰트 사이즈 변경
                  },
                }}
                slotProps={{
                  input: {
                    endAdornment: draftTodo.rmark && (
                      <IconButton
                        onClick={() => handleClear("rmark")}
                        edge="end"
                      >
                        <ClearIcon />
                      </IconButton>
                    ),
                  },
                }}
                onChange={(e) => handleOnChange("rmark", e.target.value)}
              />
            </Box>
            <Divider orientation="vertical" flexItem />
            {/*하단 우측 상세정보 섹션*/}
            <Stack
              direction="column"
              justifyContent="space-between"
              sx={{ minWidth: "300px" }}
            >
              <Box>
                <Box sx={{ ...inputBoxSx }}>
                  <CustomCalendar
                    todo={draftTodo}
                    fieldName="dtmStart"
                    setDraftTodo={setDraftTodo}
                  >
                    <Typography sx={typoSx}>시작일자</Typography>
                  </CustomCalendar>
                </Box>
                <Box sx={{ ...inputBoxSx }}>
                  <CustomCalendar
                    todo={draftTodo}
                    fieldName="dtmEnd"
                    setDraftTodo={setDraftTodo}
                  >
                    <Typography sx={typoSx}>종료일자</Typography>
                  </CustomCalendar>
                </Box>
                <Divider />
                <Box sx={{ ...inputBoxSx }}>
                  <CustomCalendar
                    todo={draftTodo}
                    fieldName="dtmDeadLine"
                    setDraftTodo={setDraftTodo}
                  >
                    <Typography sx={typoSx}>마감기한</Typography>
                  </CustomCalendar>
                </Box>
                <Divider />
                <Box sx={{ ...inputBoxSx }}>
                  <Typography sx={typoSx}>작업유형</Typography>
                  <Box
                    sx={{
                      pt: 1,
                      width: "100%",
                      display: "flex",
                      flexWrap: "wrap",
                      justifyContent: "center",
                    }}
                  >
                    {TypeList()}
                  </Box>
                </Box>
                <Divider />
                <Box sx={{ ...inputBoxSx }}>
                  <Typography sx={typoSx}>우선순위</Typography>
                  <RatingBox />
                </Box>
                <Divider />
              </Box>
              <Box sx={{ ...inputBoxSx }}>
                <DeleteIcon
                  sx={{
                    ...iconBoxSx,
                    fontSize: "30px",
                    "&:hover": {
                      color: "#d50000", // hover 시 색상 변경
                    },
                  }}
                  color="disabled"
                  onClick={handleClickRemove}
                />
                <Typography sx={{ ...typoSx, width: "40px" }}>삭제</Typography>
                <RemoveDialog
                  open={removeDialogOpen}
                  onClose={() => setRemoveDialogOpen(false)}
                  todoId={draftTodo.id}
                />
              </Box>
            </Stack>
          </Stack>
        </Stack>
      </Box>
    </Dialog>
  );
};
