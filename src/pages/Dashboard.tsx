import { CreditCard, Wallet, Users, Package } from 'lucide-react';
import { STORAGE_KEYS } from '../utils/storage';
import { useStorageData } from '../utils/hooks';
import type { CashEntry, Customer, Product } from '../types';

function Dashboard() {
  const [cashEntries] = useStorageData<CashEntry>(STORAGE_KEYS.CASH_ENTRIES);
  const [customers] = useStorageData<Customer>(STORAGE_KEYS.CUSTOMERS);
  const [products] = useStorageData<Product>(STORAGE_KEYS.PRODUCTS);

  const totalCash = cashEntries
    .filter(entry => entry.type === 'cash')
    .reduce((acc, entry) => 
      entry.transactionType === 'income' ? acc + entry.amount : acc - entry.amount, 
    0);

  const totalCard = cashEntries
    .filter(entry => entry.type === 'credit_card')
    .reduce((acc, entry) => 
      entry.transactionType === 'income' ? acc + entry.amount : acc - entry.amount, 
    0);

  const totalCustomerBalance = customers
    .reduce((acc, customer) => acc + customer.balance, 0);

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('tr-TR', { 
      style: 'currency', 
      currency: 'TRY' 
    });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Genel Bakış</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Nakit Bakiye</p>
              <p className="text-2xl font-semibold text-gray-900">
                {formatCurrency(totalCash)}
              </p>
            </div>
            <Wallet className="w-12 h-12 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Kredi Kartı Bakiye</p>
              <p className="text-2xl font-semibold text-gray-900">
                {formatCurrency(totalCard)}
              </p>
            </div>
            <CreditCard className="w-12 h-12 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Toplam Cari Bakiye</p>
              <p className="text-2xl font-semibold text-gray-900">
                {formatCurrency(totalCustomerBalance)}
              </p>
            </div>
            <Users className="w-12 h-12 text-purple-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Toplam Ürün</p>
              <p className="text-2xl font-semibold text-gray-900">{products.length}</p>
            </div>
            <Package className="w-12 h-12 text-orange-500" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;