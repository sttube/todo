import { create } from "zustand";
import { TODO } from "@/app/todolist/Todo_T01";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  Unsubscribe,
  where,
} from "firebase/firestore";
import fireStore from "@/firebase/firestore";
import { TYPE_ITEM } from "@/app/settings/Settings_T01";

interface TodoState {
  /*
    ***** State *****
    isEditing         : 현재 수정중인지 여부
    todoList          : to do 아이템리스트
    todoTypeList      : to do 작업타입 아이템리스트
    updatedTodos    : 업데이트된 아이템들의 id 배열

    ***** State Setter *****
    setIsEditing      : 현재 수정중인지 여부를 관리
    setTodoList       : todoList setter
    setUpdatedTodos : 업데이트된 아이템들의 id 배열 관리

    ***** Operations  *****
    initTodo           : Doc 구독 및 불러온 데이터로 todoList 초기값 설정
    addTodo            : 신규 to do 아이템 추가
    updateTodo         : to do 아이템 업데이트
    removeTodo         : to do 아이템 제거
   */

  isEditing: boolean;
  todoList: TODO[];
  todoTypeList: TYPE_ITEM[];
  updatedTodos: TODO[];

  setIsEditing: (value: boolean) => void;
  setTodoList: (todoList: TODO[]) => void;
  setUpdatedTodos: (id: TODO | undefined) => void;

  initTodo: () => Unsubscribe;
  addTodo: () => void;
  updateTodo: (todo: TODO) => void;
  removeTodo: (id: string) => void;
}

export const useTodoStore = create<TodoState>((set) => ({
  isEditing: false,
  todoList: [],
  todoTypeList: [],
  updatedTodos: [],
  setIsEditing: (value: boolean) => set({ isEditing: value }),
  setTodoList: (todoList: TODO[]) => set({ todoList: todoList }),
  setUpdatedTodos: (todo?: TODO) =>
    set((prevState: TodoState) => {
      // 만약 to do가 undefined라면 배열을 초기화
      if (todo === undefined) {
        return { updatedTodos: [] };
      }
      // 기존 배열에서 해당 id의 항목이 있는지 검사
      const index = prevState.updatedTodos.findIndex(
        (item) => item.id === todo.id,
      );
      if (index >= 0) {
        // 이미 존재하면 해당 항목을 교체
        const newUpdatedTodos = [...prevState.updatedTodos];
        newUpdatedTodos[index] = todo;
        return { updatedTodos: newUpdatedTodos };
      } else {
        // 존재하지 않으면 배열에 추가
        return { updatedTodos: [...prevState.updatedTodos, todo] };
      }
    }),
  initTodo: () => {
    console.log("initTodo");
    // todoTypeDoc 조회
    const loadTodoType = async () => {
      const todoTypeRef = doc(fireStore, "todo", "todoType");
      const todoTypeDoc = await getDoc(todoTypeRef);

      if (todoTypeDoc.exists()) {
        set(() => ({
          todoTypeList: todoTypeDoc
            .data()
            ?.typeItem.sort((a: TYPE_ITEM, b: TYPE_ITEM) => b.ord - a.ord),
        }));
      }
    };

    // todoTypeDoc 비동기 로드
    void loadTodoType();

    // 문서를 구독하여 문서 업데이트시 snapshot이 자동으로 동기화되도록 한다.
    // onSnapshot은 unsubscribe(구독해제) 함수를 반환한다.
    // 이것을 cleanup으로 사용한다.
    const todoQuery = query(
      collection(fireStore, "todo", "userId_01", "todoItem"),
      orderBy("ord", "desc"),
    );

    return onSnapshot(todoQuery, (snapshot) => {
      if (!snapshot.empty) {
        const newTodoList = snapshot.docs.map((doc) => doc.data()) as TODO[];
        set(() => ({ todoList: newTodoList }));
      }
    });
  },
  addTodo: async () => {
    try {
      const { maxOrd, maxId } = await getMaxValue();

      const newTodo = {
        id: String(maxId + 1),
        numId: maxId + 1,
        ord: maxOrd + 1,
        status: "PENDING",
        title: String(maxId + 1),
      } as TODO;

      const todoRef = doc(
        fireStore,
        "todo",
        "userId_01",
        "todoItem",
        String(maxId + 1),
      );

      await setDoc(
        todoRef,
        {
          ...newTodo,
        },
        { merge: true },
      );
    } catch (error) {
      console.error("Todo 아이템 추가 도중 오류가 발생했습니다.\n", error);
    }
  },
  updateTodo: (updatedTodo: TODO) =>
    set((state: TodoState) => ({
      todoList: state.todoList.map((todo: TODO) =>
        todo.id === updatedTodo.id ? updatedTodo : todo,
      ),
    })),
  removeTodo: async (id: string) => {
    const todoRef = doc(fireStore, "todo", "userId_01", "todoItem", id);
    try {
      await deleteDoc(todoRef);
    } catch (error) {
      console.log("TODO 아이템을 제거하는 과정에서 오류가 발생하였습니다.");
    }
  },
}));

async function getMaxValue(): Promise<{ maxOrd: number; maxId: number }> {
  // ord 값 기준 내림차순 정렬 쿼리
  const ordQuery = query(
    collection(fireStore, "todo"),
    where("status", "==", "PENDING"),
    orderBy("ord", "desc"),
    limit(1),
  );
  const ordSnapshot = await getDocs(ordQuery);
  const maxOrd = !ordSnapshot.empty ? ordSnapshot.docs[0].data().ord : 0;

  // numId 값 기준 내림차순 정렬 쿼리
  const idQuery = query(
    collection(fireStore, "todo"),
    orderBy("numId", "desc"),
    limit(1),
  );
  const idSnapshot = await getDocs(idQuery);
  const maxId = !idSnapshot.empty ? idSnapshot.docs[0].data().numId : 0;

  return { maxOrd, maxId };
}
