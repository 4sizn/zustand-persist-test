import { useState, useEffect } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { produce, enableMapSet } from "immer";
import { createStorage } from "../utils/storageFactory";
import { StorageType } from "../utils/storageUtils";
import "./Todo.css";

// Define the type for the Zustand store
interface TodoState {
  todos: Map<number, string>;
  addTodo: (todo: string) => void;
  removeTodo: (key: number) => void;
}

enableMapSet();

// 스토리지 타입 선택 (localStorage, sessionStorage, indexedDB)
// 기본값은 localStorage
const getInitialStorageType = (): StorageType => {
  const savedType = localStorage.getItem("preferred-storage-type");
  if (
    savedType &&
    Object.values(StorageType).includes(savedType as StorageType)
  ) {
    return savedType as StorageType;
  }
  return StorageType.LOCAL;
};

// 스토리지 타입에 따른 Zustand 스토어 생성 함수
const createTodoStore = (storageType: StorageType) => {
  return create<TodoState>()(
    persist(
      (set) => ({
        todos: new Map(),
        addTodo: (todo) =>
          set(
            produce((state: TodoState) => {
              const newKey = state.todos.size
                ? Math.max(...state.todos.keys()) + 1
                : 0;
              state.todos.set(newKey, todo);
            })
          ),
        removeTodo: (key) =>
          set(
            produce((state: TodoState) => {
              state.todos.delete(key);
            })
          ),
      }),
      {
        name: `todo-storage-${storageType}`,
        storage: createStorage<TodoState>(storageType),
        onRehydrateStorage: () => (state) => {
          if (state) {
            console.log(`State has been hydrated from ${storageType}:`, state);
          }
        },
      }
    )
  );
};

const Todo = () => {
  const [storageType, setStorageType] = useState<StorageType>(
    getInitialStorageType
  );
  const [useTodoStore, setUseTodoStore] = useState(() =>
    createTodoStore(storageType)
  );
  const [newTodo, setNewTodo] = useState("");

  // 스토리지 타입이 변경되면 스토어를 다시 생성
  useEffect(() => {
    setUseTodoStore(() => createTodoStore(storageType));
    localStorage.setItem("preferred-storage-type", storageType);
  }, [storageType]);

  const { todos, addTodo, removeTodo } = useTodoStore();

  const handleAddTodo = () => {
    if (newTodo.trim()) {
      addTodo(newTodo);
      setNewTodo("");
    }
  };

  const handleStorageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStorageType(e.target.value as StorageType);
  };

  return (
    <div>
      <h1>ToDo List</h1>
      <div className="storage-selector">
        <label htmlFor="storage-type">스토리지 타입: </label>
        <select
          id="storage-type"
          value={storageType}
          onChange={handleStorageChange}
        >
          <option value={StorageType.LOCAL}>LocalStorage</option>
          <option value={StorageType.SESSION}>SessionStorage</option>
          <option value={StorageType.INDEXED_DB}>IndexedDB</option>
        </select>
        <div className="storage-info">
          현재 사용 중인 스토리지: <strong>{storageType}</strong>
        </div>
      </div>

      <input
        type="text"
        value={newTodo}
        onChange={(e) => setNewTodo(e.target.value)}
        placeholder="Add a new task"
      />
      <button type="button" onClick={handleAddTodo}>
        Add
      </button>
      <ul>
        {[...todos.entries()].map(([key, todo]) => (
          <li key={key}>
            {todo}
            <button type="button" onClick={() => removeTodo(key)}>
              Remove
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Todo;
