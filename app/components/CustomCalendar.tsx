"use client";
import React, { Dispatch, useState } from "react";

import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import { IconButton } from "@mui/material";
import { ClearIcon } from "@mui/x-date-pickers";
import Calendar from "@mui/icons-material/Event";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { TODO } from "@/app/todolist/Todo_T01";

/********************************************************************
 [컴포넌트 정보]
 캘린더 컴포넌트
 ********************************************************************/

export default ({
  children,
  todo,
  fieldName,
  setDraftTodo,
}: Readonly<{
  children: React.ReactNode;
  todo: TODO;
  fieldName: keyof TODO;
  setDraftTodo: Dispatch<React.SetStateAction<TODO>>;
}>) => {
  const [calOpen, setCalOpen] = useState(false);

  // Calendar Open 핸들러
  const handleCalendarOpen = () => {
    setCalOpen(!calOpen);
  };

  // 내용 수정 이벤트
  const handleOnChange = <Key extends keyof TODO>(
    targetField: Key,
    value: TODO[Key],
  ) => {
    setDraftTodo({ ...todo, [targetField]: value });
  };

  // 컴포넌트 초기화버튼 클릭이벤트
  const handleClickClear = (targetField: string) => {
    setDraftTodo({ ...todo, [targetField]: null });
  };

  return (
    <>
      {children}
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DatePicker
          value={
            typeof todo[fieldName] === "string" ? dayjs(todo[fieldName]) : null
          }
          open={calOpen}
          onOpen={handleCalendarOpen}
          onClose={handleCalendarOpen}
          sx={{ width: "100%" }}
          slotProps={{
            textField: {
              size: "small",
              InputProps: {
                endAdornment: (
                  <>
                    {todo[fieldName] && (
                      <IconButton
                        edge="end"
                        onClick={() => handleClickClear(fieldName)}
                      >
                        <ClearIcon />
                      </IconButton>
                    )}
                    <IconButton edge="end" onClick={handleCalendarOpen}>
                      <Calendar />
                    </IconButton>
                  </>
                ),
              },
            },
          }}
          format="YYYY-MM-DD"
          onChange={(newValue) =>
            handleOnChange(
              fieldName,
              newValue === null ? undefined : newValue.format("YYYY-MM-DD"),
            )
          }
        />
      </LocalizationProvider>
    </>
  );
};
