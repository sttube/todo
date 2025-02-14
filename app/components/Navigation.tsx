"use client";
import { Tab, Tabs, Typography } from "@mui/material";
import { usePathname, useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import React from "react";

export default function Navigation() {
  const router = useRouter();
  const pathname = usePathname();

  // 탭 변경 시 라우팅 처리
  const handleTabChange = (event: React.SyntheticEvent, newValue: any) => {
    router.push(newValue);
  };

  return (
    <Box
      sx={{
        mt: 1,
        display: "flex",
        alignItems: "center",
      }}
    >
      <Box sx={{ pl: 5 }}>
        <Typography
          variant="h6"
          sx={{ fontWeight: "bold", color: "primary.main" }}
        >
          TodoList
        </Typography>
      </Box>
      <Tabs
        value={pathname === "/" ? "/todolist" : pathname}
        onChange={handleTabChange}
        centered
        indicatorColor="primary"
        textColor="primary"
        sx={{ pl: 5 }}
      >
        <Tab
          label="Todo List"
          value="/todolist"
          sx={{
            fontWeight: pathname === "/todolist" ? "bold" : "normal",
          }}
        />
        <Tab
          label="Settings"
          value="/settings"
          sx={{
            fontWeight: pathname === "/settings" ? "bold" : "normal",
          }}
        />
      </Tabs>
      <Box></Box>
    </Box>
  );
}
