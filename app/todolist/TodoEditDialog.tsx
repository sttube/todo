"use client";
import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Chip,
  Dialog,
  Divider,
  IconButton,
  Rating,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { ClearIcon } from "@mui/x-date-pickers";

import dayjs from "dayjs";
import { useTodoStore } from "@/app/todolist/todoStore";
import { TODO } from "@/app/todolist/Todo_T01";
import CustomCalendar from "../components/CustomCalendar";
/********************************************************************
  [컴포넌트 정보]
  todoItem 편집 다이얼로그
 ********************************************************************/
export default function EditTodoDialog({
  open,
  onClose,
  todo,
}: {
  open: boolean;
  onClose: () => void;
  todo: TODO;
}) {
  /**************************************************
      변수, 상수 및 상태 정의
    **************************************************/
  const [draftTodo, setDraftTodo] = useState(todo);
  const [clickedChips, setClickedChips] = useState<Record<string, boolean>>({}); // 작업유형 클릭여부
  const {
    todoList,
    todoTypeList,
    setIsEditing,
    setTodoList,
    setUpdatedTodos,
    removeTodo,
  } = useTodoStore();

  interface CalOpenState {
    START: boolean;
    END: boolean;
    DEADLINE: boolean;
  }

  const [calOpen, setCalOpen] = useState<CalOpenState>({
    START: false,
    END: false,
    DEADLINE: false,
  });

  /**************************************************
      useEffect
   **************************************************/
  // 다이얼로그가 열릴 때마다 초기값을 업데이트
  useEffect(() => {
    setDraftTodo(todo);
    setClickedChips({
      ...todo.todoType,
    });
  }, [todo, open]);

  useEffect(() => {
    onUpdate(draftTodo);
  }, [draftTodo]);

  /**************************************************
      스타일 정의
    **************************************************/
  const style = {
    display: "flex",
    alignItems: "center",
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
    alignItems: "center",
    width: "100%",
    "&.titleBox": {
      p: 2,
      backgroundColor: "grey.200",
    },
  };

  const typoSx = {
    mr: 1,
    textAlign: "center",
    width: "40px",
    minWidth: "40px",
    fontSize: "13px",
    fontWeight: "600",
    color: "grey.600",
  };

  /**************************************************
    EventHandler
  **************************************************/
  // updateList에 업데이트 대상 item 추가 후 수정여부(isEditing) 변경
  const onUpdate = (todo: TODO) => {
    setTodoList(
      todoList.map((item) => {
        return item.id === todo.id ? todo : item;
      }),
    );
    setDraftTodo(todo);
    setUpdatedTodos(todo);
    setIsEditing(true);
  };

  // 내용 수정 이벤트
  const handleOnChange = <Key extends keyof TODO>(
    targetField: Key,
    value: TODO[Key],
  ) => {
    onUpdate({ ...draftTodo, [targetField]: value });
  };

  // 컴포넌트 초기화버튼 클릭이벤트
  const handleClear = (targetField: string) => {
    onUpdate({ ...draftTodo, [targetField]: null });
  };

  // 작업타입 Chip 클릭이벤트
  const handleChipClick = (id: string) => {
    const newValue = !clickedChips[id];
    setClickedChips((prev) => ({
      ...prev,
      [id]: newValue, // 클릭한 Chip의 상태를 토글
    }));

    onUpdate({
      ...draftTodo,
      todoType: { ...draftTodo.todoType, [id]: newValue },
    });
  };

  // Calendar 오픈 핸들러
  const handleCalendarOpen = (id: keyof CalOpenState) => {
    setCalOpen((prev) => {
      return { ...prev, [id]: !prev[id] };
    });
  };

  const handleRemoveClick = () => {
    removeTodo(draftTodo.id);
    onClose();
  };

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
          onClick={() => handleChipClick(item.id)}
        />
      ),
    );
  };

  const marks = [
    {
      value: 0,
      label: "매우낮음",
    },
    {
      value: 25,
      label: "낮음",
    },
    {
      value: 50,
      label: "보통",
    },
    {
      value: 75,
      label: "높음",
    },
    {
      value: 100,
      label: "매우높음",
    },
  ];

  function valuetext(value: number) {
    const mark = marks.find((m) => m.value === value);
    return mark ? mark.label : "";
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg">
      <Box id={draftTodo.id} sx={{ ...style }}>
        <Stack direction="column" width="70vw">
          <Stack className="titleBox" direction="row" sx={{ ...inputBoxSx }}>
            <Box sx={{ width: "100%" }}>
              <TextField
                fullWidth
                id="title"
                size="medium"
                variant="standard"
                value={draftTodo?.title}
                placeholder="제목을 입력하세요."
                sx={{ fontSize: "20px" }}
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
            <Box className="rmark" sx={{ ...inputBoxSx }}>
              <TextField
                fullWidth
                value={draftTodo?.rmark}
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
            <Stack
              direction="column"
              justifyContent="space-between"
              sx={{ minWidth: "240px" }}
            >
              <Box>
                <Box sx={{ ...inputBoxSx }}>
                  <CustomCalendar
                    todo={draftTodo}
                    fieldName="dtmStart"
                    setDraftTodo={setDraftTodo}
                    // onChange={(value: dayjs.Dayjs | null) =>
                    //   onChange(
                    //     "dtmStart",
                    //     value === null ? undefined : value.format("YYYY-MM-DD"),
                    //   )
                    // }
                  >
                    <Typography sx={typoSx}>시작 일자</Typography>
                  </CustomCalendar>
                </Box>
                <Box sx={{ ...inputBoxSx }}>
                  <CustomCalendar
                    value={draftTodo.dtmEnd}
                    onChange={(value: dayjs.Dayjs | null) =>
                      handleOnChange(
                        "dtmEnd",
                        value === null ? undefined : value.format("YYYY-MM-DD"),
                      )
                    }
                    handleClickClear={() => handleClear("dtmEnd")}
                  >
                    <Typography sx={typoSx}>종료 일자</Typography>
                  </CustomCalendar>
                </Box>
                <Divider />
                <Box sx={{ ...inputBoxSx }}>
                  <CustomCalendar
                    value={draftTodo.dtmDeadLine}
                    onChange={(value: dayjs.Dayjs | null) =>
                      handleOnChange(
                        "dtmDeadLine",
                        value === null ? undefined : value.format("YYYY-MM-DD"),
                      )
                    }
                    handleClickClear={() => handleClear("dtmDeadLine")}
                  >
                    <Typography sx={typoSx}>마감 기한</Typography>
                  </CustomCalendar>
                </Box>
                <Divider />
                <Box sx={{ ...inputBoxSx }}>
                  <Typography sx={typoSx}>작업 유형</Typography>
                  <Box
                    sx={{
                      pt: 1,
                      width: "100%",
                      display: "flex",
                      flexWrap: "wrap",
                      justifyContent: "center",
                    }}
                  >
                    {typeList()}
                  </Box>
                </Box>
                <Divider />
                <Box sx={{ ...inputBoxSx }}>
                  <Typography sx={typoSx}>중요도</Typography>
                  <Box
                    sx={{
                      display: "flex",
                      width: "100%",
                      justifyContent: "center",
                    }}
                  >
                    <Rating
                      name="simple-controlled"
                      value={draftTodo?.taskDv}
                      defaultValue={3}
                      highlightSelectedOnly
                      onChange={(event, newValue) =>
                        handleOnChange("taskDv", newValue ?? 3)
                      }
                    />
                  </Box>
                </Box>
                <Divider />
              </Box>
              <Box
                sx={{
                  ...inputBoxSx,
                }}
              >
                <Button
                  disableElevation
                  sx={{
                    width: "60px",
                    border: (theme) => `2px solid ${theme.palette.grey[300]}`,
                    backgroundColor: "grey.100",
                    color: "#d50000",
                    fontWeight: "550",
                    "&:hover": {
                      borderWidth: "0px",
                      color: "white",
                      backgroundColor: "#d50000", // hover 시 darker grey
                    },
                  }}
                  onClick={handleRemoveClick}
                >
                  삭제
                </Button>
              </Box>
            </Stack>
          </Stack>
        </Stack>
      </Box>
    </Dialog>
  );
}
