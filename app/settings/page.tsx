'use client';
import React, { useEffect, useState } from 'react';
import {
  collection,
  doc,
  setDoc,
  getDocs,
  orderBy,
  query,
  CollectionReference,
  updateDoc
} from 'firebase/firestore';
import fireStore from '../../firebase/firestore';

// MUI
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid2';
import { Button, Typography } from '@mui/material';
import CheckCircleTwoToneIcon from '@mui/icons-material/CheckCircleTwoTone';
import PlayCircleFilledTwoToneIcon from '@mui/icons-material/PlayCircleFilledTwoTone';
import PauseCircleFilledTwoToneIcon from '@mui/icons-material/PauseCircleFilledTwoTone';
import PostAddIcon from '@mui/icons-material/PostAdd';

// custom
import Todo from '../components/Todo';
import { TODO } from '../components/Todo_t01';

const stage = {
  p: 2,
  border: '1px dashed grey',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

export default function Settings() {
  const [maxId, setMaxId] = useState(0);
  const [todoList, setTodoList] = useState<TODO[]>([]);
  const [inProg, setInProg] = useState();
  const [cplt, setCplt] = useState();

  useEffect(() => {
    const getAllDocuments = async () => {
      try {
        const q = query(collection(fireStore, 'todo'), orderBy('ID', 'desc'));
        const querySnapshot = await getDocs(q);
        const docs = querySnapshot.docs.map((doc) => ({
          ...doc.data()
        })) as TODO[];
        console.log('init : ', docs.length);
        setTodoList(docs); // 상태에 문서 데이터 저장
      } catch (error) {
        console.error('Error getting documents:', error);
      }
    };

    getAllDocuments();
  }, []);

  useEffect(() => {
    setMaxId(todoList[0]?.ID === undefined ? 0 : Number(todoList[0].ID));
  }, [todoList]);

  const onClickStage = async () => {
    try {
      setMaxId(maxId + 1);
      const addItem = {
        ID: String(maxId + 1),
        STATE: '대기',
        TITLE: ''
      } as TODO;
      await setDoc(doc(fireStore, 'todo/todo_item_' + String(maxId + 1)), {
        ...addItem
      } as CollectionReference<string>);

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

    setTodoList(
      todoList.map((item) =>
        item.ID === id ? { ...item, STATE: state } : item
      )
    );
    const itemRef = doc(fireStore, 'todo', 'todo_item_' + id);
    await updateDoc(itemRef, {
      STATE: state
    } as CollectionReference<string>);
  };

  return (
    <>
      <main>
        <Box>
          <Grid container spacing={2}>
            <Grid size={{ lg: 3 }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
              >
                <Box
                  component="section"
                  sx={{
                    ...stage,
                    width: '100%'
                  }}
                >
                  <PauseCircleFilledTwoToneIcon sx={{ color: 'blue' }} />
                  <Typography>환경설정</Typography>
                </Box>
                <PostAddIcon
                  color="action"
                  sx={{
                    fontSize: 40,
                    '&:hover': {
                      cursor: 'pointer' // 마우스 오버 시 포인터 변경
                    }
                  }}
                  onClick={(event) => onClickStage()}
                />
              </Box>
              <Box
                data-state="대기"
                sx={{ height: '100vh' }}
                onDragOver={onDragOver}
                onDrop={onDrop}
              >
                {
                  todoList
                    .filter((item) => item.STATE === '대기')
                    .map((item) => (
                      <Todo
                        key={item.ID}
                        todo={item}
                        setTodoList={setTodoList}
                      />
                    )) as React.ReactNode
                }
              </Box>
            </Grid>
            <Grid size={{ lg: 3 }}>
              <Box
                component="section"
                sx={{
                  ...stage
                }}
              >
                <PlayCircleFilledTwoToneIcon sx={{ color: '#fb8c00' }} />
                <Typography>진행중</Typography>
              </Box>
              <Box
                data-state="진행중"
                sx={{ height: '100vh' }}
                onDragOver={onDragOver}
                onDrop={onDrop}
              >
                {
                  todoList
                    .filter((item) => item.STATE === '진행중')
                    .map((item) => (
                      <Todo
                        key={item.ID}
                        todo={item}
                        setTodoList={setTodoList}
                      />
                    )) as React.ReactNode
                }
              </Box>
            </Grid>
            <Grid size={{ lg: 3 }}>
              <Box
                component="section"
                sx={{
                  ...stage
                }}
              >
                <CheckCircleTwoToneIcon sx={{ color: '#00c853' }} />
                <Typography>완료</Typography>
              </Box>
              <Box
                data-state="완료"
                sx={{ height: '100vh' }}
                onDragOver={onDragOver}
                onDrop={onDrop}
              >
                {
                  todoList
                    .filter((item) => item.STATE === '완료')
                    .map((item) => (
                      <Todo
                        key={item.ID}
                        todo={item}
                        setTodoList={setTodoList}
                      />
                    )) as React.ReactNode
                }
              </Box>
            </Grid>
            <Grid size={{ lg: 3 }}>
              <Box component="section" sx={stage}>
                주간보고서
              </Box>
              <Box
                sx={{ height: '100vh' }}
                onDragOver={onDragOver}
                onDrop={onDrop}
              >
                {
                  todoList
                    .filter((item) => item.STATE === '주간보고서')
                    .map((item) => (
                      <Todo
                        key={item.ID}
                        todo={item}
                        setTodoList={setTodoList}
                      />
                    )) as React.ReactNode
                }
              </Box>
            </Grid>
          </Grid>
        </Box>
      </main>
      <footer></footer>
    </>
  );
}
