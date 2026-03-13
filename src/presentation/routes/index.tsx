import React, { Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ProtectedRoute, RoleDashboard, LoadingFallback } from '../components';
import { MainLayout } from '../layouts';

const lazyPage = (importFunc: () => Promise<any>, exportName: string) => {
  return React.lazy(() => importFunc().then(module => ({ default: module[exportName] })));
};

const LoginPage = lazyPage(() => import('../pages/Shared/Login'), 'LoginPage');
const NotFoundPage = lazyPage(() => import('../pages/Shared/NotFound'), 'NotFoundPage');
const NotificationsPage = lazyPage(() => import('../pages/Shared/Notifications'), 'NotificationsPage');
const ProfilePage = lazyPage(() => import('../pages/Shared/Profile'), 'ProfilePage');
const SettingsPage = lazyPage(() => import('../pages/Shared/Settings'), 'SettingsPage');

const KPIDashboardPage = lazyPage(() => import('../pages/Employee/KPIDashboard'), 'KPIDashboardPage');
const KPIDetailPage = lazyPage(() => import('../pages/Employee/KPIDetail'), 'KPIDetailPage');
const CreateKPIPage = lazyPage(() => import('../pages/Employee/CreateKPI'), 'CreateKPIPage');
const ProgressPage = lazyPage(() => import('../pages/Employee/Progress'), 'ProgressPage');

const ApprovalPage = lazyPage(() => import('../pages/TeamLeader/Approval'), 'ApprovalPage');
const TeamManagementPage = lazyPage(() => import('../pages/TeamLeader/TeamManagement'), 'TeamManagementPage');
const TeamReportsPage = lazyPage(() => import('../pages/TeamLeader/TeamReports'), 'TeamReportsPage');

const DepartmentManagementPage = lazyPage(() => import('../pages/GroupLeader/DepartmentManagement'), 'DepartmentManagementPage');
const DepartmentReportsPage = lazyPage(() => import('../pages/GroupLeader/DepartmentReports'), 'DepartmentReportsPage');

const ExecutiveDashboardPage = lazyPage(() => import('../pages/CEO/ExecutiveDashboard'), 'ExecutiveDashboardPage');
const StrategicApprovalPage = lazyPage(() => import('../pages/CEO/StrategicApproval'), 'StrategicApprovalPage');
const OrganizationPage = lazyPage(() => import('../pages/CEO/Organization'), 'OrganizationPage');
const StrategyListPage = lazyPage(() => import('../pages/GroupLeader/StrategyList'), 'StrategyListPage');
const CreateStrategyPage = lazyPage(() => import('../pages/GroupLeader/CreateStrategy'), 'CreateStrategyPage');
const StrategyDetailPage = lazyPage(() => import('../pages/GroupLeader/StrategyDetail'), 'StrategyDetailPage');

const withSuspense = (Component: React.ComponentType<any>) => (
  <Suspense fallback={<LoadingFallback />}>
    <Component />
  </Suspense>
);

export const router = createBrowserRouter([
  {
    path: '/login',
    element: withSuspense(LoginPage),
  },
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      {
        element: <MainLayout />,
        children: [
          {
            path: '/',
            element: <Navigate to="/dashboard" replace />,
          },
          {
            path: '/dashboard',
            element: <RoleDashboard />,
          },
          {
            path: '/kpi',
            element: <KPIDashboardPage />,
          },
          {
            path: '/kpi/create',
            element: <CreateKPIPage />,
          },
          {
            path: '/kpi/:id',
            element: <KPIDetailPage />,
          },
          {
            path: '/approval',
            element: <ApprovalPage />,
          },
          // Placeholder routes for menu items
          {
            path: '/progress',
            element: <ProgressPage />,
          },
          {
            path: '/team',
            element: <TeamManagementPage />,
          },
          {
            path: '/team-management',
            element: <TeamManagementPage />,
          },
          {
            path: '/team-reports',
            element: <TeamReportsPage />,
          },
          {
            path: '/reports/team',
            element: <TeamReportsPage />,
          },
          {
            path: '/department',
            element: <DepartmentManagementPage />,
          },
          {
            path: '/reports/department',
            element: <DepartmentReportsPage />,
          },
          {
            path: '/executive',
            element: <ExecutiveDashboardPage />,
          },
          {
            path: '/strategic',
            element: <StrategicApprovalPage />,
          },
          {
            path: '/organization',
            element: <OrganizationPage />,
          },
          {
            path: '/strategy',
            element: <StrategyListPage />,
          },
          {
            path: '/strategy/create',
            element: <CreateStrategyPage />,
          },
          {
            path: '/strategy/:id',
            element: <StrategyDetailPage />,
          },
          {
            path: '/strategy/edit/:id',
            element: <CreateStrategyPage />,
          },
          {
            path: '/reports/executive',
            element: <div className="text-center py-20"><h2 className="text-2xl font-bold text-gray-400">Báo cáo Điều hành - Coming Soon</h2></div>,
          },
          {
            path: '/profile',
            element: <ProfilePage />,
          },
          {
            path: '/notifications',
            element: <NotificationsPage />,
          },
          {
            path: '/settings',
            element: <SettingsPage />,
          },
        ],
      },
    ],
  },
  {
    path: '*',
    element: withSuspense(NotFoundPage),
  },
]);
