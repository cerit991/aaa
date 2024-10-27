export interface CashEntry {
  id: string;
  date: string;
  amount: number;
  type: 'cash' | 'credit_card';
  description: string;
  transactionType: 'income' | 'expense';
  customerId?: string;
}

export interface Customer {
  id: string;
  title: string;
  taxNumber: string;
  phone: string;
  balance: number;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  unit: string;
  vatRate: number;
  currentPrice: number;
  updatedAt: string;
}

export interface PurchaseInvoiceItem {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  discountRate: number;
  vatRate: number;
  total: number;
}

export interface PurchaseInvoice {
  id: string;
  customerId: string;
  invoiceNumber: string;
  date: string;
  items: PurchaseInvoiceItem[];
  total: number;
  createdAt: string;
}

export interface MenuItem {
  id: string;
  name: string;
  ingredients: {
    productId: string;
    quantity: number;
  }[];
  totalCost: number;
  updatedAt: string;
}