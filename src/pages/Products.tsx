import React, { useState } from 'react';
import { storage, STORAGE_KEYS } from '../utils/storage';
import { useStorageData } from '../utils/hooks';
import type { Product } from '../types';

function Products() {
  const [products, setProducts] = useStorageData<Product>(STORAGE_KEYS.PRODUCTS);

  const [newProduct, setNewProduct] = useState({
    name: '',
    unit: 'adet',
    vatRate: 20,
    currentPrice: ''
  });

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('tr-TR', { 
      style: 'currency', 
      currency: 'TRY' 
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const product: Product = {
      id: storage.generateId(),
      name: newProduct.name,
      unit: newProduct.unit,
      vatRate: Number(newProduct.vatRate),
      currentPrice: Number(newProduct.currentPrice) || 0,
      updatedAt: new Date().toISOString()
    };

    const updatedProducts = [...products, product];
    await setProducts(updatedProducts);
    setNewProduct({ name: '', unit: 'adet', vatRate: 20, currentPrice: '' });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Stok Kartları</h1>
      
      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Ürün Adı</label>
              <input
                type="text"
                required
                value={newProduct.name}
                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Birim</label>
              <select
                value={newProduct.unit}
                onChange={(e) => setNewProduct({ ...newProduct, unit: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="adet">Adet</option>
                <option value="kg">Kilogram</option>
                <option value="lt">Litre</option>
                <option value="mt">Metre</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">KDV Oranı (%)</label>
              <select
                value={newProduct.vatRate}
                onChange={(e) => setNewProduct({ ...newProduct, vatRate: Number(e.target.value) })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="0">0</option>
                <option value="1">1</option>
                <option value="10">10</option>
                <option value="20">20</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Birim Fiyat</label>
              <input
                type="number"
                step="0.01"
                required
                value={newProduct.currentPrice}
                onChange={(e) => setNewProduct({ ...newProduct, currentPrice: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Stok Kartı Ekle
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ürün Adı</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Birim</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">KDV</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Birim Fiyat</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Son Güncelleme</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.map((product) => (
              <tr key={product.id}>
                <td className="px-6 py-4 whitespace-nowrap">{product.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{product.unit}</td>
                <td className="px-6 py-4 whitespace-nowrap">%{product.vatRate}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {formatCurrency(product.currentPrice || 0)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {new Date(product.updatedAt).toLocaleDateString('tr-TR')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Products;