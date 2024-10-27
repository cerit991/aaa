import { useState, useMemo } from 'react';
import { Eye, Trash2, Search, ArrowUpDown, Calendar } from 'lucide-react';
import type { PurchaseInvoice, Customer, Product } from '../../types';

interface InvoiceListProps {
  invoices: PurchaseInvoice[];
  customers: Customer[];
  products: Product[];
  onView: (invoice: PurchaseInvoice) => void;
  onDelete: (invoiceId: string) => void;
  formatCurrency: (amount: number) => string;
}

function InvoiceList({ invoices, customers, products, onView, onDelete, formatCurrency }: InvoiceListProps) {
  const [customerSearch, setCustomerSearch] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [sortDirection, setSortDirection] = useState<'desc' | 'asc'>('desc');
  const [selectedMonth, setSelectedMonth] = useState('');

  const monthOptions = useMemo(() => {
    const months = [];
    // Get unique years from invoices
    const years = [...new Set(invoices.map(inv => new Date(inv.date).getFullYear()))];
    years.sort((a, b) => b - a); // Sort years descending

    for (const year of years) {
      for (let month = 0; month < 12; month++) {
        const date = new Date(year, month);
        months.push({
          value: `${year}-${String(month + 1).padStart(2, '0')}`,
          label: date.toLocaleString('tr-TR', { year: 'numeric', month: 'long' })
        });
      }
    }
    return months;
  }, [invoices]);

  const filteredInvoices = useMemo(() => {
    let filtered = invoices.filter(invoice => {
      const customer = customers.find(c => c.id === invoice.customerId);
      const customerMatch = customerSearch === '' || 
        (customer?.title && customer.title.toLowerCase().includes(customerSearch.toLowerCase()));

      const productMatch = productSearch === '' || 
        invoice.items.some(item => {
          const product = products.find(p => p.id === item.productId);
          return product?.name.toLowerCase().includes(productSearch.toLowerCase());
        });

      // Month filter
      let monthMatch = true;
      if (selectedMonth) {
        const [year, month] = selectedMonth.split('-').map(Number);
        const invoiceDate = new Date(invoice.date);
        monthMatch = invoiceDate.getFullYear() === year && 
                    invoiceDate.getMonth() + 1 === month;
      }

      return customerMatch && productMatch && monthMatch;
    });

    // Sort by date
    filtered.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortDirection === 'desc' ? dateB - dateA : dateA - dateB;
    });

    return filtered;
  }, [invoices, customers, products, customerSearch, productSearch, sortDirection, selectedMonth]);

  const toggleSortDirection = () => {
    setSortDirection(prev => prev === 'desc' ? 'asc' : 'desc');
  };

  const totalAmount = useMemo(() => {
    return filteredInvoices.reduce((sum, invoice) => sum + invoice.total, 0);
  }, [filteredInvoices]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="form-label">Cari Ara</label>
          <div className="relative">
            <input
              type="text"
              value={customerSearch}
              onChange={(e) => setCustomerSearch(e.target.value)}
              placeholder="Cari adı ile ara..."
              className="form-input pl-10"
            />
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        <div>
          <label className="form-label">Ürün Ara</label>
          <div className="relative">
            <input
              type="text"
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              placeholder="Ürün adı ile ara..."
              className="form-input pl-10"
            />
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        <div>
          <label className="form-label">Dönem</label>
          <div className="relative">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="form-input pl-10"
            >
              <option value="">Tüm Dönemler</option>
              {monthOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <Calendar className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        <div>
          <label className="form-label">Sıralama</label>
          <button
            onClick={toggleSortDirection}
            className="form-input w-full flex items-center justify-between bg-white"
          >
            <span>
              Tarih: {sortDirection === 'desc' ? 'Yeniden Eskiye' : 'Eskiden Yeniye'}
            </span>
            <ArrowUpDown className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="table-header">Fatura No</th>
              <th className="table-header">Tarih</th>
              <th className="table-header">Cari</th>
              <th className="table-header">Tutar</th>
              <th className="table-header">İşlemler</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredInvoices.map((invoice) => {
              const customer = customers.find(c => c.id === invoice.customerId);
              return (
                <tr key={invoice.id}>
                  <td className="table-cell">{invoice.invoiceNumber}</td>
                  <td className="table-cell">
                    {new Date(invoice.date).toLocaleDateString('tr-TR')}
                  </td>
                  <td className="table-cell">{customer?.title}</td>
                  <td className="table-cell">
                    {formatCurrency(invoice.total)}
                  </td>
                  <td className="table-cell space-x-2">
                    <button
                      onClick={() => onView(invoice)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => onDelete(invoice.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              );
            })}
            {filteredInvoices.length === 0 && (
              <tr>
                <td colSpan={5} className="table-cell text-center text-gray-500">
                  Fatura bulunamadı
                </td>
              </tr>
            )}
          </tbody>
          <tfoot className="bg-gray-50">
            <tr>
              <td colSpan={3} className="table-cell text-right font-medium">
                Toplam:
              </td>
              <td className="table-cell font-bold">
                {formatCurrency(totalAmount)}
              </td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

export default InvoiceList;