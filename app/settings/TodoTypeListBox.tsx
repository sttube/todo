'use client';
import React, { useEffect, useState } from 'react';

// MUI
import Box from '@mui/material/Box';
import AddIcon from '@mui/icons-material/Add';

import { IconButton, Stack, TextField, Typography } from '@mui/material';
import { doc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';
import fireStore from '@/firebase/firestore';

import TodoType from './TodoType';
import firebase from 'firebase/compat';
import DocumentReference = firebase.firestore.DocumentReference;

import { TYPE_ITEM } from './Settings_T01';
import RemoveIcon from '@mui/icons-material/Remove';
import {
  closestCenter,
  DndContext,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import { SortableContext } from '@dnd-kit/sortable';

export default function TodoTypeListBox() {
  /**************************************************
    변수, 상수 및 상태 정의
  **************************************************/
  const [todoTypeList, setTodoTypeList] = useState<TYPE_ITEM[]>([]);
  const [addChangeType, setAddChangeType] = useState('');
  const [maxId, setMaxId] = useState(0);
  const [maxOrd, setMaxOrd] = useState(0);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5 // 5px 이상 드래그해야 인식
      }
    })
  );

  /**************************************************
      useEffect
   **************************************************/
  useEffect(() => {
    // 작업유형 불러오기
    // 문서를 구독하여 문서 업데이트시 snapshot을 자동으로 동기화되도록 한다.
    // onSnapshot은 unsubscribe(구독해제) 함수를 반환한다. 이것을 useEffect의 cleanup으로 return한다.
    const typeRef = doc(fireStore, 'todo', 'todoType');
    const unsubscribe = onSnapshot(typeRef, (snapshot) => {
      if (snapshot.exists()) {
        // ord순으로 정렬하고 ChangeTypeList에 저장한다.
        setTodoTypeList(
          snapshot.data()?.typeItem.sort((a, b) => b.ord - a.ord) || []
        );
      } else {
        console.error('작업유형 데이터가 없습니다.');
      }
    });

    return () => {
      unsubscribe();
    };
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
    console.log('loaded');
  }, [todoTypeList]);

  /**************************************************
    EventHandler
  **************************************************/

  // 드래그가 끝났을 때 호출되는 콜백
  const handleDragEnd = async (event) => {
    const { active, over } = event;
    // active.id => 드래그한 아이템의 id
    // over && over.id => 드롭된 위치의 아이템 id (없을 수도)
    if (!over) return; // 드롭 대상이 없으면 무시
    if (active.id !== over.id) {
      // 배열 상태에서 active.id, over.id의 위치를 swap
      // 1) 드래그된 아이템과 드롭 대상 아이템 찾기
      const draggedIndex = todoTypeList.findIndex((it) => it.id === active.id);
      const overIndex = todoTypeList.findIndex((it) => it.id === over.id);

      const draggedItem = todoTypeList[draggedIndex];
      const overItem = todoTypeList[overIndex];

      const oldOrd = draggedItem.ord;
      const newOrd = overItem.ord;

      // 2) 각 아이템 ord 조정
      const reOrderedList = todoTypeList.map((item) => {
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

      const typeRef = doc(fireStore, 'todo', 'todoType');
      try {
        await updateDoc(typeRef, {
          typeItem: reOrderedList
        } as DocumentReference<TYPE_ITEM[]>); // typeItem배열에서 removeItem을 제거한다.
        // setChangeTypeList(removedList);
      } catch (error) {
        console.log(
          '작업유형 아이템의 순서를 변경하는 과정에서 오류가 발생하였습니다.'
        );
      }
    }
  };

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

  // 작업유형 추가버튼 클릭 이벤트
  const handleClickAddButton = async () => {
    if (addChangeType !== '') {
      const typeRef = doc(fireStore, 'todo', 'changeType');
      await setDoc(
        typeRef,
        {
          typeItem: [
            ...todoTypeList,
            { id: String(maxId + 1), typeName: addChangeType, ord: maxOrd + 1 }
          ]
        },
        { merge: true }
      );

      // 추가 텍스트필드 비우기
      setAddChangeType('');
    }
  };

  // 작업유형 제거버튼 클릭 이벤트
  const handleClickRemoveButton = async (delKey: string) => {
    // 제거할 아이템을 제외한 list를 만든다.
    const removedList: TYPE_ITEM[] = todoTypeList.filter(
      (item) => item.id !== delKey
    );
    const typeRef = doc(fireStore, 'todo', 'todoType');
    try {
      await updateDoc(typeRef, {
        typeItem: removedList
      } as DocumentReference<TYPE_ITEM[]>); // typeItem배열에서 removeItem을 제거한다.
      // setChangeTypeList(removedList);
    } catch (error) {
      console.log('작업유형 아이템을 제거하는 과정에서 오류가 발생하였습니다.');
    }
  };

  const handleOnChange = (id: string, typeName: string) => {
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

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={todoTypeList.map((t) => t.id)}>
            {todoTypeList ? (
              todoTypeList.map((item) => (
                <Stack key={item.id} direction="row">
                  <TodoType
                    typeItem={item}
                    handleOnChange={handleOnChange}
                    handleClickRemoveButton={handleClickRemoveButton}
                    setTodoTypeList={setTodoTypeList}
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
          </SortableContext>
        </DndContext>
      </Box>
    </Stack>
  );
}
