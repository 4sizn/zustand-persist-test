import type { PersistStorage, StorageValue } from "zustand/middleware";

// 스토리지 타입 정의
export enum StorageType {
  LOCAL = "localStorage",
  SESSION = "sessionStorage",
  INDEXED_DB = "indexedDB",
}

// Map 객체를 직렬화하는 함수
export const serializeState = <T>(state: T): string => {
  return JSON.stringify(state, (key, value) => {
    if (value instanceof Map) {
      return {
        type: "Map",
        value: Array.from(value.entries()),
      };
    }
    return value;
  });
};

// 직렬화된 상태를 역직렬화하는 함수
export const deserializeState = <T>(serializedState: string): T => {
  return JSON.parse(serializedState, (key, value) => {
    if (
      value !== null &&
      typeof value === "object" &&
      "type" in value &&
      "value" in value &&
      value.type === "Map"
    ) {
      return new Map(value.value);
    }
    return value;
  });
};
