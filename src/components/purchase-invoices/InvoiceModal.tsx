import { X } from 'lucide-react';
import type { PurchaseInvoice, Customer, Product } from '../../types';

interface InvoiceModalProps {
  invoice: PurchaseInvoice;
  customers: Customer[];
  products: Product[];
  onClose: () => void;
  formatCurrency: (amount: number) => string;
}

function InvoiceModal({ invoice, customers, products, onClose, formatCurrency }: InvoiceModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Fatura Detayı</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="font-medium">Fatura No:</span>
              <span className="ml-2">{invoice.invoiceNumber}</span>
            </div>
            <div>
              <span className="font-medium">Tarih:</span>
              <span className="ml-2">
                {new Date(invoice.date).toLocaleDateString('tr-TR')}
              </span>
            </div>
            <div>
              <span className="font-medium">Cari:</span>
              <span className="ml-2">
                {customers.find(c => c.id === invoice.customerId)?.title}
              </span>
            </div>
          </div>

          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Ürün</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Miktar</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Birim Fiyat</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">İskonto</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">KDV</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tutar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {invoice.items.map((item, index) => {
                const product = products.find(p => p.id === item.productId);
                return (
                  <tr key={index}>
                    <td className="px-4 py-2">{product?.name}</td>
                    <td className="px-4 py-2">{item.quantity}</td>
                    <td className="px-4 py-2">{formatCurrency(item.unitPrice)}</td>
                    <td className="px-4 py-2">%{item.discountRate}</td>
                    <td className="px-4 py-2">%{item.vatRate}</td>
                    <td className="px-4 py-2">{formatCurrency(item.total)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="text-right">
            <span className="font-bold">Toplam: </span>
            <span>{formatCurrency(invoice.total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InvoiceModal;