import React, { useState } from 'react';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { produce, enableMapSet } from 'immer';

// Define the type for the Zustand store
interface TodoState {
  todos: Map<number, string>;
  addTodo: (todo: string) => void;
  removeTodo: (key: number) => void;
}

enableMapSet();

// Zustand store for managing todos with persistence
const useTodoStore = create<TodoState>()(
  persist(
    (set) => ({
      todos: new Map(),
      addTodo: (todo) => set(produce((state: TodoState) => {
        const newKey = state.todos.size ? Math.max(...state.todos.keys()) + 1 : 0;
        state.todos.set(newKey, todo);
      })),
      removeTodo: (key) => set(produce((state: TodoState) => {
        state.todos.delete(key);
      })),
    }),
    {
      name: 'todo-storage',
      storage: createJSONStorage(() => sessionStorage, {
        reviver: (key, value) => {
          if (
            value !== null &&
            typeof value === 'object' &&
            'type' in value &&
            'value' in value &&
            (value as any).type === 'Map'
          ) {
            return new Map((value as any).value);
          }
          return value;
        },
        replacer: (key, value) => {
          if (value instanceof Map) {
            return { type: 'Map', value: Array.from(value.entries()) };
          }
          return value;
        },
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.todos = new Map(state.todos);
          console.log('State has been hydrated and converted to Map:', state);
        }
      },
      
    }
  )
);

const Todo = () => {
  const [newTodo, setNewTodo] = useState('');
  const { todos, addTodo, removeTodo } = useTodoStore();

  const handleAddTodo = () => {
    if (newTodo.trim()) {
      addTodo(newTodo);
      setNewTodo('');
    }
  };

  return (
    <div>
      <h1>ToDo List</h1>
      <input
        type="text"
        value={newTodo}
        onChange={(e) => setNewTodo(e.target.value)}
        placeholder="Add a new task"
      />
      <button onClick={handleAddTodo}>Add</button>
      <ul>
        {[...todos.entries()].map(([key, todo]) => (
          <li key={key}>
            {todo}
            <button onClick={() => removeTodo(key)}>Remove</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Todo; 