import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ProtectedRoute, RoleDashboard } from '../components';
import { MainLayout } from '../layouts';
import {
  LoginPage,
  KPIDashboardPage,
  KPIDetailPage,
  CreateKPIPage,
  NotFoundPage,
  ApprovalPage,
  NotificationsPage,
  ProgressPage,
  TeamManagementPage,
  ProfilePage,
  SettingsPage,
  TeamReportsPage,
  DepartmentManagementPage,
  DepartmentReportsPage,
  ExecutiveDashboardPage,
  StrategicApprovalPage,
  OrganizationPage,
} from '../pages';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
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
    element: <NotFoundPage />,
  },
]);
