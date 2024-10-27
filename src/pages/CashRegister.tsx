import React, { useState } from 'react';
import { storage, STORAGE_KEYS } from '../utils/storage';
import type { CashEntry, Customer } from '../types';
import Card from '../components/Card';
import PageTitle from '../components/PageTitle';
import TransactionList from '../components/cash-register/TransactionList';
import PaymentReportPdf from '../components/cash-register/PaymentReportPdf';

function CashRegister() {
  const [entries, setEntries] = useState<CashEntry[]>(() => 
    storage.get<CashEntry>(STORAGE_KEYS.CASH_ENTRIES) || []
  );

  const [customers] = useState<Customer[]>(() => 
    storage.get<Customer>(STORAGE_KEYS.CUSTOMERS) || []
  );

  const [newEntry, setNewEntry] = useState({
    amount: '',
    type: 'cash',
    description: '',
    transactionType: 'income',
    customerId: ''
  });

  const [customerSearch, setCustomerSearch] = useState('');
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newEntry.amount) {
      alert('Lütfen tutar giriniz.');
      return;
    }

    if (newEntry.transactionType === 'expense' && newEntry.customerId && !confirm('Bu ödemeyi yapmak istediğinize emin misiniz?')) {
      return;
    }

    const entry: CashEntry = {
      id: storage.generateId(),
      date: new Date().toISOString(),
      amount: parseFloat(newEntry.amount),
      type: newEntry.type as 'cash' | 'credit_card',
      description: newEntry.description,
      transactionType: newEntry.transactionType as 'income' | 'expense',
      customerId: newEntry.customerId || undefined
    };

    // Update customer balance if this is a payment
    if (newEntry.transactionType === 'expense' && newEntry.customerId) {
      const updatedCustomers = customers.map(customer => {
        if (customer.id === newEntry.customerId) {
          return {
            ...customer,
            balance: customer.balance - parseFloat(newEntry.amount)
          };
        }
        return customer;
      });
      storage.set(STORAGE_KEYS.CUSTOMERS, updatedCustomers);
    }

    const updatedEntries = [...entries, entry];
    storage.set(STORAGE_KEYS.CASH_ENTRIES, updatedEntries);
    setEntries(updatedEntries);
    setNewEntry({ 
      amount: '', 
      type: 'cash', 
      description: '', 
      transactionType: 'income',
      customerId: ''
    });
    setCustomerSearch('');
    setShowCustomerDropdown(false);
  };

  const handleCustomerSelect = (customerId: string, title: string) => {
    setNewEntry({ ...newEntry, customerId });
    setCustomerSearch(title);
    setShowCustomerDropdown(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <PageTitle>Kasa İşlemleri</PageTitle>
        <div className="flex gap-4 items-center">
          <div>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="form-input"
            />
          </div>
          <div>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="form-input"
            />
          </div>
          <PaymentReportPdf
            payments={entries}
            customers={customers}
            dateRange={dateRange}
          />
        </div>
      </div>
      
      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Tutar</label>
              <input
                type="number"
                step="0.01"
                required
                value={newEntry.amount}
                onChange={(e) => setNewEntry({ ...newEntry, amount: e.target.value })}
                className="form-input"
                min="0"
              />
            </div>
            
            <div>
              <label className="form-label">Ödeme Tipi</label>
              <select
                value={newEntry.type}
                onChange={(e) => setNewEntry({ ...newEntry, type: e.target.value })}
                className="form-input"
              >
                <option value="cash">Nakit</option>
                <option value="credit_card">Kredi Kartı</option>
              </select>
            </div>

            <div>
              <label className="form-label">İşlem Tipi</label>
              <select
                value={newEntry.transactionType}
                onChange={(e) => setNewEntry({ ...newEntry, transactionType: e.target.value })}
                className="form-input"
              >
                <option value="income">Gelir</option>
                <option value="expense">Gider</option>
              </select>
            </div>

            <div>
              <label className="form-label">Açıklama</label>
              <input
                type="text"
                required
                value={newEntry.description}
                onChange={(e) => setNewEntry({ ...newEntry, description: e.target.value })}
                className="form-input"
              />
            </div>

            {newEntry.transactionType === 'expense' && (
              <div className="md:col-span-2">
                <label className="form-label">Cari (Ödeme Yapılacak)</label>
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
                  {showCustomerDropdown && customerSearch && (
                    <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg max-h-60 overflow-auto">
                      {customers
                        .filter(customer => 
                          customer.title.toLowerCase().includes(customerSearch.toLowerCase()) ||
                          customer.taxNumber.includes(customerSearch)
                        )
                        .map(customer => (
                          <div
                            key={customer.id}
                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                            onClick={() => handleCustomerSelect(customer.id, customer.title)}
                          >
                            <div>{customer.title}</div>
                            <div className="text-sm text-gray-600">
                              Bakiye: {customer.balance.toLocaleString('tr-TR', { 
                                style: 'currency', 
                                currency: 'TRY' 
                              })}
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="btn-primary"
            >
              İşlemi Kaydet
            </button>
          </div>
        </form>
      </Card>

      <Card>
        <TransactionList entries={entries} customers={customers} />
      </Card>
    </div>
  );
}

export default CashRegister;