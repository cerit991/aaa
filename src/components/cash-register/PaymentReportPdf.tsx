import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FileDown } from 'lucide-react';
import type { CashEntry, Customer } from '../../types';

interface PaymentReportPdfProps {
  payments: CashEntry[];
  customers: Customer[];
  dateRange: {
    start: string;
    end: string;
  };
}

function PaymentReportPdf({ payments, customers, dateRange }: PaymentReportPdfProps) {
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('tr-TR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      useGrouping: true
    }).format(amount);
  };

  const calculateCashBalance = (entries: CashEntry[]): { cash: number; creditCard: number } => {
    return entries.reduce((acc, entry) => {
      const amount = entry.transactionType === 'income' ? entry.amount : -entry.amount;
      if (entry.type === 'cash') {
        acc.cash += amount;
      } else {
        acc.creditCard += amount;
      }
      return acc;
    }, { cash: 0, creditCard: 0 });
  };

  const calculateTotalCustomerDebts = (): number => {
    return customers.reduce((total, customer) => total + customer.balance, 0);
  };

  const generatePdf = () => {
    const doc = new jsPDF('p', 'pt', 'a4');

    // Enable Turkish character support
    doc.setLanguage("tr");
    doc.setFont("helvetica");
    
    // Header
    doc.setFontSize(20);
    doc.text('Ödeme Raporu', 40, 40);

    // Date range
    doc.setFontSize(12);
    const dateText = `Dönem: ${dateRange.start ? new Date(dateRange.start).toLocaleDateString('tr-TR') : ''} - ${dateRange.end ? new Date(dateRange.end).toLocaleDateString('tr-TR') : ''}`;
    doc.text(dateText, 40, 70);

    // Filter payments by date range and type
    const filteredPayments = payments.filter(payment => {
      const paymentDate = new Date(payment.date);
      const startDate = dateRange.start ? new Date(dateRange.start) : new Date(0);
      const endDate = dateRange.end ? new Date(dateRange.end) : new Date();
      endDate.setHours(23, 59, 59, 999);

      return (
        paymentDate >= startDate && 
        paymentDate <= endDate && 
        payment.transactionType === 'expense'
      );
    });

    // Calculate totals by payment type
    const totals = {
      cash: filteredPayments
        .filter(p => p.type === 'cash')
        .reduce((sum, p) => sum + p.amount, 0),
      creditCard: filteredPayments
        .filter(p => p.type === 'credit_card')
        .reduce((sum, p) => sum + p.amount, 0)
    };

    // Calculate current cash balance and total debts
    const currentBalance = calculateCashBalance(payments);
    const totalCustomerDebts = calculateTotalCustomerDebts();

    // Summary section
    doc.text('Özet:', 40, 100);
    doc.text(`Nakit Ödemeler: ${formatCurrency(totals.cash)}`, 40, 120);
    doc.text(`K.Kart Ödemeleri: ${formatCurrency(totals.creditCard)}`, 40, 140);
    doc.text(`Toplam Ödemeler: ${formatCurrency(totals.cash + totals.creditCard)}`, 40, 160);
    
    // Current balance section
    doc.text('Güncel Kasa Durumu:', 400, 640);
    doc.text(`Nakit: ${formatCurrency(currentBalance.cash)}`, 400, 660);
    doc.text(`Kredi Kart: ${formatCurrency(currentBalance.creditCard)}`, 400, 680);
    doc.text(`Toplam: ${formatCurrency(currentBalance.cash + currentBalance.creditCard)}`, 400, 700);

    // Customer debts section
    doc.text('Cari Hesap Durumu:', 400, 1000);
    doc.text(`Toplam Cari Borçlar: ${formatCurrency(totalCustomerDebts)}`, 400, 120);
    doc.text(`Kalan Net Durum: ${formatCurrency((currentBalance.cash + currentBalance.creditCard) - totalCustomerDebts)}`, 400, 140);

    // Add table with payment details
    const tableData = filteredPayments.map(payment => {
      const customer = customers.find(c => c.id === payment.customerId);
      return [
        new Date(payment.date).toLocaleDateString('tr-TR'),
        customer?.title || '-',
        payment.type === 'cash' ? 'Nakit' : 'Kredi Kart',
        payment.description,
        formatCurrency(payment.amount)
      ];
    });

    // Add table
    autoTable(doc, {
      startY: 200, // Moved down to accommodate new customer debts section
      head: [['Tarih', 'Cari', 'Ödeme Tipi', 'Açiklama', 'Tutar']],
      body: tableData,
      theme: 'grid',
      styles: {
        font: 'helvetica',
        fontSize: 10,
        cellPadding: 5,
        overflow: 'linebreak',
        halign: 'left',
        textColor: [0, 0, 0],
        minCellHeight: 20,
        valign: 'middle'
      },
      headStyles: {
        fillColor: [66, 66, 66],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'left'
      },
      columnStyles: {
        0: { cellWidth: 80 },  // Tarih
        1: { cellWidth: 150 }, // Cari
        2: { cellWidth: 80 },  // Ödeme Tipi
        3: { cellWidth: 150 }, // Açıklama
        4: { cellWidth: 80, halign: 'right' }   // Tutar
      },
      didDrawPage: (data) => {
        // Add page number
        const str = `Sayfa ${doc.getCurrentPageInfo().pageNumber}`;
        doc.setFontSize(10);
        doc.text(str, data.settings.margin.left, doc.internal.pageSize.height - 20);
        
        // Add date
        const now = new Date().toLocaleString('tr-TR');
        doc.text(now, 40, doc.internal.pageSize.height - 10);
      },
      willDrawCell: (data) => {
        // Ensure proper encoding for Turkish characters
        if (data.cell.text) {
          data.cell.text = data.cell.text.map(text => 
            typeof text === 'string' ? decodeURIComponent(encodeURIComponent(text)) : text
          );
        }
      }
    });

    // Save the PDF
    const date = new Date().toISOString().split('T')[0];
    doc.save(`odeme_raporu_${date}.pdf`);
  };

  return (
    <button
      onClick={generatePdf}
      className="btn-primary flex items-center gap-2"
    >
      <FileDown className="w-4 h-4" />
      Ödeme Raporu (PDF)
    </button>
  );
}

export default PaymentReportPdf;