import type { PersistStorage, StorageValue } from "zustand/middleware";
import { serializeState, deserializeState } from "./storageUtils";

// localStorage 스토리지 어댑터 구현
export const createLocalStorageAdapter = <T>(): PersistStorage<T> => {
  return {
    getItem: (name): StorageValue<T> | null => {
      try {
        const serializedState = localStorage.getItem(name);
        if (serializedState === null) {
          return null;
        }
        return deserializeState(serializedState) as StorageValue<T>;
      } catch (error) {
        console.error("Error getting item from localStorage:", error);
        return null;
      }
    },
    setItem: (name, value) => {
      try {
        const serializedState = serializeState(value);
        localStorage.setItem(name, serializedState);
      } catch (error) {
        console.error("Error setting item in localStorage:", error);
      }
    },
    removeItem: (name) => {
      try {
        localStorage.removeItem(name);
      } catch (error) {
        console.error("Error removing item from localStorage:", error);
      }
    },
  };
};
