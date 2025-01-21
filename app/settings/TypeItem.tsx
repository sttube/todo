'use client';
import React, { RefObject, useEffect, useRef, useState } from 'react';

// MUI
import Box from '@mui/material/Box';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';

import { IconButton, TextField } from '@mui/material';
import { useDrag, useDrop } from 'react-dnd';

import { TYPE_ITEM } from './Settings_T01';

export default function TypeItem({
  parentRef,
  typeItem,
  handleOnChange,
  handleClickRemoveButton,
  handleReorderItem,
  moveItem,
  setChangeTypeList
}: {
  parentRef: RefObject<any>;
  typeItem: TYPE_ITEM;
  handleOnChange: (key: number, value: string) => void;
  handleClickRemoveButton: (delKey: number) => Promise<void>;
  handleReorderItem: () => void;
  moveItem: (fromIndex: number, toIndex: number) => void;
  setChangeTypeList: React.Dispatch<React.SetStateAction<TYPE_ITEM[]>>;
}) {
  /**************************************************
    변수, 상수 및 상태 정의
  **************************************************/
  const [dragPosition, setDragPosition] = useState({
    x: 0,
    y: 0
  });
  const [dropPosition, setDropPosition] = useState({
    x: 0,
    y: 0
  });
  const itemRef = useRef(null);

  const [
    { isDragging, initialOffset, currentOffset, didDrop, offset },
    drag,
    preview
  ] = useDrag({
    type: 'BOX', // 드래그 가능한 아이템의 타입
    item: (monitor) => ({
      id: typeItem.id,
      value: typeItem.typeName,
      ord: typeItem.ord,
      parentRef: parentRef
    }),
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
      initialOffset: monitor.getInitialSourceClientOffset(),
      currentOffset: monitor.getClientOffset(),
      didDrop: monitor.didDrop()
    })
  });

  const [{ isOver, dropOffset }, drop] = useDrop({
    accept: 'BOX',
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      dropOffset: monitor.getClientOffset()
    }),
    hover: (draggedItem, monitor) => {
      if (!itemRef.current) return;
      if (draggedItem.ord === typeItem.ord) return;
      // 컴포넌트 위치(중심점 계산 등)를 위해 boundingRect 가져오기
      const hoverBoundingRect = itemRef.current.getBoundingClientRect();
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

      // 마우스 현재 위치(clientY)
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = (clientOffset!.y ?? 0) - hoverBoundingRect.top;

      /**
       * 세로 리스트 기준
       * draggedItem이 현재 아이템보다 아래(드래그)에서 위로 올라오는 경우
       * 혹은 그 반대 상황에서, 일정 지점(아이템 높이 절반)을 넘기 전까지는 reorder 하지 않는 패턴
       */
      // 1) 아래쪽에서 위로 올라오는 경우
      if (draggedItem.ord < typeItem.ord && hoverClientY < hoverMiddleY) {
        return;
      }
      // 2) 위쪽에서 아래로 내려오는 경우
      if (draggedItem.ord > typeItem.ord && hoverClientY > hoverMiddleY) {
        return;
      }
      moveItem(draggedItem.ord, typeItem.ord);
      draggedItem.ord = typeItem.ord;
    }, // 드래그 아이템의 ord를 업데이트
    drop: (draggedItem) => {
      // moveItem(draggedItem.ord, typeItem.ord);
      handleReorderItem();
    }
  });

  // useEffect(() => {
  //   if (currentOffset) {
  //     setDragPosition({
  //       x: currentOffset.x,
  //       y: currentOffset.y
  //     });
  //   }
  // }, [currentOffset]);
  //
  // useEffect(() => {
  //   if (isOver && initialOffset) {
  //     setDropPosition({
  //       x: initialOffset.x,
  //       y: initialOffset.y
  //     });
  //   }
  // }, [isOver]);

  // dragRef는 useDrag에서 반환된 콜백형 ref이며 이를 Box의 ref로 전달
  const dragTargetRef = useRef(null);
  const previewTargetRef = useRef(null);
  const dropRef = useRef(null);

  /**************************************************
      useEffect
   **************************************************/
  // useEffect(() => {
  //   dragRef(drop(dragTargetRef.current)); // dragRef를 dragTargetRef에 연결
  // }, [dragRef]);
  // useEffect(() => {
  //   drop(dropRef.current); // dragRef를 dragTargetRef에 연결
  //   previewRef(previewTargetRef.current);
  // }, [drop]);
  // useEffect(() => {
  //   previewRef(previewTargetRef.current);
  // }, [previewRef]);

  drag(drop(itemRef));
  /**************************************************
    EventHandler
  **************************************************/
  /**************************************************
      Element 정의
    **************************************************/

  return (
    <Box
      ref={itemRef}
      sx={{
        display: 'flex',
        alignItems: 'center',
        p: 1,
        cursor: 'move',
        backgroundColor: isOver ? '#e0f7fa' : 'default',
        // position: 'absolute',
        // transition: 'transform 0.2s ease',
        transition: 'transform 0.5s, top 0.5s'
        // transform: isOver
        //   ? `translate(${dropPosition.x}px, ${dropPosition.y}px)`
        //   : `translate(${dropPosition.x}px, ${dropPosition.y}px)`
      }}
    >
      <Box
        ref={previewTargetRef}
        // sx={{ visibility: isDragging ? 'hidden' : 'default' }}
      >
        <TextField
          fullWidth
          id="type"
          size="small"
          variant="outlined"
          sx={{ width: '200px' }}
          value={typeItem.typeName}
          onChange={(e) => handleOnChange(typeItem.id, e.target.value)}
        />
        <IconButton>
          <UnfoldMoreIcon />
        </IconButton>
      </Box>
    </Box>
  );
}
