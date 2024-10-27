import React, { useState } from 'react';
import type { Customer, Product } from '../../types';

interface InvoiceFormProps {
  newInvoice: {
    customerId: string;
    invoiceNumber: string;
    date: string;
    items: {
      productId: string;
      quantity: string;
      unitPrice: string;
      discountRate: string;
      vatRate: number;
    }[];
  };
  customerSearch: string;
  productSearches: string[];
  filteredCustomers: Customer[];
  filteredProducts: Product[][];
  totals: {
    subtotal: number;
    totalDiscount: number;
    totalVat: number;
    total: number;
  };
  onSubmit: (e: React.FormEvent) => void;
  onCustomerSearchChange: (value: string) => void;
  onCustomerSelect: (customerId: string, title: string) => void;
  onInvoiceChange: (field: string, value: string) => void;
  onProductSearchChange: (index: number, value: string) => void;
  onProductSelect: (index: number, productId: string) => void;
  onItemChange: (index: number, field: string, value: string) => void;
  onAddItem: () => void;
  onRemoveItem: (index: number) => void;
  formatCurrency: (amount: number) => string;
}

function InvoiceForm({
  newInvoice,
  customerSearch,
  productSearches,
  filteredCustomers,
  filteredProducts,
  totals,
  onSubmit,
  onCustomerSearchChange,
  onCustomerSelect,
  onInvoiceChange,
  onProductSearchChange,
  onProductSelect,
  onItemChange,
  onAddItem,
  onRemoveItem,
  formatCurrency
}: InvoiceFormProps) {
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [showProductDropdowns, setShowProductDropdowns] = useState<boolean[]>([]);

  const handleCustomerSelect = (customerId: string, title: string) => {
    onCustomerSelect(customerId, title);
    setShowCustomerDropdown(false);
  };

  const handleCustomerSearchFocus = () => {
    setShowCustomerDropdown(true);
  };

  const handleCustomerSearchChange = (value: string) => {
    onCustomerSearchChange(value);
    setShowCustomerDropdown(true);
  };

  const handleProductSelect = (index: number, productId: string) => {
    onProductSelect(index, productId);
    const newShowProductDropdowns = [...showProductDropdowns];
    newShowProductDropdowns[index] = false;
    setShowProductDropdowns(newShowProductDropdowns);
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="form-label">Cari</label>
          <div className="relative">
            <input
              type="text"
              value={customerSearch}
              onChange={(e) => handleCustomerSearchChange(e.target.value)}
              onFocus={handleCustomerSearchFocus}
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
          <label className="form-label">Fatura No</label>
          <input
            type="text"
            required
            value={newInvoice.invoiceNumber}
            onChange={(e) => onInvoiceChange('invoiceNumber', e.target.value)}
            className="form-input"
          />
        </div>

        <div>
          <label className="form-label">Tarih</label>
          <input
            type="date"
            required
            value={newInvoice.date}
            onChange={(e) => onInvoiceChange('date', e.target.value)}
            className="form-input"
          />
        </div>
      </div>

      <div className="space-y-4">
        {newInvoice.items.map((item, index) => (
          <div key={index} className="grid grid-cols-1 md:grid-cols-6 gap-4 p-4 border rounded-lg">
            <div className="md:col-span-2">
              <label className="form-label">Ürün</label>
              <div className="relative">
                <input
                  type="text"
                  value={productSearches[index]}
                  onChange={(e) => {
                    onProductSearchChange(index, e.target.value);
                    const newShowProductDropdowns = [...showProductDropdowns];
                    newShowProductDropdowns[index] = true;
                    setShowProductDropdowns(newShowProductDropdowns);
                  }}
                  onFocus={() => {
                    const newShowProductDropdowns = [...showProductDropdowns];
                    newShowProductDropdowns[index] = true;
                    setShowProductDropdowns(newShowProductDropdowns);
                  }}
                  placeholder="Ürün ara..."
                  className="form-input"
                />
                {showProductDropdowns[index] && productSearches[index] && filteredProducts[index]?.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg max-h-60 overflow-auto">
                    {filteredProducts[index].map(product => (
                      <div
                        key={product.id}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => handleProductSelect(index, product.id)}
                      >
                        <div>{product.name}</div>
                        <div className="text-sm text-gray-600">
                          {formatCurrency(product.currentPrice)} / {product.unit}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="form-label">Miktar</label>
              <input
                type="number"
                step="0.01"
                required
                value={item.quantity}
                onChange={(e) => onItemChange(index, 'quantity', e.target.value)}
                className="form-input"
              />
            </div>

            <div>
              <label className="form-label">Birim Fiyat</label>
              <input
                type="number"
                step="0.01"
                required
                value={item.unitPrice}
                onChange={(e) => onItemChange(index, 'unitPrice', e.target.value)}
                className="form-input"
              />
            </div>

            <div>
              <label className="form-label">İskonto (%)</label>
              <input
                type="number"
                step="0.01"
                value={item.discountRate}
                onChange={(e) => onItemChange(index, 'discountRate', e.target.value)}
                className="form-input"
              />
            </div>

            <div>
              <label className="form-label">KDV (%)</label>
              <select
                value={item.vatRate}
                onChange={(e) => onItemChange(index, 'vatRate', e.target.value)}
                className="form-input"
              >
                <option value="0">0</option>
                <option value="1">1</option>
                <option value="10">10</option>
                <option value="20">20</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="button"
                onClick={() => onRemoveItem(index)}
                className="btn-danger"
              >
                Sil
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center">
        <button
          type="button"
          onClick={onAddItem}
          className="btn-secondary"
        >
          Yeni Ürün Ekle
        </button>

        <div className="text-right space-y-2">
          <div>
            <span className="font-medium">Ara Toplam: </span>
            <span>{formatCurrency(totals.subtotal)}</span>
          </div>
          <div>
            <span className="font-medium">Toplam İskonto: </span>
            <span>{formatCurrency(totals.totalDiscount)}</span>
          </div>
          <div>
            <span className="font-medium">Toplam KDV: </span>
            <span>{formatCurrency(totals.totalVat)}</span>
          </div>
          <div className="text-lg font-bold">
            <span>Genel Toplam: </span>
            <span>{formatCurrency(totals.total)}</span>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button type="submit" className="btn-primary">
          Faturayı Kaydet
        </button>
      </div>
    </form>
  );
}

export default InvoiceForm;