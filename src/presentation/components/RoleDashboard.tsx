import React, { Suspense } from 'react';
import { storage } from '../../infrastructure/utils';
import { LoadingFallback } from './LoadingFallback';

const EmployeeDashboardPage = React.lazy(() => import('../pages/Employee/Dashboard').then(m => ({ default: m.EmployeeDashboardPage })));
const TeamLeaderDashboardPage = React.lazy(() => import('../pages/TeamLeader/Dashboard').then(m => ({ default: m.TeamLeaderDashboardPage })));
const GroupLeaderDashboardPage = React.lazy(() => import('../pages/GroupLeader/Dashboard').then(m => ({ default: m.GroupLeaderDashboardPage })));
const CEODashboardPage = React.lazy(() => import('../pages/CEO/Dashboard').then(m => ({ default: m.CEODashboardPage })));

export const RoleDashboard = () => {
  const userRole = storage.getUserRole();

  const renderDashboard = () => {
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

  return (
    <Suspense fallback={<LoadingFallback />}>
      {renderDashboard()}
    </Suspense>
  );
};
