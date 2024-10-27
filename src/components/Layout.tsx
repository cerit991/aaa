import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Wallet, 
  Users, 
  Package, 
  FileText, 
  UtensilsCrossed,
  FileSpreadsheet
} from 'lucide-react';

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/cash-register', icon: Wallet, label: 'Kasa' },
  { path: '/customers', icon: Users, label: 'Cariler' },
  { path: '/customer-statement', icon: FileSpreadsheet, label: 'Hesap Ekstresi' },
  { path: '/products', icon: Package, label: 'Stok Kartları' },
  { path: '/purchase-invoices', icon: FileText, label: 'Alış Faturaları' },
  { path: '/menu-costs', icon: UtensilsCrossed, label: 'Maliyet Raporu' },
];

export default function Layout() {
  const location = useLocation();

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-64 bg-white shadow-md">
        <div className="p-4">
          <h1 className="text-xl font-bold text-gray-800">Muhasebe</h1>
        </div>
        <nav className="mt-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 ${
                  isActive ? 'bg-blue-50 text-blue-600' : ''
                }`}
              >
                <Icon className="w-5 h-5 mr-3" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
      
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}