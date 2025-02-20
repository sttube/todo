"use client";
import React, { useEffect, useState } from "react";

import { TextField } from "@mui/material";
import { REPORT } from "@/app/todolist/Todo_T01";
import { useTodoStore } from "@/app/todolist/todoStore";
import isEqual from "lodash/isEqual";

/********************************************************************
 [컴포넌트 정보]
 주간보고서 편집 컴포넌트
 ********************************************************************/

export default () => {
  /**************************************************
    변수, 상수 및 상태 정의
  **************************************************/
  const { report, setReport, setIsEditing } = useTodoStore();
  const [draftReport, setDraftReport] = useState<REPORT | undefined>(undefined);

  /**************************************************
      useEffect
   **************************************************/
  useEffect(() => {
    if (report?.memo) setDraftReport(report);
  }, [report]);

  useEffect(() => {
    if (!isEqual(report, draftReport)) {
      setReport(draftReport);
      setIsEditing(true);
    }
  }, [draftReport]);

  /**************************************************
    EventHandler
   **************************************************/
  // 내용수정 핸들러
  const handleOnChange = (value: string) => {
    setDraftReport({ memo: value });
  };

  // 컴포넌트 초기화버튼 클릭이벤트
  // const handleClickClear = (targetField: string) => {
  //   setDraftTodo({ ...todo, [targetField]: null });
  // };

  return (
    <TextField
      value={draftReport?.memo}
      multiline
      fullWidth
      sx={{
        p: 1,
        height: "100%",
        // TextField 실제 입력영역
        "& .MuiInputBase-root": {
          backgroundColor: "white",
          alignItems: "flex-start",
          height: "100%",
          boxShadow: 2,
          fontSize: "14px",
        },
      }}
      onChange={(event) => handleOnChange(event.target.value)}
    />
  );
};
