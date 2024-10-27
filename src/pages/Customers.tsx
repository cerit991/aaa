import React, { useState } from 'react';
import { storage, STORAGE_KEYS } from '../utils/storage';
import type { Customer } from '../types';

function Customers() {
  const [customers, setCustomers] = useState<Customer[]>(() => 
    storage.get<Customer>(STORAGE_KEYS.CUSTOMERS)
  );

  const [newCustomer, setNewCustomer] = useState({
    title: '',
    taxNumber: '',
    phone: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const customer: Customer = {
      id: storage.generateId(),
      title: newCustomer.title,
      taxNumber: newCustomer.taxNumber,
      phone: newCustomer.phone,
      balance: 0,
      createdAt: new Date().toISOString()
    };

    const updatedCustomers = [...customers, customer];
    storage.set(STORAGE_KEYS.CUSTOMERS, updatedCustomers);
    setCustomers(updatedCustomers);
    setNewCustomer({ title: '', taxNumber: '', phone: '' });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Cari Kartlar</h1>
      
      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Cari Ünvan</label>
              <input
                type="text"
                required
                value={newCustomer.title}
                onChange={(e) => setNewCustomer({ ...newCustomer, title: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Vergi Numarası</label>
              <input
                type="text"
                required
                value={newCustomer.taxNumber}
                onChange={(e) => setNewCustomer({ ...newCustomer, taxNumber: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Telefon</label>
              <input
                type="tel"
                required
                value={newCustomer.phone}
                onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Cari Kart Ekle
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cari Ünvan</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vergi No</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Telefon</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bakiye</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {customers.map((customer) => (
              <tr key={customer.id}>
                <td className="px-6 py-4 whitespace-nowrap">{customer.title}</td>
                <td className="px-6 py-4 whitespace-nowrap">{customer.taxNumber}</td>
                <td className="px-6 py-4 whitespace-nowrap">{customer.phone}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`font-medium ${customer.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {customer.balance.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Customers;