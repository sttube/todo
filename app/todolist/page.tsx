'use client';
import React, { useEffect, useState } from 'react';

// firestore
import {
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  collection,
  query,
  orderBy,
  writeBatch
} from 'firebase/firestore';
import fireStore from '../../firebase/firestore';

// MUI
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid2';
import { Fab, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import PlayCircleOutlineOutlinedIcon from '@mui/icons-material/PlayCircleOutlineOutlined';
import PauseCircleOutlineOutlinedIcon from '@mui/icons-material/PauseCircleOutlineOutlined';

// dnd-kit
import {
  DndContext,
  DragEndEvent,
  DragMoveEvent,
  DragOverlay,
  PointerSensor,
  rectIntersection,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import { SortableContext } from '@dnd-kit/sortable';

// custom
import TodoListBox from './TodoListBox';
import { TODO } from './Todo_T01';
import Todo from '@/app/todolist/Todo';
import { useFocus } from '@/app/components/FocusContext';

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
  const [maxId, setMaxId] = useState(0);
  const [maxStageId, setMaxStageId] = useState({});
  const [todoList, setTodoList] = useState<TODO[]>([]);
  const [todoTypeList, setTodoTypeList] = useState([]);
  const [isEditing, setIsEditing] = useState(false); // 수정여부
  const [updateList, setUpdateList] = useState<string[]>([]); // 업데이트된 아이템 목록
  const [activeId, setActiveId] = useState<string | null>(null); //드래그중인 아이템의 id
  const [overlayItem, setOverlayItem] = useState<TODO>(); //드래그중인 아이템 데이터
  const [pointerInitialY, setPointerInitialY] = useState<number>(0); // 드래그 시작시 마우스 초기위치
  const [deltaY, setDeltaY] = useState<number>(0); // 드래그중 마우스 이동 변위
  const { focusedId, setFocusedId } = useFocus();
  const statusList = process.env.NEXT_PUBLIC_STATUS_LIST.split(','); // status 목록
  const debounceDelay = Number(process.env.NEXT_PUBLIC_DEBOUNCE_DELAY); // 자동저장 주기(debounce)

  // 드래그를 위한 센서 설정
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5 // 드래그 시작 전에 5px 이동해야 활성화
      }
    })
  );

  /**************************************************
    스타일 정의
  **************************************************/
  // todo상태별 박스 스타일
  const statusBoxSx = {
    p: '1 1 0 0',
    border: '2px solid rgba(0, 0, 0, 0.12)',
    borderRadius: '5px',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',

    '&::-webkit-scrollbar': {
      display: 'none' // 웹킷 기반 브라우저에서 스크롤바 숨기기
    },
    msOverflowStyle: 'none', // IE, Edge에서 스크롤바 숨기기
    scrollbarWidth: 'none' // Firefox에서 스크롤바 숨기기
  };

  // todo상태 타이틀 스타일
  const statusTitleSx = {
    p: 1,
    height: 50,
    flexShrink: 0,
    borderBottom: '2px solid rgba(0, 0, 0, 0.12)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  // todo상태 타이틀에 들어갈 아이콘
  const statusIcon = (key) => {
    let icon;

    switch (key) {
      case 'PENDING':
        icon = <PauseCircleOutlineOutlinedIcon />;
        break;
      case 'IN_PROGRESS':
        icon = <PlayCircleOutlineOutlinedIcon sx={{ color: '#ffca28' }} />;
        break;
      case 'COMPLETED':
        icon = <CheckCircleOutlineOutlinedIcon sx={{ color: '#00c853' }} />;
        break;
      default:
        icon = <FactCheckOutlinedIcon sx={{ color: 'primary.main' }} />;
        break;
    }
    return icon;
  };
  /**************************************************
    useEffect
  **************************************************/
  useEffect(() => {
    // 작업유형 불러오기
    // getDoc은 Promise를 반환한다. 따라서 async/await을 사용하고 후처리가 불필요하므로 void 처리한다.
    (async () => {
      const todoTypeRef = doc(fireStore, 'todo', 'todoType');
      const todoTypeDoc = await getDoc(todoTypeRef);

      if (todoTypeDoc.exists()) {
        setTodoTypeList(
          todoTypeDoc.data()?.typeItem.sort((a, b) => b.ord - a.ord) //ord순 정렬
        );
      }
    })();

    // 문서를 구독하여 문서 업데이트시 snapshot을 자동으로 동기화되도록 한다.
    // onSnapshot은 unsubscribe(구독해제) 함수를 반환한다. 이것을 useEffect의 cleanup으로 return한다.
    const todoQuery = query(
      collection(fireStore, 'todo', 'userId_01', 'todoItem'),
      orderBy('ord', 'desc')
    );

    const unsubscribe = onSnapshot(todoQuery, (snapshot) => {
      if (!snapshot.empty) {
        const newTodoList = snapshot.docs.map((doc) => doc.data()) as TODO[];
        setTodoList(newTodoList);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // todo상태(status)별 ord 업데이트
  useEffect(() => {
    if (todoList.length != 0) {
      setMaxId(Number(todoList[0].id));

      setMaxStageId({
        PENDING:
          todoList.filter((todo) => todo.status === 'PENDING')[0]?.ord ?? 0,
        IN_PROGRESS:
          todoList.filter((todo) => todo.status === 'IN_PROGRESS')[0]?.ord ?? 0,
        COMPLETED:
          todoList.filter((todo) => todo.status === 'COMPLETED')[0]?.ord ?? 0
      });
    }
  }, [todoList]);

  useEffect(() => {
    console.log(maxStageId);
  }, [maxStageId]);

  // 마지막 수정 후 2초간 입력 없으면 저장
  useEffect(() => {
    if (isEditing && updateList) {
      const timer = setTimeout(async () => {
        // 1) 배치 인스턴스 생성
        const batch = writeBatch(fireStore);

        // updateList에 들어있는 todo만 작업등록
        matchById(todoList, updateList).map((targtItem) => {
          const docRef = doc(
            fireStore,
            'todo',
            'userId_01',
            'todoItem',
            targtItem.id
          );
          // batch에 update 작업 등록
          batch.update(docRef, targtItem);
        });

        // 3) 모든 작업대상 아이템을 등록한 후, 배치 커밋
        await batch.commit();

        setIsEditing(false); // 저장 완료 후 수정여부 상태 리셋
        setUpdateList([]); // 저장 완료 후 업데이트리스트 리셋
      }, debounceDelay);

      return () => clearTimeout(timer); // 입력이 이어지면 이전 타이머 취소
    }
  }, [updateList, isEditing]);

  // id 배열 리스트에 해당하는 todoList 반환
  // list : 탐색할 전체 목록
  // targetIdList : 탐색을 원하는 id
  const matchById = (list: TODO[], targetIdList: string[]) => {
    const uniqueList = [...new Set(targetIdList)];
    const matchList = uniqueList.reduce<TODO[]>((matchList, id) => {
      const match = list.find((todo) => todo.id === id);
      if (match) {
        matchList.push(match);
      }
      return matchList;
    }, [] as TODO[]);

    console.log(matchList);
    return matchList;
  };

  /**************************************************
    EventHandler
  **************************************************/
  // 드래그 시작 시 activeId 설정
  const handleDragStart = (event: any) => {
    setActiveId(event.active.id);
    setOverlayItem(event.active.data.current.item);
    console.log('dragstart');
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
    setOverlayItem(null);
    // 드롭 대상이 없으면 무시
    if (!over) return;

    // 드래그 아이템과 드롭 영역의 데이터 추출
    const {
      compType: activeType,
      item: activeItem,
      status: activeStatus
    } = active.data.current;
    const {
      compType: overType,
      item: overItem,
      status: overStatus
    } = over.data.current;

    /*****************************************************************************
      아이템 순서를 재배열하는 헬퍼함수
      [1] 액티브 아이템의 status를 over아이템과 동일하게 바꾸고 ord는 newOrd로 변경한다.
      [2] newOrd보다 ord가 높은 item은 ord를 + 1 한다.
      [3] newOrd보다 ord가 낮은 item은 그대로 반환한다.
     *****************************************************************************/
    // 아이템들의 순서를 재배열하는 헬퍼 함수
    const reorderItems = (newOrd: number, list: TODO[]): TODO[] => {
      console.log('newOrd : ', newOrd);
      return list.map((item) => {
        if (item.id === activeItem.id) {
          return {
            ...item,
            ord: Math.ceil(newOrd),
            status: overStatus
          };
        } else if (item.ord >= newOrd && item.status === overStatus) {
          return { ...item, ord: item.ord + 1 };
        } else {
          return {
            ...item
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
        console.log('Item drop: insert above');
        return overItem.ord + 0.5;
      }
      // 포인터의 좌표가 overItem의 중앙좌표보다 낮은 경우
      else {
        console.log('Item drop: insert below');
        return overItem.ord - 0.5;
      }
    };

    // 드롭위치에 따른 분기 함수
    const setNewOrd = () => {
      // [1] 드롭 위치의 status 그룹에 item이 하나도 없을 경우
      if (maxStageId[overStatus] === 0) {
        console.log('Drop : No Item');
        return getNewOrdForEmptyGroup();
      }
      // [2] ListBox 영역에 드롭하는 경우
      else if (overType === 'ListBox') {
        console.log('Drop : ListBox');
        return getNewOrdForListBox();
      }
      // [3] Item에 드롭하는 경우
      else if (overType === 'Item') {
        console.log('Drop : Item');
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
          'todo',
          'userId_01',
          'todoItem',
          targtItem.id
        );

        batch.update(docRef, targtItem);
      });

      // 마지막으로 배치 커밋
      await batch.commit();
    }
  };

  // 드래그 취소 시 activeId 초기화
  const handleDragCancel = () => {
    console.log('Drag cancle');
    setActiveId(null);
    setOverlayItem(null);
  };

  const onClickAdd = async () => {
    try {
      const todoRef = doc(
        fireStore,
        'todo',
        'userId_01',
        'todoItem',
        String(maxId + 1)
      );

      const addItem = {
        id: String(maxId + 1),
        status: 'PENDING',
        title: String(maxId + 1),
        ord: maxStageId['PENDING'] + 1
      } as TODO;

      await setDoc(
        todoRef,
        {
          ...addItem
        },
        { merge: true }
      );

      setMaxId(maxId + 1);
    } catch (error) {
      console.error('Todo 아이템 추가 도중 오류가 발생했습니다.\n', error);
    }
  };

  //
  const handlePageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // setFocusedId(null);
  };

  /**************************************************
    Element 정의
  **************************************************/
  const todoProps = {
    todoList: todoList,
    todoTypeList: todoTypeList,
    setTodoList: setTodoList,
    setUpdateList: setUpdateList,
    setIsEditing: setIsEditing,
    focusedId: focusedId,
    setFocusedId: setFocusedId
  };

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
          <Grid
            container
            spacing={2}
            sx={{ height: 'inherit' }}
            // onMouseDown={handlePageClick}
          >
            {statusList ? (
              statusList.map((status) => (
                <Grid key={status} size={{ lg: 3 }} sx={{ height: '100%' }}>
                  <Box
                    sx={{
                      ...statusBoxSx
                    }}
                  >
                    <Box
                      sx={{
                        ...statusTitleSx
                      }}
                    >
                      {statusIcon(status)}
                      <Typography sx={{ ml: 1 }}>{status}</Typography>
                    </Box>
                    <TodoListBox
                      status={status}
                      filteredList={todoList.filter(
                        (todo) => todo.status === status
                      )}
                      todoProps={todoProps}
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
          <DragOverlay dropAnimation={false} renderInPortal={true}>
            <Todo todo={overlayItem} isOverlay={true} {...todoProps} />
          </DragOverlay>
        ) : null}
      </DndContext>

      <Fab
        sx={{ position: 'fixed', bottom: 16, left: 16 }}
        color="primary"
        aria-label="add"
        onClick={onClickAdd}
      >
        <AddIcon />
      </Fab>
    </>
  );
}
