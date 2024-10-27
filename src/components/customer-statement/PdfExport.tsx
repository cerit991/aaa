import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FileDown } from 'lucide-react';
import type { Customer } from '../../types';

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'invoice' | 'payment';
  reference: string;
  balance: number;
}

interface PdfExportProps {
  customer: Customer;
  transactions: Transaction[];
  dateRange: {
    start: string;
    end: string;
  };
}

function PdfExport({ customer, transactions, dateRange }: PdfExportProps) {
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('tr-TR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      useGrouping: true
    }).format(amount);
  };

  const formatDescription = (transaction: Transaction): string => {
    if (transaction.type === 'invoice') {
      return `(${transaction.reference}):<- istinaden `;
    }
    return transaction.description;
  };

  const generatePdf = () => {
    const doc = new jsPDF('p', 'pt', 'a4');

    // Enable Turkish character support
    doc.setLanguage("tr");
    
    // Set font to support Turkish characters
    doc.setFont("helvetica");
    
    // Header
    doc.setFontSize(20);
    doc.text('Astethys Otelcilik Hesap Ekstresi', 40, 40);

    // Customer info
    doc.setFontSize(12);
    doc.text(`Cari: ${customer.title}`, 40, 80);
    doc.text(`Vergi No: ${customer.taxNumber}`, 40, 100);
    doc.text(`Telefon: ${customer.phone}`, 40, 120);

    // Date range
    if (dateRange.start || dateRange.end) {
      const dateText = `Dönem: ${dateRange.start ? new Date(dateRange.start).toLocaleDateString('tr-TR') : ''} - ${dateRange.end ? new Date(dateRange.end).toLocaleDateString('tr-TR') : ''}`;
      doc.text(dateText, 40, 140);
    }

    // Current balance
    doc.text(`Güncel Bakiye: ${formatCurrency(customer.balance)}`, 40, 160);

    // Table data
    const tableData = transactions.map(t => [
      new Date(t.date).toLocaleDateString('tr-TR'),
      formatDescription(t),
      t.reference,
      t.amount > 0 ? formatCurrency(t.amount) : '',
      t.amount < 0 ? formatCurrency(-t.amount) : '',
      formatCurrency(t.balance)
    ]);

    // Add table with Turkish character support
    autoTable(doc, {
      startY: 180,
      head: [['Tarih', 'Açiklama', 'Referans', 'Borç', 'Alacak', 'Bakiye']],
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
        0: { cellWidth: 70 },  // Tarih
        1: { cellWidth: 160 }, // Açıklama
        2: { cellWidth: 70 },  // Referans
        3: { cellWidth: 80, halign: 'right' },  // Borç
        4: { cellWidth: 80, halign: 'right' },  // Alacak
        5: { cellWidth: 80, halign: 'right' }   // Bakiye
      },
      didDrawPage: (data) => {
        // Add page number
        const str = `Sayfa ${doc.getCurrentPageInfo().pageNumber}`;
        doc.setFontSize(10);
        doc.text(str, data.settings.margin.left, doc.internal.pageSize.height - 10);
        
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

    // Calculate totals
    const totalDebit = transactions.reduce((sum, t) => sum + (t.amount > 0 ? t.amount : 0), 0);
    const totalCredit = transactions.reduce((sum, t) => sum + (t.amount < 0 ? -t.amount : 0), 0);

    // Add totals row
    doc.setFontSize(11);
    const finalY = (doc as any).lastAutoTable.finalY || 200;
    doc.text('Toplam:', 40, finalY + 20);
    doc.text(formatCurrency(totalDebit), 420, finalY + 20, { align: 'right' });
    doc.text(formatCurrency(totalCredit), 500, finalY + 20, { align: 'right' });
    doc.text(formatCurrency(customer.balance), 575, finalY + 20, { align: 'right' });

    // Save with proper filename
    const sanitizedTitle = customer.title
      .replace(/[^a-z0-9]/gi, '_')
      .toLowerCase();
    const date = new Date().toISOString().split('T')[0];
    doc.save(`hesap_ekstresi_${sanitizedTitle}_${date}.pdf`);
  };

  return (
    <button
      onClick={generatePdf}
      className="btn-primary flex items-center gap-2"
    >
      <FileDown className="w-4 h-4" />
      PDF İndir
    </button>
  );
}

export default PdfExport;