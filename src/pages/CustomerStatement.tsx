import { useState, useMemo } from 'react';
import { storage, STORAGE_KEYS } from '../utils/storage';
import type { Customer, PurchaseInvoice, CashEntry } from '../types';
import Card from '../components/Card';
import PageTitle from '../components/PageTitle';
import PdfExport from '../components/customer-statement/PdfExport';

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'invoice' | 'payment';
  reference: string;
}

function CustomerStatement() {
  const [customers] = useState<Customer[]>(() => 
    storage.get<Customer>(STORAGE_KEYS.CUSTOMERS) || []
  );
  const [invoices] = useState<PurchaseInvoice[]>(() => 
    storage.get<PurchaseInvoice>(STORAGE_KEYS.PURCHASE_INVOICES) || []
  );
  const [payments] = useState<CashEntry[]>(() => 
    storage.get<CashEntry>(STORAGE_KEYS.CASH_ENTRIES) || []
  );

  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });

  const filteredCustomers = useMemo(() => {
    if (!customerSearch) return [];
    const searchTerm = customerSearch.toLowerCase();
    return customers.filter(customer => 
      customer.title.toLowerCase().includes(searchTerm) ||
      customer.taxNumber.includes(searchTerm)
    );
  }, [customers, customerSearch]);

  const transactions = useMemo(() => {
    if (!selectedCustomerId) return [];

    const customerInvoices: Transaction[] = invoices
      .filter(invoice => invoice.customerId === selectedCustomerId)
      .map(invoice => ({
        id: invoice.id,
        date: invoice.date,
        description: `Alış Faturası - ${invoice.invoiceNumber}`,
        amount: invoice.total,
        type: 'invoice',
        reference: invoice.invoiceNumber
      }));

    const customerPayments: Transaction[] = payments
      .filter(payment => 
        payment.customerId === selectedCustomerId && 
        payment.transactionType === 'expense'
      )
      .map(payment => ({
        id: payment.id,
        date: payment.date,
        description: `Ödeme - ${payment.type === 'cash' ? 'Nakit' : 'Kredi Kartı'}`,
        amount: -payment.amount, // Negative because it reduces the balance
        type: 'payment',
        reference: payment.type === 'cash' ? 'Nakit' : 'K.Kartı'
      }));

    let allTransactions = [...customerInvoices, ...customerPayments]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    if (dateRange.start) {
      allTransactions = allTransactions.filter(t => 
        new Date(t.date) >= new Date(dateRange.start)
      );
    }
    if (dateRange.end) {
      allTransactions = allTransactions.filter(t => 
        new Date(t.date) <= new Date(dateRange.end)
      );
    }

    return allTransactions;
  }, [selectedCustomerId, invoices, payments, dateRange]);

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('tr-TR', { 
      style: 'currency', 
      currency: 'TRY' 
    });
  };

  const calculateRunningBalance = (transactions: Transaction[]) => {
    let balance = 0;
    return transactions.map(t => {
      balance += t.amount;
      return { ...t, balance };
    });
  };

  const handleCustomerSelect = (customerId: string, title: string) => {
    setSelectedCustomerId(customerId);
    setCustomerSearch(title);
    setShowCustomerDropdown(false);
  };

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);
  const transactionsWithBalance = calculateRunningBalance(transactions);

  return (
    <div className="space-y-6">
      <PageTitle>Cari Hesap Ekstresi</PageTitle>

      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="form-label">Cari Seçin</label>
            <div className="relative">
              <input
                type="text"
                value={customerSearch}
                onChange={(e) => {
                  setCustomerSearch(e.target.value);
                  setShowCustomerDropdown(true);
                }}
                onFocus={() => setShowCustomerDropdown(true)}
                placeholder="Cari ara..."
                className="form-input"
              />
              {showCustomerDropdown && customerSearch && filteredCustomers.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg max-h-60 overflow-auto">
                  {filteredCustomers.map(customer => (
                    <div
                      key={customer.id}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => handleCustomerSelect(customer.id, customer.title)}
                    >
                      <div>{customer.title}</div>
                      <div className="text-sm text-gray-600">
                        Bakiye: {formatCurrency(customer.balance)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="form-label">Başlangıç Tarihi</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="form-input"
            />
          </div>

          <div>
            <label className="form-label">Bitiş Tarihi</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="form-input"
            />
          </div>
        </div>
      </Card>

      {selectedCustomer && (
        <Card>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">{selectedCustomer.title}</h3>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-sm text-gray-600">Güncel Bakiye</div>
                  <div className={`text-lg font-bold ${
                    selectedCustomer.balance >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatCurrency(selectedCustomer.balance)}
                  </div>
                </div>
                <PdfExport 
                  customer={selectedCustomer}
                  transactions={transactionsWithBalance}
                  dateRange={dateRange}
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="table-header">Tarih</th>
                    <th className="table-header">Açıklama</th>
                    <th className="table-header">Referans</th>
                    <th className="table-header">Borç</th>
                    <th className="table-header">Alacak</th>
                    <th className="table-header">Bakiye</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transactionsWithBalance.map((transaction) => (
                    <tr key={transaction.id}>
                      <td className="table-cell">
                        {new Date(transaction.date).toLocaleDateString('tr-TR')}
                      </td>
                      <td className="table-cell">{transaction.description}</td>
                      <td className="table-cell">{transaction.reference}</td>
                      <td className="table-cell">
                        {transaction.amount > 0 ? formatCurrency(transaction.amount) : '-'}
                      </td>
                      <td className="table-cell">
                        {transaction.amount < 0 ? formatCurrency(-transaction.amount) : '-'}
                      </td>
                      <td className="table-cell">
                        <span className={transaction.balance >= 0 ? 'text-green-600' : 'text-red-600'}>
                          {formatCurrency(transaction.balance)}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {transactions.length === 0 && (
                    <tr>
                      <td colSpan={6} className="table-cell text-center text-gray-500">
                        İşlem bulunamadı
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

export default CustomerStatement;