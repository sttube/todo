import React, { useEffect, useState } from "react";
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
  Typography,
} from "@mui/material";
import { TODO } from "@/app/todolist/Todo_T01";
import Box from "@mui/material/Box";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import { ClearIcon } from "@mui/x-date-pickers";
import Calendar from "@mui/icons-material/Event";
import { useTodoStore } from "@/app/todolist/todoStore";

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
  const { todoList, todoTypeList, setIsEditing, setTodoList, setUpdatedTodos } =
    useTodoStore();

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

  /**************************************************
      스타일 정의
    **************************************************/
  const style = {
    display: "flex",
    alignItems: "center",
    m: 2,
    backgroundColor: "white",
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

    "&.rmark": {
      width: "800px",
    },
  };

  const typoSx = {
    width: "45px",
    fontSize: "14px",
    fontWeight: "600",
  };

  /**************************************************
    EventHandler
  **************************************************/
  // updateList에 업데이트 대상 item 추가 후 수정여부(isEditing) 변경
  const onUpdate = (todo: TODO) => {
    setUpdatedTodos(todo);
    setIsEditing(true);
  };

  // 내용 수정 이벤트
  const onChange = (
    targetField: string,
    value: string | undefined = undefined,
  ) => {
    const updatedList = todoList.map((item) =>
      item.id === draftTodo.id ? { ...item, [targetField]: value } : item,
    );
    onUpdate({ ...draftTodo, [targetField]: value });
  };

  // 컴포넌트 초기화버튼 클릭이벤트
  const handleClear = (targetField: string) => {
    const updatedList = todoList.map((item) =>
      item.id === draftTodo.id ? { ...item, [targetField]: undefined } : item,
    );
    onUpdate({ ...draftTodo, [targetField]: undefined });
  };

  // 작업타입 Chip 클릭이벤트
  const handleChipClick = (id: string) => {
    const newValue = !clickedChips[id];
    setClickedChips((prev) => ({
      ...prev,
      [id]: newValue, // 클릭한 Chip의 상태를 토글
    }));

    const updatedList = todoList.map((item) =>
      item.id === draftTodo.id
        ? { ...item, todoType: { ...item.todoType, [id]: newValue } }
        : item,
    );
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

  // 작업타입 리스트
  const removeDialog = () => {
    return (
      <Stack direction="column">
        <Typography>삭제하시겠습니까?</Typography>
        <Stack direction="row">
          <Button onClick={() => removeTodo(todo.id)}>예</Button>
          <Button onClick={() => handleDialogClose("Remove")}>아니오</Button>
        </Stack>
      </Stack>
    );
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg">
      <Box id={draftTodo.id} sx={{ ...style }}>
        <Stack direction="column">
          <Box sx={{ ...inputBoxSx }}>
            <Typography sx={typoSx}>제목</Typography>
            <TextField
              fullWidth
              id="title"
              size="small"
              variant="standard"
              value={draftTodo?.title}
              onChange={(e) => onChange("title", e.target.value)}
            />
          </Box>
          <Divider />
          <Stack direction="row" sx={{ width: "100%" }}>
            <Stack direction="column" sx={{ width: "300px" }}>
              <Box sx={{ ...inputBoxSx }}>
                <Typography sx={typoSx}>시작일자</Typography>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    value={
                      draftTodo.dtmStart ? dayjs(draftTodo.dtmStart) : null
                    }
                    open={calOpen.START}
                    onOpen={() => handleCalendarOpen("START")}
                    onClose={() => handleCalendarOpen("START")}
                    sx={{ width: "100%" }}
                    slotProps={{
                      textField: {
                        size: "small",
                        id: "dtmStart",
                        InputProps: {
                          endAdornment: (
                            <>
                              {draftTodo.dtmStart && (
                                <IconButton
                                  edge="end"
                                  onClick={() => handleClear("dtmStart")}
                                >
                                  <ClearIcon />
                                </IconButton>
                              )}
                              <IconButton
                                edge="end"
                                onClick={() => handleCalendarOpen("START")}
                              >
                                <Calendar />
                              </IconButton>
                            </>
                          ),
                        },
                      },
                    }}
                    format="YYYY-MM-DD"
                    onChange={(value) =>
                      onChange(
                        "dtmStart",
                        value === null ? undefined : value.format("YYYY-MM-DD"),
                      )
                    }
                  />
                </LocalizationProvider>
              </Box>

              <Box sx={{ ...inputBoxSx }}>
                <Typography sx={typoSx}>종료일자</Typography>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    value={draftTodo.dtmEnd ? dayjs(draftTodo.dtmEnd) : null}
                    open={calOpen.END}
                    onOpen={() => handleCalendarOpen("END")}
                    onClose={() => handleCalendarOpen("END")}
                    sx={{ width: "100%" }}
                    slotProps={{
                      textField: {
                        size: "small",
                        id: "dtmEnd",
                        InputProps: {
                          endAdornment: (
                            <>
                              {draftTodo.dtmEnd && (
                                <IconButton
                                  edge="end"
                                  onClick={() => handleClear("dtmEnd")}
                                >
                                  <ClearIcon />
                                </IconButton>
                              )}
                              <IconButton
                                edge="end"
                                onClick={() => handleCalendarOpen("END")}
                              >
                                <Calendar />
                              </IconButton>
                            </>
                          ),
                        },
                      },
                    }}
                    format="YYYY-MM-DD"
                    onChange={(value) =>
                      onChange(
                        "dtmEnd",
                        value === null ? undefined : value.format("YYYY-MM-DD"),
                      )
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
                      draftTodo.dtmDeadLine
                        ? dayjs(draftTodo.dtmDeadLine)
                        : null
                    }
                    open={calOpen.DEADLINE}
                    onOpen={() => handleCalendarOpen("DEADLINE")}
                    onClose={() => handleCalendarOpen("DEADLINE")}
                    sx={{ width: "100%" }}
                    slotProps={{
                      textField: {
                        size: "small",
                        id: "dtmDeadLine",
                        InputProps: {
                          endAdornment: (
                            <>
                              {draftTodo.dtmDeadLine && (
                                <IconButton
                                  edge="end"
                                  onClick={() => handleClear("dtmDeadLine")}
                                >
                                  <ClearIcon />
                                </IconButton>
                              )}
                              <IconButton
                                edge="end"
                                onClick={() => handleCalendarOpen("DEADLINE")}
                              >
                                <Calendar />
                              </IconButton>
                            </>
                          ),
                        },
                      },
                    }}
                    format="YYYY-MM-DD"
                    onChange={(value) =>
                      onChange(
                        "dtmDeadLine",
                        value === null ? undefined : value.format("YYYY-MM-DD"),
                      )
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
            </Stack>
            <Divider orientation="vertical" flexItem />
            <Box className="rmark" sx={{ ...inputBoxSx }}>
              <TextField
                value={draftTodo?.rmark}
                fullWidth
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
                onChange={(e) => onChange("rmark", e.target.value)}
              />
            </Box>
          </Stack>
        </Stack>
      </Box>
    </Dialog>
  );
}
