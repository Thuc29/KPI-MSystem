import { storage } from '../../infrastructure/utils';
import { EmployeeDashboardPage } from '../pages/EmployeeDashboard';
import { ManagerDashboardPage } from '../pages/ManagerDashboard';

export const RoleDashboard = () => {
  const userRole = storage.getUserRole();

  switch (userRole) {
    case 'employee':
      return <EmployeeDashboardPage />;
    case 'manager':
    case 'hr':
    case 'ceo':
      return <ManagerDashboardPage />;
    default:
      return <EmployeeDashboardPage />;
  }
};
