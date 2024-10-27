import { useState } from 'react';
import { storage } from './storage';

export function useStorageData<T>(key: string): [T[], (data: T[]) => Promise<void>] {
  const [data, setInternalData] = useState<T[]>(() => {
    // Initial load from storage
    return storage.get<T>(key);
  });

  const setData = async (newData: T[]): Promise<void> => {
    try {
      await storage.set(key, newData);
      setInternalData(newData);
    } catch (error) {
      console.error(`Error updating data for key ${key}:`, error);
      throw error;
    }
  };

  return [data, setData];
}