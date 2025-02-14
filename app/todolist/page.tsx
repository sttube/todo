"use client";
import React, { useEffect, useState } from "react";

// firestore
import {
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  collection,
  query,
  orderBy,
  writeBatch,
} from "firebase/firestore";
import fireStore from "../../firebase/firestore";

// MUI
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid2";
import { Fab, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import PlayCircleOutlineOutlinedIcon from "@mui/icons-material/PlayCircleOutlineOutlined";
import PauseCircleOutlineOutlinedIcon from "@mui/icons-material/PauseCircleOutlineOutlined";

// dnd-kit
import {
  DndContext,
  DragEndEvent,
  DragMoveEvent,
  DragOverlay,
  PointerSensor,
  rectIntersection,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { SortableContext } from "@dnd-kit/sortable";

// custom
import TodoListBox from "./TodoListBox";
import { TODO } from "./Todo_T01";
import Todo from "@/app/todolist/Todo";
import { useFocus } from "@/app/components/FocusContext";
import { useTodoStore } from "@/app/todolist/todoStore";

/********************************************************************
  [컴포넌트 정보]
  Todolist
    Page
    ↳ TodoListBox : status로 구분되는 그룹 박스
      ↳ Todo : todo 아이템
 ********************************************************************/

export default function Todolist() {
  /**************************************************
    변수, 상수 및 상태 정의
  **************************************************/
  // 작업유형 클릭여부
  type maxIdType = { [key: string]: number };
  const [maxStageId, setMaxStageId] = useState<maxIdType>({});
  const [statusList, setStatusList] = useState<string[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null); //드래그중인 아이템의 id
  const [overlayItem, setOverlayItem] = useState<TODO | undefined>(); //드래그중인 아이템 데이터
  const [pointerInitialY, setPointerInitialY] = useState<number>(0); // 드래그 시작시 마우스 초기위치
  const [deltaY, setDeltaY] = useState<number>(0); // 드래그중 마우스 이동 변위
  const { setFocusedId } = useFocus();
  const debounceDelay = Number(process.env.NEXT_PUBLIC_DEBOUNCE_DELAY); // 자동저장 주기(debounce)
  const {
    isEditing,
    todoList,
    updatedTodos,
    setIsEditing,
    setUpdatedTodos,
    initTodo,
    addTodo,
  } = useTodoStore();

  // 드래그를 위한 센서 설정
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // 드래그 시작 전에 5px 이동해야 활성화
      },
    }),
  );

  /**************************************************
    스타일 정의
  **************************************************/
  // to do 상태별 박스 스타일
  const statusBoxSx = {
    p: "1 1 0 0",
    border: "2px solid rgba(0, 0, 0, 0.12)",
    borderRadius: "5px",
    height: "100%",
    display: "flex",
    flexDirection: "column",

    "&::-webkit-scrollbar": {
      display: "none", // 웹킷 기반 브라우저에서 스크롤바 숨기기
    },
    msOverflowStyle: "none", // IE, Edge에서 스크롤바 숨기기
    scrollbarWidth: "none", // Firefox에서 스크롤바 숨기기
  };

  // to do 상태 타이틀 스타일
  const statusTitleSx = {
    p: 1,
    height: 50,
    flexShrink: 0,
    borderBottom: "2px solid rgba(0, 0, 0, 0.12)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  // to do 상태 타이틀에 들어갈 아이콘
  const statusIcon = (key: string) => {
    let icon;

    switch (key) {
      case "PENDING":
        icon = <PauseCircleOutlineOutlinedIcon />;
        break;
      case "IN_PROGRESS":
        icon = <PlayCircleOutlineOutlinedIcon sx={{ color: "#ffca28" }} />;
        break;
      case "COMPLETED":
        icon = <CheckCircleOutlineOutlinedIcon sx={{ color: "#00c853" }} />;
        break;
      default:
        icon = <FactCheckOutlinedIcon sx={{ color: "primary.main" }} />;
        break;
    }
    return icon;
  };
  /**************************************************
    useEffect
  **************************************************/
  useEffect(() => {
    console.log("start");
    // Status List 초기화
    if (process.env["NEXT_PUBLIC_STATUS_LIST"] !== undefined) {
      setStatusList(process.env["NEXT_PUBLIC_STATUS_LIST"]?.split(","));
    }

    // todoList와 todoTypeList 초기화
    // initTodo는 Unsubscribe 함수를 return한다. 이것을 cleanup으로 등록한다.
    const unsubscribe = initTodo();
    return () => {
      unsubscribe();
    };
  }, []);

  // to do상태(status)별 ord 업데이트
  useEffect(() => {
    if (todoList.length != 0) {
      setMaxStageId({
        PENDING:
          todoList.filter((todo) => todo.status === "PENDING")[0]?.ord ?? 0,
        IN_PROGRESS:
          todoList.filter((todo) => todo.status === "IN_PROGRESS")[0]?.ord ?? 0,
        COMPLETED:
          todoList.filter((todo) => todo.status === "COMPLETED")[0]?.ord ?? 0,
      });
    }
  }, [todoList]);

  // 마지막 수정 후 2초간 입력 없으면 저장
  useEffect(() => {
    if (isEditing && updatedTodos) {
      const timer = setTimeout(async () => {
        // 1) 배치 인스턴스 생성
        const batch = writeBatch(fireStore);

        // 2) updateTodos에 들어있는 to do만 작업등록
        updatedTodos.forEach((updatedTodo) => {
          const docRef = doc(
            fireStore,
            "todo",
            "userId_01",
            "todoItem",
            updatedTodo.id,
          );
          batch.update(docRef, updatedTodo);
        });

        // 3) 모든 작업대상 아이템을 등록한 후, 배치 커밋
        await batch.commit();

        setIsEditing(false); // 저장 완료 후 수정여부 상태 리셋
        setUpdatedTodos(undefined); // 저장 완료 후 업데이트리스트 리셋
      }, debounceDelay);

      return () => clearTimeout(timer); // 입력이 이어지면 이전 타이머 취소
    }
  }, [updatedTodos, isEditing]);

  /**************************************************
    EventHandler
  **************************************************/
  // 드래그 시작 시 activeId 설정
  const handleDragStart = (event: any) => {
    setActiveId(event.active.id);
    setOverlayItem(event.active.data.current.item);
    setFocusedId(event.active.id);

    const pointerEvent = event.activatorEvent as PointerEvent;
    setPointerInitialY(pointerEvent.clientY);
  };

  const handleDragging = (event: DragMoveEvent) => {
    setDeltaY(event.delta.y);
  };

  // 드래그가 끝났을 때 호출되는 콜백
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    // activeId 제거
    setActiveId(null);
    setOverlayItem(undefined);
    // 드롭 대상이 없으면 무시
    if (!active || !over) return;
    // 데이터 타입을 명시적으로 지정
    const activeData = active.data.current as
      | {
          compType: string;
          item: any;
          status: string;
        }
      | undefined;
    const overData = over.data.current as
      | {
          compType: string;
          item: any;
          status: string;
        }
      | undefined;

    if (!activeData || !overData) return;

    // 드래그 아이템과 드롭 영역의 데이터 추출
    const {
      compType: activeType,
      item: activeItem,
      status: activeStatus,
    } = activeData;
    const { compType: overType, item: overItem, status: overStatus } = overData;

    /*****************************************************************************
      아이템 순서를 재배열하는 헬퍼함수
      [1] 액티브 아이템의 status를 over아이템과 동일하게 바꾸고 ord는 newOrd로 변경한다.
      [2] newOrd보다 ord가 높은 item은 ord를 + 1 한다.
      [3] newOrd보다 ord가 낮은 item은 그대로 반환한다.
     *****************************************************************************/
    // 아이템들의 순서를 재배열하는 헬퍼 함수
    const reorderItems = (newOrd: number, list: TODO[]): TODO[] => {
      return list.map((item) => {
        if (item.id === activeItem.id) {
          return {
            ...item,
            ord: Math.ceil(newOrd),
            status: overStatus,
          };
        } else if (item.ord >= newOrd && item.status === overStatus) {
          return { ...item, ord: item.ord + 1 };
        } else {
          return {
            ...item,
          };
        }
      });
    };

    /****************************************************
      드롭 위치에 따른 newOrd 책정 헬퍼 함수
      [1] getNewOrdForEmptyGroup  : 드롭 위치의 status 그룹에 item이 하나도 없을 경우
      [2] getNewOrdForListBox     : ListBox 영역에 드롭하는 경우
      [3] getNewOrdForItem        : Item에 드롭하는 경우
     ****************************************************/

    const getNewOrdForEmptyGroup = (): number => {
      return maxStageId[overStatus] + 1;
    };

    const getNewOrdForListBox = (): number => {
      // status 그룹내의 아이템 ord를 1씩 증가시킨 임시배열
      const itemsToUpdate = todoList
        .filter((item) => item.status === overStatus)
        .map((item) => ({ ...item, ord: item.ord + 1 }));
      const lastItem = itemsToUpdate[itemsToUpdate.length - 1];
      // 임시배열의 가장 마지막 item(ord가 가장 낮은)의 원래 ord를 반환
      return lastItem ? lastItem.ord - 1 : maxStageId[overStatus] + 1;
    };

    const getNewOrdForItem = (): number | undefined => {
      // overItem의 DOM 요소를 찾기 위해 id 생성
      const overItemId = `${overItem.status}_${overItem.ord}`;
      const overElem = document.getElementById(overItemId);
      if (!overElem) return;
      const overRect = overElem.getBoundingClientRect();

      // 현재 포인터 Y 좌표 계산 (pointerInitialY와 deltaY는 전역 혹은 상위 scope에서 관리)
      const pointerCurrentY = pointerInitialY + deltaY;
      const overCenterY = overRect.top + overRect.height / 2;

      // 포인터의 좌표가 overItem의 중앙좌표보다 높은 경우
      if (pointerCurrentY < overCenterY) {
        return overItem.ord + 0.5;
      }
      // 포인터의 좌표가 overItem의 중앙좌표보다 낮은 경우
      else {
        return overItem.ord - 0.5;
      }
    };

    // 드롭위치에 따른 분기 함수
    const setNewOrd = () => {
      // [1] 드롭 위치의 status 그룹에 item이 하나도 없을 경우
      if (maxStageId[overStatus] === 0) {
        return getNewOrdForEmptyGroup();
      }
      // [2] ListBox 영역에 드롭하는 경우
      else if (overType === "ListBox") {
        return getNewOrdForListBox();
      }
      // [3] Item에 드롭하는 경우
      else if (overType === "Item") {
        return getNewOrdForItem();
      }
      return undefined;
    };

    const newOrd = setNewOrd();

    if (newOrd) {
      // 책정한 newOrd를 기준으로 todoList를 재정렬한다.
      const reOrderedList = reorderItems(newOrd, todoList);

      // batch에 update 작업 등록
      const batch = writeBatch(fireStore);
      reOrderedList.map((targtItem) => {
        const docRef = doc(
          fireStore,
          "todo",
          "userId_01",
          "todoItem",
          targtItem.id,
        );

        batch.update(docRef, targtItem);
      });

      // 마지막으로 배치 커밋
      await batch.commit();
    }
  };

  // 드래그 취소 시 activeId 초기화
  const handleDragCancel = () => {
    setActiveId(null);
    setOverlayItem(undefined);
  };

  const onClickAdd = async () => {
    addTodo();
  };

  /**************************************************
    Element 정의
  **************************************************/
  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={rectIntersection}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragMove={handleDragging}
        onDragCancel={handleDragCancel}
      >
        <SortableContext items={todoList.map((todo) => todo.id)}>
          <Grid container spacing={2} sx={{ height: "inherit" }}>
            {statusList ? (
              statusList.map((status) => (
                <Grid
                  key={status}
                  size={{ lg: 3, xs: 3 }}
                  sx={{ height: "100%" }}
                >
                  <Box
                    sx={{
                      ...statusBoxSx,
                    }}
                  >
                    <Box
                      sx={{
                        ...statusTitleSx,
                      }}
                    >
                      {statusIcon(status)}
                      <Typography sx={{ ml: 1 }}>{status}</Typography>
                    </Box>
                    <TodoListBox
                      status={status}
                      filteredList={todoList.filter(
                        (todo) => todo.status === status,
                      )}
                    />
                  </Box>
                </Grid>
              ))
            ) : (
              <></>
            )}
          </Grid>
        </SortableContext>

        {activeId && overlayItem ? (
          <DragOverlay dropAnimation={null}>
            <Todo todo={overlayItem} isOverlay={true} />
          </DragOverlay>
        ) : null}
      </DndContext>

      <Fab
        sx={{ position: "fixed", bottom: 16, left: 16 }}
        color="primary"
        aria-label="add"
        onClick={onClickAdd}
      >
        <AddIcon />
      </Fab>
    </>
  );
}
