import React from 'react';

interface TableProps {
  children: React.ReactNode;
  className?: string;
}

function Table({ children, className = '' }: TableProps) {
  return (
    <div className={`bg-white rounded-lg shadow overflow-hidden ${className}`}>
      <table className="min-w-full divide-y divide-gray-200">
        {children}
      </table>
    </div>
  );
}

export const TableHead = ({ children }: { children: React.ReactNode }) => (
  <thead className="bg-gray-50">
    {children}
  </thead>
);

export const TableBody = ({ children }: { children: React.ReactNode }) => (
  <tbody className="bg-white divide-y divide-gray-200">
    {children}
  </tbody>
);

export const TableRow = ({ children }: { children: React.ReactNode }) => (
  <tr>{children}</tr>
);

export const TableHeader = ({ children }: { children: React.ReactNode }) => (
  <th className="table-header">{children}</th>
);

export const TableCell = ({ children }: { children: React.ReactNode }) => (
  <td className="table-cell">{children}</td>
);

export default Table;