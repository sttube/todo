"use client";

import React, { useEffect, useState } from "react";

// MUI
import Box from "@mui/material/Box";

// React DnD
import Todo from "@/app/todolist/Todo";
import { TODO } from "@/app/todolist/Todo_T01";
import { useDroppable } from "@dnd-kit/core";
import { TextField } from "@mui/material";
import { useTodoStore } from "@/app/todolist/todoStore";
import ReportEditor from "@/app/components/ReportEditor";

/********************************************************************
  [컴포넌트 정보]
  TodoListBox
  status에 의해 구분되는 todoList 그룹
  자식(todoItem)들을 리스트화 한다.
 ********************************************************************/
/**************************************************
  스타일 정의
**************************************************/
const listBoxSx = {
  flexGrow: 1,
  backgroundColor: "#f5f5f5",
  border: "2px solid primary.main",
};

export default function TodoListBox({
  status,
  filteredList,
}: {
  status: string;
  filteredList: TODO[];
}) {
  /**************************************************
    변수, 상수 및 상태 정의
  **************************************************/
  const { report } = useTodoStore();
  const { setNodeRef } = useDroppable({
    id: status,
    data: { status: status, compType: "ListBox" },
  });
  const [draftReport, setDraftReport] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (status === "주간보고서") {
      setDraftReport(report?.memo);
    }
  }, [report]);

  /**************************************************
    EventHandler
  **************************************************/

  /**************************************************
    DOM 연결과 스타일 적용
  **************************************************/
  return (
    <Box id={status} ref={setNodeRef} sx={listBoxSx}>
      {status === "주간보고서" ? (
        <ReportEditor />
      ) : (
        filteredList.map((todo: TODO) => (
          <Todo key={todo.id} todo={todo} isOverlay={false} />
        ))
      )}
    </Box>
  );
}
