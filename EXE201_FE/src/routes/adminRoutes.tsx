import Dashboard from "../components/admin/Dashboard";
import AdminPage from "../pages/Admin/AdminPage";
import AdminList from "../components/admin/AdminList";
import AdminCashFlow from "../components/admin/MoneyChart";
import { ReactElement } from 'react';

type AdminChildRoute = {
  index?: boolean;
  path?: string;
  element: ReactElement;
};

type AdminRoute = {
  path: string;
  element: ReactElement;
  children: AdminChildRoute[];
};
export const adminRoutes: AdminRoute[] = [
  {
    path: '/admin',
    element: <AdminPage />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'dashboard', element: <Dashboard /> },
      { path: 'users', element: <AdminList /> },
      { path: 'cashflow', element: <AdminCashFlow/>}
    ]
  }
]