import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FileDown } from 'lucide-react';
import type { MenuItem, Product } from '../../types';

interface MenuCostsPdfProps {
  menuItems: MenuItem[];
  products: Product[];
  searchTerm: string;
}

function MenuCostsPdf({ menuItems, products, searchTerm }: MenuCostsPdfProps) {
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('tr-TR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      useGrouping: true
    }).format(amount);
  };

  const generatePdf = () => {
    const doc = new jsPDF('p', 'pt', 'a4');

    // Enable Turkish character support
    doc.setLanguage("tr");
    doc.setFont("helvetica");
    
    // Header
    doc.setFontSize(20);
    doc.text('Maliyet Raporu', 40, 40);

    // Search info if filtering was applied
    if (searchTerm) {
      doc.setFontSize(12);
      doc.text(`Arama: "${searchTerm}"`, 40, 70);
    }

    // Calculate totals
    const totalCost = menuItems.reduce((sum, item) => sum + item.totalCost, 0);

    // Summary section
    doc.setFontSize(12);
    doc.text('Özet:', 40, searchTerm ? 100 : 70);
    doc.text(`Toplam Menü Kalemi: ${menuItems.length}`, 40, searchTerm ? 120 : 90);
    doc.text(`Toplam Maliyet: ${formatCurrency(totalCost)}`, 40, searchTerm ? 140 : 110);

    // Prepare table data
    const tableData = menuItems.map(menuItem => {
      const ingredientsList = menuItem.ingredients.map(ing => {
        const product = products.find(p => p.id === ing.productId);
        return `${product?.name}: ${ing.quantity} ${product?.unit}`;
      }).join('\n');

      return [
        menuItem.name,
        ingredientsList,
        formatCurrency(menuItem.totalCost),
        new Date(menuItem.updatedAt).toLocaleDateString('tr-TR')
      ];
    });

    // Add table
    autoTable(doc, {
      startY: searchTerm ? 170 : 140,
      head: [['Menü Kalemi', 'Hammaddeler', 'Toplam Maliyet', 'Son Güncelleme']],
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
        fontStyle: 'bold'
      },
      columnStyles: {
        0: { cellWidth: 120 },  // Menü Kalemi
        1: { cellWidth: 200 },  // Hammaddeler
        2: { cellWidth: 100, halign: 'right' },  // Maliyet
        3: { cellWidth: 100 }   // Tarih
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

    // Save the PDF
    const date = new Date().toISOString().split('T')[0];
    doc.save(`maliyet_raporu_${date}.pdf`);
  };

  return (
    <button
      onClick={generatePdf}
      className="btn-primary flex items-center gap-2"
    >
      <FileDown className="w-4 h-4" />
      Maliyet Raporu (PDF)
    </button>
  );
}

export default MenuCostsPdf;