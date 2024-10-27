import { v4 as uuidv4 } from 'uuid';
import { backup } from './backup';

const STORAGE_KEYS = {
  CASH_ENTRIES: 'cash_entries',
  CUSTOMERS: 'customers',
  PRODUCTS: 'products',
  PURCHASE_INVOICES: 'purchase_invoices',
  MENU_ITEMS: 'menu_items',
} as const;

export const storage = {
  get: <T>(key: string): T[] => {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error(`Error retrieving data for key ${key}:`, error);
      return [];
    }
  },

  set: async <T>(key: string, data: T[]): Promise<void> => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      // Automatically backup after each data modification
      await backup.save().catch(error => {
        console.error('Auto-backup failed:', error);
      });
    } catch (error) {
      console.error(`Error storing data for key ${key}:`, error);
      throw error;
    }
  },

  generateId: (): string => uuidv4(),
};

export { STORAGE_KEYS };