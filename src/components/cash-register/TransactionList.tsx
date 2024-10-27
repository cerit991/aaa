import type { CashEntry, Customer } from '../../types';

interface TransactionListProps {
  entries: CashEntry[];
  customers: Customer[];
}

function TransactionList({ entries, customers }: TransactionListProps) {
  // Ensure entries is an array and sort by date in descending order
  const sortedEntries = Array.isArray(entries) ? 
    [...entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) : 
    [];

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('tr-TR', { 
      style: 'currency', 
      currency: 'TRY' 
    });
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="table-header">Tarih</th>
            <th className="table-header">Tutar</th>
            <th className="table-header">Tip</th>
            <th className="table-header">İşlem</th>
            <th className="table-header">Açıklama</th>
            <th className="table-header">Cari</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sortedEntries.map((entry) => {
            const customer = entry.customerId ? customers.find(c => c.id === entry.customerId) : null;
            return (
              <tr key={entry.id}>
                <td className="table-cell">
                  {new Date(entry.date).toLocaleDateString('tr-TR')}
                </td>
                <td className="table-cell">
                  {formatCurrency(entry.amount)}
                </td>
                <td className="table-cell">
                  {entry.type === 'cash' ? 'Nakit' : 'Kredi Kartı'}
                </td>
                <td className="table-cell">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    entry.transactionType === 'income' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {entry.transactionType === 'income' ? 'Gelir' : 'Gider'}
                  </span>
                </td>
                <td className="table-cell">{entry.description}</td>
                <td className="table-cell">{customer?.title || '-'}</td>
              </tr>
            );
          })}
          {sortedEntries.length === 0 && (
            <tr>
              <td colSpan={6} className="table-cell text-center text-gray-500">
                İşlem bulunamadı
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default TransactionList;