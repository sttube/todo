'use client';
import React, { useEffect, useState } from 'react';
import {
  doc,
  setDoc,
  CollectionReference,
  updateDoc,
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

// custom
import TodoListBox from './TodoListBox';
import { TODO } from './Todo_T01';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  rectIntersection,
  useSensor,
  useSensors
} from '@dnd-kit/core';

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
  const statusList = process.env.NEXT_PUBLIC_STATUS_LIST.split(',');
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
    overflow: 'auto',

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
  };

  // 드래그가 끝났을 때 호출되는 콜백
  const handleDragEnd = async (event) => {
    const { active, over } = event;
    const activeType = active.data.current.compType; // 드래그아이템의 타입
    const activeStatus = active.data.current.status; // 드래그아이템의 status
    const overType = over.data.current.compType; // 드롭영역 아이템의 타입
    const overStatus = over.data.current.status; // 드롭영역 아이템의 status
    const draggedItem = todoList.find((item) => item.id === active.id);

    let reOrderedList: TODO[];

    if (!over) {
      setActiveId(null);
      return;
    } // 드롭 대상이 없으면 무시

    if (activeStatus !== overStatus) {
      console.log(1);
      console.log(over);
      console.log(overType);
      if (maxStageId[overStatus] === 0) {
        console.log('maxOrd 0');
        reOrderedList = [
          {
            ...draggedItem,
            status: overStatus,
            ord: maxStageId[overStatus] + 1
          } as TODO
        ];
      } else if (overType === 'Box') {
        console.log('box');
        reOrderedList = todoList
          .filter((item) => item.status === overStatus)
          .reduce<TODO[]>((list, todo) => {
            list.push({
              ...todo,
              ord: todo.ord + 1
            });
            return list;
          }, [] as TODO[]);

        const reOrderedListLength = reOrderedList.length;
        const addOrd = reOrderedList[reOrderedListLength - 1].ord - 1;
        reOrderedList.push({
          ...draggedItem!,
          status: overStatus,
          ord: addOrd
        });

        console.log(reOrderedList);
      }
    } else if (overType !== 'Box' && active.id !== over.id) {
      // 배열 상태에서 active.id, over.id의 위치를 swap
      // 1) 드래그된 아이템과 드롭 대상 아이템 찾기
      console.log('over : ', over);
      if (maxStageId[over.data.current.status] === 0) {
        const draggedItem = todoList.find((item) => item.id === active.id);
        reOrderedList = [
          {
            ...draggedItem,
            status: over.data.current.status,
            ord: maxStageId[over.data.current.status] + 1
          } as TODO
        ];
      } else {
        const draggedIndex = todoList.findIndex(
          (item) => item.id === active.id
        );
        const overIndex = todoList.findIndex((item) => item.id === over.id);

        const draggedItem = todoList[draggedIndex];
        const overItem = todoList[overIndex];

        const oldOrd = draggedItem.ord;
        const newOrd = overItem.ord;

        // 상태가 다른 경우 상태 업데이트
        if (active.data.current.status !== over.data.current.status) {
          draggedItem.status = over.data.current.status;
        }

        // 2) 각 아이템 ord 조정
        reOrderedList = todoList.map((item) => {
          // (a) 드래그된 아이템 ord는 drop 대상 아이템(ord)로 바뀜
          if (item.id === draggedItem.id) {
            return { ...item, ord: newOrd };
          }

          // (b) oldOrd < newOrd 인 경우: (oldOrd, newOrd] → -1
          if (oldOrd < newOrd) {
            if (item.ord > oldOrd && item.ord <= newOrd) {
              return { ...item, ord: item.ord - 1 };
            }
          }

          // (c) oldOrd > newOrd 인 경우: [newOrd, oldOrd) → +1
          if (oldOrd > newOrd) {
            if (item.ord >= newOrd && item.ord < oldOrd) {
              return { ...item, ord: item.ord + 1 };
            }
          }

          // 그 외의 아이템은 변경 없음
          return item;
        });
      }

      const batch = writeBatch(fireStore);

      // updateList에 들어있는 todo만 작업등록
      // matchById(reOrderedList, [active.id, over.id]).map((targtItem) => {
      reOrderedList.map((targtItem) => {
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
      setActiveId(null);
    }
  };

  // 드래그 취소 시 activeId 초기화
  const handleDragCancel = () => {
    console.log('cancle');
    setActiveId(null);
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

  // Drag - onDrop 이벤트
  const onDrop = async (dropItem: TODO, state: string) => {
    // TodoList의 STATE 변경
    setTodoList((prevList) =>
      prevList.map((item) => {
        if (item.id === dropItem.id) {
          return { ...dropItem, status: state };
        } else {
          return item;
        }
      })
    );

    // 변경내용 저장
    const itemRef = doc(fireStore, 'todo', 'userId_01');
    await updateDoc(itemRef, {
      [dropItem.id]: { ...dropItem, STATE: state }
    } as CollectionReference<string>);
  };

  /**************************************************
    Element 정의
  **************************************************/
  const todoProps = {
    todoList: todoList,
    setTodoList: setTodoList,
    setUpdateList: setUpdateList,
    setIsEditing: setIsEditing,
    todoTypeList: todoTypeList,
    onDrop: onDrop
  };

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={rectIntersection}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <Grid
          container
          spacing={2}
          sx={{ height: 'inherit', overflow: 'hidden' }}
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
      </DndContext>
      <DragOverlay>
        {activeId ? (
          <Box
            component="div"
            sx={{
              background: '#fff',
              boxShadow: '0 0 5px rgba(0,0,0,0.3)',
              padding: 1,
              borderRadius: 1,
              cursor: 'grabbing'
            }}
          >
            {todoList.find((todo) => todo.id === activeId)?.id + ' : id'}
          </Box>
        ) : null}
      </DragOverlay>
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
