import { storage } from '../../infrastructure/utils';
import { EmployeeDashboardPage } from '../pages/Employee/Dashboard';
import { TeamLeaderDashboardPage } from '../pages/TeamLeader/Dashboard';
import { GroupLeaderDashboardPage } from '../pages/GroupLeader/Dashboard';
import { CEODashboardPage } from '../pages/CEO/Dashboard';

export const RoleDashboard = () => {
  const userRole = storage.getUserRole();

  switch (userRole) {
    case 'employee':
      return <EmployeeDashboardPage />;
    case 'tl':
      return <TeamLeaderDashboardPage />;
    case 'gl':
      return <GroupLeaderDashboardPage />;
    case 'ceo':
      return <CEODashboardPage />;
    default:
      return <EmployeeDashboardPage />;
  }
};
