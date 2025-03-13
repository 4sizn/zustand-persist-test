import type { PersistStorage, StorageValue } from "zustand/middleware";
import { serializeState, deserializeState } from "./storageUtils";

// sessionStorage 스토리지 어댑터 구현
export const createSessionStorageAdapter = <T>(): PersistStorage<T> => {
  return {
    getItem: (name): StorageValue<T> | null => {
      try {
        const serializedState = sessionStorage.getItem(name);
        if (serializedState === null) {
          return null;
        }
        return deserializeState(serializedState) as StorageValue<T>;
      } catch (error) {
        console.error("Error getting item from sessionStorage:", error);
        return null;
      }
    },
    setItem: (name, value) => {
      try {
        const serializedState = serializeState(value);
        sessionStorage.setItem(name, serializedState);
      } catch (error) {
        console.error("Error setting item in sessionStorage:", error);
      }
    },
    removeItem: (name) => {
      try {
        sessionStorage.removeItem(name);
      } catch (error) {
        console.error("Error removing item from sessionStorage:", error);
      }
    },
  };
};
