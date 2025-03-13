import type { PersistStorage } from "zustand/middleware";
import { StorageType } from "./storageUtils";
import { createLocalStorageAdapter } from "./localStorageAdapter";
import { createSessionStorageAdapter } from "./sessionStorageAdapter";
import { createIndexedDBStorage } from "./indexedDBStorage";

// 스토리지 어댑터 팩토리 함수
export const createStorage = <T>(
  type: StorageType = StorageType.LOCAL
): PersistStorage<T> => {
  switch (type) {
    case StorageType.LOCAL:
      return createLocalStorageAdapter<T>();
    case StorageType.SESSION:
      return createSessionStorageAdapter<T>();
    case StorageType.INDEXED_DB:
      return createIndexedDBStorage<T>();
    default:
      console.warn(
        `Unknown storage type: ${type}, falling back to localStorage`
      );
      return createLocalStorageAdapter<T>();
  }
};
