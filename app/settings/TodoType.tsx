'use client';
import React, { useEffect, useRef, useState } from 'react';

// MUI
import Box from '@mui/material/Box';
import AddIcon from '@mui/icons-material/Add';

import { IconButton, Stack, TextField, Typography } from '@mui/material';
import { doc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';
import fireStore from '@/firebase/firestore';
import { useDrop } from 'react-dnd';

import TypeItem from './TypeItem';
import firebase from 'firebase/compat';
import DocumentReference = firebase.firestore.DocumentReference;

import { TYPE_ITEM } from './Settings_T01';
import RemoveIcon from '@mui/icons-material/Remove';

export default function TodoType() {
  /**************************************************
    변수, 상수 및 상태 정의
  **************************************************/
  const [todoTypeList, setTodoTypeList] = useState<TYPE_ITEM[]>([]);
  const [addChangeType, setAddChangeType] = useState('');
  const [maxId, setMaxId] = useState(0);
  const [maxOrd, setMaxOrd] = useState(0);
  const parentRef = useRef(null);

  const [, drop] = useDrop(() => ({
    accept: 'BOX', // 드롭 허용되는 아이템 타입
    drop: (item) => {
      console.log('drop : ', item);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver()
    })
  }));

  // dropRef는 useDrop에서 반환된 콜백형 ref이며 이를 Box의 ref로 전달
  const dropRef = useRef(null);
  React.useEffect(() => {
    drop(dropRef.current); // dropRef를 dropTargetRef에 연결
  }, [drop]);

  /**************************************************
      useEffect
   **************************************************/
  useEffect(() => {
    // 작업유형 불러오기
    // 문서를 구독하여 문서 업데이트시 snapshot을 자동으로 동기화되도록 한다.
    // onSnapshot은 unsubscribe(구독해제) 함수를 반환한다. 이것을 useEffect의 cleanup으로 return한다.
    const typeRef = doc(fireStore, 'todo', 'changeType');
    return onSnapshot(typeRef, (snapshot) => {
      if (snapshot.exists()) {
        // ord순으로 정렬하고 ChangeTypeList에 저장한다.
        setTodoTypeList(
          snapshot.data()?.typeItem.sort((a, b) => b.ord - a.ord) || []
        );
      } else {
        console.error('작업유형 데이터가 없습니다.');
      }
    });
  }, []);

  useEffect(() => {
    // 작업유형의 maxId와 maxOrd 설정
    const maxId = todoTypeList.reduce(
      (max, item) => (Number(item.id) > max ? Number(item.id) : max),
      0
    );
    const maxOrd = todoTypeList.reduce(
      (max, item) => (Number(item.ord) > max ? Number(item.ord) : max),
      0
    );
    setMaxId(maxId);
    setMaxOrd(maxOrd);
    console.log(todoTypeList);
  }, [todoTypeList]);

  /**************************************************
    EventHandler
  **************************************************/
  // 드래그 중인 아이템(fromOrd)을 hover하고 있는 아이템(toOrd) 위치로 이동
  const moveItem = (fromOrd: number, toOrd: number) => {
    let fromIndex: number | undefined;
    let toIndex: number | undefined;

    const orderedList = todoTypeList.map((item, index) => {
      // fromOrd와 toOrd의 ord를 서로 교환한다.
      if (item.ord === fromOrd) {
        fromIndex = index;
        return { ...item, ord: toOrd };
      }
      if (item.ord === toOrd) {
        toIndex = index;
        return { ...item, ord: fromOrd };
      }
      return item;
    });

    // 인덱스를 찾았다면 두 아이템 위치 교환
    if (fromIndex !== undefined && toIndex !== undefined) {
      const fromItem = orderedList[fromIndex];
      orderedList[fromIndex] = orderedList[toIndex];
      orderedList[toIndex] = fromItem;
    } else {
      console.error('해당하는 ord 값이 배열에 없습니다.');
      return;
    }

    setTodoTypeList(orderedList);
  };

  const handleReorderItem = async () => {
    const typeRef = doc(fireStore, 'todo', 'changeType');
    try {
      await updateDoc(typeRef, {
        typeItem: todoTypeList
      } as DocumentReference<TYPE_ITEM[]>); // typeItem배열에서 removeItem을 제거한다.
      // setChangeTypeList(removedList);
    } catch (error) {
      console.log(
        '작업유형 아이템의 순서를 변경하는 과정에서 오류가 발생하였습니다.'
      );
    }
  };

  // 작업유형 추가버튼 클릭 이벤트
  const handleClickAddButton = async () => {
    if (addChangeType !== '') {
      const typeRef = doc(fireStore, 'todo', 'changeType');
      await setDoc(
        typeRef,
        {
          typeItem: [
            ...todoTypeList,
            { id: maxId + 1, typeName: addChangeType, ord: maxOrd + 1 }
          ]
        },
        { merge: true }
      );

      // 추가 텍스트필드 비우기
      setAddChangeType('');
    }
  };

  // 작업유형 제거버튼 클릭 이벤트
  const handleClickRemoveButton = async (delKey: number) => {
    // 제거할 아이템을 제외한 list를 만든다.
    const removedList: TYPE_ITEM[] = todoTypeList.filter(
      (item) => item.id !== delKey
    );
    const typeRef = doc(fireStore, 'todo', 'changeType');
    try {
      await updateDoc(typeRef, {
        typeItem: removedList
      } as DocumentReference<TYPE_ITEM[]>); // typeItem배열에서 removeItem을 제거한다.
      // setChangeTypeList(removedList);
    } catch (error) {
      console.log('작업유형 아이템을 제거하는 과정에서 오류가 발생하였습니다.');
    }
  };

  const handleOnChange = (id: number, typeName: string) => {
    setTodoTypeList((prevList) =>
      prevList.map((item) => {
        if (item.id === id) {
          return { ...item, typeName: typeName };
        } else {
          return item;
        }
      })
    );
  };

  /**************************************************
      Element 정의
    **************************************************/

  return (
    <Stack direction="row" sx={{ p: '10px' }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          width: '150px'
        }}
      >
        <Typography sx={{ fontWeight: 'bold' }}>작업유형</Typography>
      </Box>
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', m: 1 }}>
          <TextField
            id="addItem"
            size="small"
            variant="outlined"
            value={addChangeType}
            sx={{ width: '200px' }}
            onChange={(e) => setAddChangeType(e.target.value)}
          />
          <IconButton onClick={handleClickAddButton}>
            <AddIcon />
          </IconButton>
        </Box>

        {/*<Box ref={parentRef} position="relative">*/}
        <Box>
          {todoTypeList ? (
            todoTypeList.map((item) => (
              <Stack key={item.id} direction="row">
                <TypeItem
                  parentRef={parentRef}
                  typeItem={item}
                  handleOnChange={handleOnChange}
                  handleClickRemoveButton={handleClickRemoveButton}
                  handleReorderItem={handleReorderItem}
                  moveItem={moveItem}
                  setChangeTypeList={setTodoTypeList}
                />
                <IconButton
                  onClick={() => {
                    void handleClickRemoveButton(item.id);
                  }}
                >
                  <RemoveIcon />
                </IconButton>
              </Stack>
            ))
          ) : (
            <></>
          )}
        </Box>
      </Box>
    </Stack>
  );
}
