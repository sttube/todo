"use client";
import React from "react";

//MUI
import Box from "@mui/material/Box";
import { Button, Dialog, Stack, Typography } from "@mui/material";
import { useTodoStore } from "@/app/todolist/todoStore";

/********************************************************************
 [컴포넌트 정보]
 아이템 삭제를 위한 다이얼로그
 ********************************************************************/
export default ({
  open,
  onClose,
  todoId,
}: {
  open: boolean;
  onClose: () => void;
  todoId: string;
}) => {
  /**************************************************
   변수, 상수 및 상태 정의
   **************************************************/
  const { removeTodo } = useTodoStore();

  /**************************************************
   EventHandler
   **************************************************/
  // Calendar Open 핸들러

  /**************************************************
   Element 정의
   **************************************************/

  // 아이템 삭제 다이얼로그
  return (
    <Dialog open={open} onClose={onClose}>
      <Box
        sx={{
          width: "350px",
          height: "150px",
          p: 2,
        }}
      >
        <Stack direction="column" width="100%">
          <Typography variant="h6" sx={{ fontWeight: "700", mb: 1 }}>
            아이템 삭제
          </Typography>
          <Typography>아이템을 정말 삭제하시겠습니까?</Typography>
          <Stack
            direction="row"
            sx={{ width: "100%", pt: 2, justifyContent: "end" }}
          >
            <Button
              disableElevation
              sx={{
                border: (theme) => `2px solid ${theme.palette.grey[300]}`,
                backgroundColor: "grey.100",
                color: "black",
                fontWeight: "550",
                "&:hover": {
                  backgroundColor: "grey.200", // hover 시 darker grey
                },
                mr: 1,
              }}
              onClick={onClose}
            >
              취소
            </Button>
            <Button
              disableElevation
              sx={{
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
              onClick={() => removeTodo(todoId)}
            >
              삭제
            </Button>
          </Stack>
        </Stack>
      </Box>
    </Dialog>
  );
};
