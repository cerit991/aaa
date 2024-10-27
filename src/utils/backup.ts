import { storage, STORAGE_KEYS } from './storage';

// Update API URL for production
const API_URL = 'http://198.58.101.166:3001/api';

interface BackupData {
  cash_entries: any[];
  customers: any[];
  products: any[];
  purchase_invoices: any[];
  menu_items: any[];
  timestamp: string;
  version: string;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export const backup = {
  export: (): BackupData => {
    return {
      cash_entries: storage.get(STORAGE_KEYS.CASH_ENTRIES),
      customers: storage.get(STORAGE_KEYS.CUSTOMERS),
      products: storage.get(STORAGE_KEYS.PRODUCTS),
      purchase_invoices: storage.get(STORAGE_KEYS.PURCHASE_INVOICES),
      menu_items: storage.get(STORAGE_KEYS.MENU_ITEMS),
      timestamp: new Date().toISOString(),
      version: '1.0'
    };
  },

  save: async (): Promise<boolean> => {
    try {
      const data = backup.export();
      const response = await fetch(`${API_URL}/backup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error(`Backup failed: ${response.statusText}`);
      }

      const result: ApiResponse<{ filename: string }> = await response.json();
      return result.success;
    } catch (error) {
      console.error('Backup error:', error);
      return false;
    }
  },

  list: async (): Promise<{ filename: string; date: string }[]> => {
    try {
      const response = await fetch(`${API_URL}/backups`);
      if (!response.ok) {
        throw new Error(`Failed to list backups: ${response.statusText}`);
      }

      const result: ApiResponse<{ filename: string; date: string }[]> = await response.json();
      return result.data || [];
    } catch (error) {
      console.error('List backups error:', error);
      return [];
    }
  },

  restore: async (filename?: string): Promise<boolean> => {
    try {
      const endpoint = filename ? `/backup/${filename}` : '/backup/latest';
      const response = await fetch(`${API_URL}${endpoint}`);
      
      if (!response.ok) {
        throw new Error(`Restore failed: ${response.statusText}`);
      }

      const result: ApiResponse<BackupData> = await response.json();
      
      if (!result.success || !result.data) {
        throw new Error('Invalid backup data');
      }

      const data = result.data;

      // Restore all data to localStorage
      await storage.set(STORAGE_KEYS.CASH_ENTRIES, data.cash_entries);
      await storage.set(STORAGE_KEYS.CUSTOMERS, data.customers);
      await storage.set(STORAGE_KEYS.PRODUCTS, data.products);
      await storage.set(STORAGE_KEYS.PURCHASE_INVOICES, data.purchase_invoices);
      await storage.set(STORAGE_KEYS.MENU_ITEMS, data.menu_items);

      return true;
    } catch (error) {
      console.error('Restore error:', error);
      return false;
    }
  }
};