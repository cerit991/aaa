import React, { useState, useMemo } from 'react';
import { storage, STORAGE_KEYS } from '../utils/storage';
import type { PurchaseInvoice, Customer, Product } from '../types';
import Card from '../components/Card';
import PageTitle from '../components/PageTitle';
import InvoiceForm from '../components/purchase-invoices/InvoiceForm';
import InvoiceList from '../components/purchase-invoices/InvoiceList';
import InvoiceModal from '../components/purchase-invoices/InvoiceModal';

function PurchaseInvoices() {
  const [invoices, setInvoices] = useState<PurchaseInvoice[]>(() => 
    storage.get<PurchaseInvoice>(STORAGE_KEYS.PURCHASE_INVOICES) || []
  );
  
  const [customers] = useState<Customer[]>(() => 
    storage.get<Customer>(STORAGE_KEYS.CUSTOMERS) || []
  );
  
  const [products, setProducts] = useState<Product[]>(() => 
    storage.get<Product>(STORAGE_KEYS.PRODUCTS) || []
  );

  const [newInvoice, setNewInvoice] = useState({
    customerId: '',
    invoiceNumber: '',
    date: new Date().toISOString().split('T')[0],
    items: [{ productId: '', quantity: '', unitPrice: '', discountRate: '0', vatRate: 0 }]
  });

  const [customerSearch, setCustomerSearch] = useState('');
  const [productSearches, setProductSearches] = useState<string[]>(['']);
  const [selectedInvoice, setSelectedInvoice] = useState<PurchaseInvoice | null>(null);

  const filteredCustomers = useMemo(() => {
    if (!customerSearch?.trim()) return [];
    const searchTerm = customerSearch.toLowerCase().trim();
    return customers.filter(customer => 
      customer?.title?.toLowerCase().includes(searchTerm) ||
      customer?.taxNumber?.includes(searchTerm)
    );
  }, [customers, customerSearch]);

  const filteredProducts = useMemo(() => {
    return productSearches.map(search => {
      if (!search?.trim()) return [];
      const searchTerm = search.toLowerCase().trim();
      return products.filter(product => 
        product?.name?.toLowerCase().includes(searchTerm)
      );
    });
  }, [products, productSearches]);

  const calculateTotals = () => {
    let subtotal = 0;
    let totalDiscount = 0;
    let totalVat = 0;

    newInvoice.items.forEach(item => {
      if (!item.quantity || !item.unitPrice) return;

      const quantity = parseFloat(item.quantity) || 0;
      const unitPrice = parseFloat(item.unitPrice) || 0;
      const discountRate = parseFloat(item.discountRate) || 0;
      const vatRate = item.vatRate || 0;

      const lineTotal = quantity * unitPrice;
      const lineDiscount = (lineTotal * discountRate) / 100;
      const afterDiscount = lineTotal - lineDiscount;
      const lineVat = (afterDiscount * vatRate) / 100;

      subtotal += lineTotal;
      totalDiscount += lineDiscount;
      totalVat += lineVat;
    });

    const total = subtotal - totalDiscount + totalVat;

    return {
      subtotal,
      totalDiscount,
      totalVat,
      total
    };
  };

  const formatCurrency = (amount: number | undefined | null): string => {
    if (typeof amount !== 'number') return '₺0,00';
    return amount.toLocaleString('tr-TR', { 
      style: 'currency', 
      currency: 'TRY',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const totals = calculateTotals();
    const items = newInvoice.items
      .filter(item => item.productId && item.quantity && item.unitPrice)
      .map(item => {
        const quantity = parseFloat(item.quantity) || 0;
        const unitPrice = parseFloat(item.unitPrice) || 0;
        const discountRate = parseFloat(item.discountRate) || 0;
        const vatRate = item.vatRate || 0;

        const lineTotal = quantity * unitPrice;
        const lineDiscount = (lineTotal * discountRate) / 100;
        const afterDiscount = lineTotal - lineDiscount;
        const lineVat = (afterDiscount * vatRate) / 100;

        return {
          id: storage.generateId(),
          productId: item.productId,
          quantity,
          unitPrice,
          discountRate,
          vatRate,
          total: afterDiscount + lineVat
        };
      });

    if (!newInvoice.customerId || items.length === 0) {
      alert('Lütfen cari ve en az bir ürün seçin.');
      return;
    }

    const invoice: PurchaseInvoice = {
      id: storage.generateId(),
      customerId: newInvoice.customerId,
      invoiceNumber: newInvoice.invoiceNumber,
      date: newInvoice.date,
      items,
      total: totals.total,
      createdAt: new Date().toISOString()
    };

    // Update customer balance
    const updatedCustomers = customers.map(customer => {
      if (customer.id === invoice.customerId) {
        return {
          ...customer,
          balance: customer.balance + totals.total
        };
      }
      return customer;
    });
    storage.set(STORAGE_KEYS.CUSTOMERS, updatedCustomers);

    // Update product prices
    const updatedProducts = products.map(product => {
      const invoiceItem = items.find(item => item.productId === product.id);
      if (invoiceItem) {
        return {
          ...product,
          currentPrice: invoiceItem.unitPrice,
          updatedAt: new Date().toISOString()
        };
      }
      return product;
    });
    storage.set(STORAGE_KEYS.PRODUCTS, updatedProducts);
    setProducts(updatedProducts);

    const updatedInvoices = [...invoices, invoice];
    storage.set(STORAGE_KEYS.PURCHASE_INVOICES, updatedInvoices);
    setInvoices(updatedInvoices);

    // Reset form
    setNewInvoice({
      customerId: '',
      invoiceNumber: '',
      date: new Date().toISOString().split('T')[0],
      items: [{ productId: '', quantity: '', unitPrice: '', discountRate: '0', vatRate: 0 }]
    });
    setCustomerSearch('');
    setProductSearches(['']);
  };

  const handleDelete = (invoiceId: string) => {
    const invoice = invoices.find(inv => inv.id === invoiceId);
    if (!invoice) return;

    if (!confirm('Bu faturayı silmek istediğinize emin misiniz?')) return;

    // Update customer balance
    const updatedCustomers = customers.map(customer => {
      if (customer.id === invoice.customerId) {
        return {
          ...customer,
          balance: customer.balance - invoice.total
        };
      }
      return customer;
    });
    storage.set(STORAGE_KEYS.CUSTOMERS, updatedCustomers);

    // Remove invoice
    const updatedInvoices = invoices.filter(inv => inv.id !== invoiceId);
    storage.set(STORAGE_KEYS.PURCHASE_INVOICES, updatedInvoices);
    setInvoices(updatedInvoices);
  };

  const handleCustomerSelect = (customerId: string, title: string) => {
    setNewInvoice({ ...newInvoice, customerId });
    setCustomerSearch(title);
  };

  const handleProductSelect = (index: number, productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const updatedItems = [...newInvoice.items];
    updatedItems[index] = {
      ...updatedItems[index],
      productId,
      unitPrice: product.currentPrice.toString(),
      vatRate: product.vatRate
    };
    setNewInvoice({ ...newInvoice, items: updatedItems });

    const newSearches = [...productSearches];
    newSearches[index] = product.name;
    setProductSearches(newSearches);
  };

  return (
    <div className="space-y-6">
      <PageTitle>Alış Faturaları</PageTitle>
      
      <Card>
        <InvoiceForm
          newInvoice={newInvoice}
          customerSearch={customerSearch}
          productSearches={productSearches}
          filteredCustomers={filteredCustomers}
          filteredProducts={filteredProducts}
          totals={calculateTotals()}
          onSubmit={handleSubmit}
          onCustomerSearchChange={setCustomerSearch}
          onCustomerSelect={handleCustomerSelect}
          onInvoiceChange={(field, value) => setNewInvoice({ ...newInvoice, [field]: value })}
          onProductSearchChange={(index, value) => {
            const newSearches = [...productSearches];
            newSearches[index] = value;
            setProductSearches(newSearches);
          }}
          onProductSelect={handleProductSelect}
          onItemChange={(index, field, value) => {
            const updatedItems = [...newInvoice.items];
            updatedItems[index] = { ...updatedItems[index], [field]: value };
            setNewInvoice({ ...newInvoice, items: updatedItems });
          }}
          onAddItem={() => {
            setNewInvoice({
              ...newInvoice,
              items: [...newInvoice.items, { productId: '', quantity: '', unitPrice: '', discountRate: '0', vatRate: 0 }]
            });
            setProductSearches([...productSearches, '']);
          }}
          onRemoveItem={(index) => {
            const updatedItems = newInvoice.items.filter((_, i) => i !== index);
            setNewInvoice({ ...newInvoice, items: updatedItems });
            const updatedSearches = productSearches.filter((_, i) => i !== index);
            setProductSearches(updatedSearches);
          }}
          formatCurrency={formatCurrency}
        />
      </Card>

      <InvoiceList
        invoices={invoices}
        customers={customers}
        products={products}
        onView={setSelectedInvoice}
        onDelete={handleDelete}
        formatCurrency={formatCurrency}
      />

      {selectedInvoice && (
        <InvoiceModal
          invoice={selectedInvoice}
          customers={customers}
          products={products}
          onClose={() => setSelectedInvoice(null)}
          formatCurrency={formatCurrency}
        />
      )}
    </div>
  );
}

export default PurchaseInvoices;