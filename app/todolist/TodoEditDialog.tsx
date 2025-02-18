"use client";
import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Chip,
  Dialog,
  Divider,
  FormControl,
  FormControlLabel,
  IconButton,
  IconContainerProps,
  Radio,
  RadioGroup,
  Rating,
  Stack,
  styled,
  TextField,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { ClearIcon } from "@mui/x-date-pickers";
import SentimentVeryDissatisfiedIcon from "@mui/icons-material/SentimentVeryDissatisfied";
import SentimentDissatisfiedIcon from "@mui/icons-material/SentimentDissatisfied";
import SentimentSatisfiedIcon from "@mui/icons-material/SentimentSatisfied";
import SentimentSatisfiedAltIcon from "@mui/icons-material/SentimentSatisfiedAltOutlined";
import SentimentVerySatisfiedIcon from "@mui/icons-material/SentimentVerySatisfied";
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

  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [value, setValue] = React.useState<number | null>(
    draftTodo.taskDv ?? 3,
  );
  const [hover, setHover] = React.useState(-1);

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
    setTodoList(
      todoList.map((item) => {
        return item.id === draftTodo.id ? draftTodo : item;
      }),
    );
    setUpdatedTodos(draftTodo);
    setIsEditing(true);
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
    width: "inherit",
    "&.titleBox": {
      p: 2,
      backgroundColor: "grey.200",
    },
  };

  const typoSx = {
    mr: 1,
    textAlign: "center",
    width: "70px",
    minWidth: "40px",
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
    setDraftTodo({ ...draftTodo, [targetField]: value });
  };

  // 컴포넌트 초기화버튼 클릭이벤트
  const handleClear = (targetField: string) => {
    setDraftTodo({ ...draftTodo, [targetField]: null });
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

  const handleRemoveClick = () => {
    removeTodo(draftTodo.id);
    onClose();
  };

  const handleItemClick = (e: React.PointerEvent<HTMLDivElement>) => {
    // 아이템 클릭 시 상위 컨테이너의 클릭 이벤트가 발생하지 않도록 중지
    console.log("mousedown");
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
        <Stack direction="row">
          <StyledRating
            value={draftTodo.taskDv}
            defaultValue={2}
            IconContainerComponent={IconContainer}
            getLabelText={(value: number) => customIcons[value].label}
            highlightSelectedOnly
            max={4}
            onChange={(event, value) => handleOnChange("taskDv", value ?? 2)}
            onChangeActive={(event, newHover) => {
              setHover(newHover);
            }}
          />
          <Box sx={{ ml: 2 }}>
            {customIcons[hover !== -1 ? hover : (draftTodo.taskDv ?? 2)].label}
          </Box>
        </Stack>
      </Box>
    );
  };

  const StyledRating = styled(Rating)(({ theme }) => ({
    "& .MuiRating-iconEmpty .MuiSvgIcon-root": {
      color: theme.palette.action.disabled,
    },
  }));

  const customIcons: {
    [index: string]: {
      icon: React.ReactElement<unknown>;
      label: string;
    };
  } = {
    1: {
      icon: <RectangleIcon sx={{ color: "skyblue" }} />,
      label: "낮음",
    },
    2: {
      icon: <RectangleIcon sx={{ color: "darkseagreen" }} />,
      label: "보통",
    },
    3: {
      icon: <RectangleIcon sx={{ color: "orange" }} />,
      label: "높음",
    },
    4: {
      icon: <RectangleIcon sx={{ color: "orangered" }} />,
      label: "중요",
    },
  };

  function IconContainer(props: IconContainerProps) {
    const { value, ...other } = props;
    return <span {...other}>{customIcons[value].icon}</span>;
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      onPointerDown={(event) => handleItemClick(event)}
    >
      <Box id={draftTodo.id} content="div" sx={{ ...style }}>
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
