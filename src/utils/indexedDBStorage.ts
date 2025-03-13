import type { PersistStorage, StorageValue } from "zustand/middleware";
import { serializeState, deserializeState } from "./storageUtils";

const DB_NAME = "zustandPersistStore";
const STORE_NAME = "state";
const DB_VERSION = 1;

// IndexedDB 연결 초기화 함수
const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);

    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
  });
};

// IndexedDB 스토리지 어댑터 구현
export const createIndexedDBStorage = <T>(): PersistStorage<T> => {
  const getItem = async (key: string): Promise<string | null> => {
    try {
      const db = await initDB();
      return new Promise<string | null>((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, "readonly");
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(key);

        request.onerror = () => {
          reject(request.error);
        };

        request.onsuccess = () => {
          resolve(request.result || null);
        };

        transaction.oncomplete = () => {
          db.close();
        };
      });
    } catch (error) {
      console.error("Error getting item from IndexedDB:", error);
      return null;
    }
  };

  const setItem = async (key: string, value: string): Promise<void> => {
    try {
      const db = await initDB();
      return new Promise<void>((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, "readwrite");
        const store = transaction.objectStore(STORE_NAME);
        const request = store.put(value, key);

        request.onerror = () => {
          reject(request.error);
        };

        request.onsuccess = () => {
          resolve();
        };

        transaction.oncomplete = () => {
          db.close();
        };
      });
    } catch (error) {
      console.error("Error setting item in IndexedDB:", error);
    }
  };

  const removeItem = async (key: string): Promise<void> => {
    try {
      const db = await initDB();
      return new Promise<void>((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, "readwrite");
        const store = transaction.objectStore(STORE_NAME);
        const request = store.delete(key);

        request.onerror = () => {
          reject(request.error);
        };

        request.onsuccess = () => {
          resolve();
        };

        transaction.oncomplete = () => {
          db.close();
        };
      });
    } catch (error) {
      console.error("Error removing item from IndexedDB:", error);
    }
  };

  return {
    getItem: async (name): Promise<StorageValue<T> | null> => {
      const serializedState = await getItem(name);
      if (serializedState === null) {
        return null;
      }
      try {
        return deserializeState(serializedState) as StorageValue<T>;
      } catch (error) {
        console.error("Error deserializing state from IndexedDB:", error);
        return null;
      }
    },
    setItem: async (name, value) => {
      const serializedState = serializeState(value);
      await setItem(name, serializedState);
    },
    removeItem: async (name) => {
      await removeItem(name);
    },
  };
};
