'use client';
import React, { useEffect, useState } from 'react';
import {
  doc,
  setDoc,
  CollectionReference,
  updateDoc,
  getDoc
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

import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

// custom
import Todo from '../components/Todo';
import { TODO } from '../components/Todo_t01';

export default function Todolist() {
  /**************************************************
    변수, 상수 및 상태 정의
  **************************************************/
  const [maxId, setMaxId] = useState(0);
  const [maxStageId, setMaxStageId] = useState([0, 0, 0]);
  const [todoList, setTodoList] = useState([]);
  const [oldTodo, setOldTodo] = useState<TODO[]>([]);
  const [changeTypeList, setChangeTypeList] = useState({});
  const [isEditing, setIsEditing] = useState(false); // 수정여부
  const [updateList, setUpdateList] = useState({}); // 수정여부
  const [inProg, setInProg] = useState();
  const [cplt, setCplt] = useState();
  const stage = ['대기', '진행중', '완료', '주간보고서'];
  const SAVE_DELAY = 5000; // 저장딜레이

  /**************************************************
    스타일 정의
  **************************************************/
  const stageBoxSx = {
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

  const stageTitleSx = {
    p: 1,
    height: 50,
    flexShrink: 0,
    borderBottom: '2px solid rgba(0, 0, 0, 0.12)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  const listBoxSx = {
    height: '100%',
    flexGrow: 1
  };

  const stageIcon = (key) => {
    let icon;

    switch (key) {
      case '대기':
        icon = <PauseCircleOutlineOutlinedIcon />;
        break;
      case '진행중':
        icon = <PlayCircleOutlineOutlinedIcon sx={{ color: '#ffca28' }} />;
        break;
      case '완료':
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
    const getAllDocuments = async () => {
      try {
        // todoList 불러오기
        const qTodo = doc(fireStore, 'todo', 'userId_01');
        const todoSnapshot = await getDoc(qTodo);

        if (todoSnapshot.exists()) {
          setTodoList(
            Object.values(todoSnapshot.data() as {}).sort((a, b) =>
              b.ID.localeCompare(a.ID)
            )
          );
        } else {
          console.error('Todo 데이터가 없습니다.');
        }

        // 작업유형 불러오기
        const docChangeTypeRef = doc(fireStore, 'todo', 'changeType');
        const docSnapshot = await getDoc(docChangeTypeRef);
        if (docSnapshot.exists()) {
          setChangeTypeList(docSnapshot.data() as {});
        } else {
          console.error('작업유형 데이터가 없습니다.');
        }
      } catch (error) {
        console.error('Error getting documents:', error);
      }
    };

    getAllDocuments();
  }, []);

  useEffect(() => {
    if (todoList.length !== 0) {
      setMaxId(Number(todoList[0].ID));
      setMaxStageId([
        todoList.filter((todo) => todo.STATE === '대기')[0]?.STAGE_ID || 0,
        todoList.filter((todo) => todo.STATE === '진행중')[0]?.STAGE_ID || 0,
        todoList.filter((todo) => todo.STATE === '완료')[0]?.STAGE_ID || 0
      ]);
    }
  }, [todoList]);

  useEffect(() => {
    console.log(maxStageId);
  }, [maxStageId]);

  // 마지막 수정 후 5초간 입력 없으면 저장
  useEffect(() => {
    if (isEditing) {
      const timer = setTimeout(async () => {
        const itemRef = doc(fireStore, 'todo', 'userId_01');
        await updateDoc(itemRef, {
          ...updateList
        } as CollectionReference<string>);
        setIsEditing(false); // 저장 완료 후 수정여부 상태 리셋
      }, SAVE_DELAY);

      return () => clearTimeout(timer); // 입력이 이어지면 이전 타이머 취소
    }
  }, [updateList, isEditing]);

  useEffect(() => {
    console.log(updateList || 'null');
  }, [updateList]);

  /**************************************************
    EventHandler
  **************************************************/
  // const onUpdate = () => {
  //   setUpdateList((prevList) => ({
  //     ...prevList,
  //     [todo.ID]: todo
  //   }));
  //   setIsEditing(true);
  // };

  const onClickAdd = async () => {
    console.log(maxStageId[0]);
    try {
      setMaxId(maxId + 1);
      const userRef = doc(fireStore, 'todo', 'userId_01');
      const todoRef = doc(fireStore, 'todo', 'userId_01');
      const addItem = {
        ID: String(maxId + 1),
        STATE: '대기',
        TITLE: String(maxId + 1),
        STAGE_ID: String(Number(maxStageId[0]) + 1)
      } as TODO;
      await setDoc(
        todoRef,
        {
          [String(maxId + 1)]: addItem
        },
        { merge: true }
      );

      setTodoList([addItem, ...todoList]);
    } catch (error) {
      console.error('Todo 아이템 추가 도중 오류가 발생했습니다.\n', error);
    }
  };

  const onDragStart = (e: React.DragEvent) => {
    const itemId = e.currentTarget.id;
    e.dataTransfer.setData('text', itemId);
    console.log('itemId : ', itemId);
  };
  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    console.log('123');
  };
  const onDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const state = e.currentTarget.getAttribute('data-state');
    const id = e.dataTransfer.getData('text');
    let targetItem = {};

    setTodoList((prevList) =>
      prevList.map((item) => {
        if (item.ID === id) {
          targetItem = { ...item, STATE: state };
          return targetItem;
        } else {
          return item;
        }
      })
    );

    const itemRef = doc(fireStore, 'todo', 'userId_01');
    await updateDoc(itemRef, {
      [id]: { ...targetItem }
    } as CollectionReference<string>);
  };

  return (
    <>
      <Grid
        container
        spacing={2}
        sx={{ height: 'inherit', overflow: 'hidden' }}
      >
        {stage ? (
          stage.map((item, index) => (
            <Grid key={item} size={{ lg: 3 }} sx={{ height: '100%' }}>
              <Box
                sx={{
                  ...stageBoxSx
                }}
              >
                <Box
                  sx={{
                    ...stageTitleSx
                  }}
                >
                  {stageIcon(item)}
                  <Typography sx={{ ml: 1 }}>{item}</Typography>
                </Box>
                <Box
                  data-state={item}
                  onDragOver={onDragOver}
                  onDrop={onDrop}
                  sx={{
                    ...listBoxSx
                  }}
                >
                  {
                    todoList
                      .filter((todo) => todo.STATE === item)
                      .map((todo) => (
                        <Todo
                          key={todo.ID}
                          todo={todo}
                          setTodoList={setTodoList}
                          setUpdateList={setUpdateList}
                          setIsEditing={setIsEditing}
                          changeTypeList={changeTypeList}
                        />
                      )) as React.ReactNode
                  }
                </Box>
              </Box>
            </Grid>
          ))
        ) : (
          <></>
        )}
      </Grid>
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
