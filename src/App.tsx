import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import CashRegister from './pages/CashRegister';
import Customers from './pages/Customers';
import CustomerStatement from './pages/CustomerStatement';
import Products from './pages/Products';
import PurchaseInvoices from './pages/PurchaseInvoices';
import MenuCosts from './pages/MenuCosts';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="cash-register" element={<CashRegister />} />
          <Route path="customers" element={<Customers />} />
          <Route path="customer-statement" element={<CustomerStatement />} />
          <Route path="products" element={<Products />} />
          <Route path="purchase-invoices" element={<PurchaseInvoices />} />
          <Route path="menu-costs" element={<MenuCosts />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;