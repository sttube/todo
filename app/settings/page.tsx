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

// custom
import Todo from '../components/Todo';
import { TODO } from '../components/Todo_t01';

const stageBoxSx = {
  p: '1 1 0 0',
  height: '100vh',
  border: '2px solid rgba(0, 0, 0, 0.12)'
};

const stageSx = {
  p: 1,
  height: 50,
  borderBottom: '2px solid rgba(0, 0, 0, 0.12)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

export default function Todolist() {
  const [maxId, setMaxId] = useState(0);
  const [todoList, setTodoList] = useState<TODO[]>([]);
  const [changeTypeList, setChangeTypeList] = useState({});
  const [inProg, setInProg] = useState();
  const [cplt, setCplt] = useState();
  const stage = ['settings', 'settings', 'settings', 'settings'];

  useEffect(() => {
    const getAllDocuments = async () => {
      try {
        // todoList 불러오기
        const qTodo = query(
          collection(fireStore, 'todo'),
          orderBy('ID', 'desc')
        );
        const querySnapshot = await getDocs(qTodo);
        const docs = querySnapshot.docs.map((doc) => ({
          ...doc.data()
        })) as TODO[];
        setTodoList(docs); // 상태에 문서 데이터 저장

        // 작업유형 불러오기
        const docChangeTypeRef = doc(fireStore, 'todo', 'changeType');
        const docSnapshot = await getDoc(docChangeTypeRef);
        if (docSnapshot.exists()) {
          setChangeTypeList(docSnapshot.data() as {});
        } else {
          console.error('작업유형을 불러오던 중 오류가 발생하였습니다.');
        }
      } catch (error) {
        console.error('Error getting documents:', error);
      }
    };

    getAllDocuments();
  }, []);

  useEffect(() => {
    setMaxId(todoList[0]?.ID === undefined ? 0 : Number(todoList[0].ID));
  }, [todoList]);

  const onClickAdd = async () => {
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

  return (
    <>
      <main>
        <Grid container spacing={2}>
          {stage ? (
            stage.map((item, index) => (
              <Grid key={item} size={{ lg: 3 }}>
                <Box
                  sx={{
                    ...stageBoxSx
                  }}
                >
                  <Box
                    sx={{
                      ...stageSx
                    }}
                  >
                    {stageIcon(item)}
                    <Typography sx={{ ml: 1 }}>{item}</Typography>
                  </Box>
                  <Box
                    data-state={item}
                    onDragOver={onDragOver}
                    onDrop={onDrop}
                    sx={{ height: '100vh' }}
                  >
                    {
                      todoList
                        .filter((todo) => todo.STATE === item)
                        .map((todo) => (
                          <Todo
                            key={todo.ID}
                            todo={todo}
                            setTodoList={setTodoList}
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
      </main>
      <footer>
        <Fab
          sx={{ position: 'fixed', bottom: 16, left: 16 }}
          color="primary"
          aria-label="add"
          onClick={onClickAdd}
        >
          <AddIcon />
        </Fab>
      </footer>
    </>
  );
}
