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

// 우선순위 컬러 scheme
interface PriorityMapping {
  label: string;
  bgColor: string;
}

interface TodoState {
  /*
    ***** State *****
    isEditing         : 현재 수정중인지 여부
    todoList          : to do 아이템리스트
    todoTypeList      : to do 작업타입 아이템리스트
    updatedTodos      : 업데이트된 아이템들의 id 배열
    newTodoId         : 추가된 신규 아이템의 ID. FOCUS 변경용.
    activeId          : 드래그 활성화중인 아이템의 ID
    overlayItem       : 드래그 활성화중인 경우 overlay를 그리기위한 Data
    priorityScheme    : 우선순위 정보

    ***** State Setter *****
    setIsEditing      : 현재 수정중인지 여부를 관리
    setTodoList       : todoList setter
    setUpdatedTodos   : 업데이트된 아이템들의 id 배열 관리
    setActiveId       : activeId setter
    setOverlayItem    : overlayItem setter

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
  newTodoId: string | null;
  activeId: string | null;
  overlayItem: TODO | null;
  priorityScheme: Record<string, PriorityMapping>;
  dDayScheme: Record<string, string>;

  setIsEditing: (value: boolean) => void;
  setTodoList: (todoList: TODO[]) => void;
  setUpdatedTodos: (id: TODO | undefined) => void;
  setActiveId: (id: string | null) => void;
  setOverlayItem: (todo: TODO | null) => void;

  initTodo: () => Unsubscribe;
  addTodo: () => void;
  updateTodo: (todo: TODO) => void;
  removeTodo: (id: string) => void;
}

// @ts-ignore
export const useTodoStore = create<TodoState>((set) => ({
  isEditing: false,
  todoList: [],
  todoTypeList: [],
  updatedTodos: [],
  newTodoId: "",
  activeId: null,
  overlayItem: null,
  priorityScheme: {
    "1": {
      label: "낮음",
      bgColor: "#A2D2FF",
    },
    "2": {
      label: "보통",
      bgColor: "#B8E994",
    },
    "3": {
      label: "높음",
      bgColor: "#FFD8A9",
    },
    "4": {
      label: "중요",
      bgColor: "#FFAAA5",
    },
  },
  dDayScheme: {
    m5: "#B8E994",
    m0: "#FFD8A9",
    d: "#FFAAA5",
    p: "disabled",
  },

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
  setActiveId: (id: string | null) => set({ activeId: id }),
  setOverlayItem: (todo: TODO | null) => set({ overlayItem: todo }),

  initTodo: () => {
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
        priority: 2,
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

      set(() => ({ newTodoId: String(maxId + 1) }));
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
    collection(fireStore, "todo", "userId_01", "todoItem"),
    where("status", "==", "PENDING"),
    orderBy("ord", "desc"),
    limit(1),
  );
  const ordSnapshot = await getDocs(ordQuery);
  const maxOrd = !ordSnapshot.empty ? ordSnapshot.docs[0].data().ord : 0;

  // numId 값 기준 내림차순 정렬 쿼리
  const idQuery = query(
    collection(fireStore, "todo", "userId_01", "todoItem"),
    orderBy("numId", "desc"),
    limit(1),
  );
  const idSnapshot = await getDocs(idQuery);
  const maxId = !idSnapshot.empty ? idSnapshot.docs[0].data().numId : 0;

  return { maxOrd, maxId };
}
