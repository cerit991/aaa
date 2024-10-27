import React from 'react';

interface PageTitleProps {
  children: React.ReactNode;
}

function PageTitle({ children }: PageTitleProps) {
  return (
    <h1 className="text-2xl font-bold text-gray-800">{children}</h1>
  );
}

export default PageTitle;