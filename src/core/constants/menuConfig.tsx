import { 
  LayoutDashboard, 
  FilePlus, 
  FileText,
  CheckSquare,
  Users,
  BarChart3,
  Bell,
  Target,
  TrendingUp,
  Building2,
  PieChart,
  Activity
} from 'lucide-react';
import type { UserRole } from '../models';

export interface MenuItem {
  key: string;
  icon: React.ReactNode;
  labelKey: string; // Changed from label to labelKey for i18n
  path: string;
  roles: UserRole[];
  children?: MenuItem[];
}

export const menuConfig: MenuItem[] = [
  // Employee Menu
  {
    key: 'dashboard',
    icon: <LayoutDashboard size={18} />,
    labelKey: 'menu.dashboard',
    path: '/dashboard',
    roles: ['employee', 'tl', 'gl', 'ceo'],
  },
  {
    key: 'my-kpi',
    icon: <FileText size={18} />,
    labelKey: 'menu.myKPI',
    path: '/kpi',
    roles: ['employee', 'tl'],
    children: [
      {
        key: 'kpi-list',
        icon: <FileText size={16} />,
        labelKey: 'menu.kpiList',
        path: '/kpi',
        roles: ['employee', 'tl'],
      },
      {
        key: 'kpi-create',
        icon: <FilePlus size={16} />,
        labelKey: 'menu.createKPI',
        path: '/kpi/create',
        roles: ['employee', 'tl'],
      },
    ],
  },
  {
    key: 'progress',
    icon: <TrendingUp size={18} />,
    labelKey: 'menu.progress',
    path: '/progress',
    roles: ['employee', 'tl'],
  },
  
  // Team Leader Menu
  {
    key: 'approval',
    icon: <CheckSquare size={18} />,
    labelKey: 'menu.approval',
    path: '/approval',
    roles: ['tl', 'gl'],
  },
  {
    key: 'team-management',
    icon: <Users size={18} />,
    labelKey: 'menu.teamManagement',
    path: '/team-management',
    roles: ['tl'],
  },
  {
    key: 'team-reports',
    icon: <BarChart3 size={18} />,
    labelKey: 'menu.teamReports',
    path: '/reports/team',
    roles: ['tl'],
  },
  
  // Group Leader menu
  {
    key: 'strategic-plan',
    icon: <Target size={18} />,
    labelKey: 'menu.strategy',
    path: '/strategy',
    roles: ['gl'],
    children: [
      {
        key: 'strategy-list',
        icon: <FileText size={16} />,
        labelKey: 'menu.strategyList',
        path: '/strategy',
        roles: ['gl'],
      },
      {
        key: 'strategy-create',
        icon: <FilePlus size={16} />,
        labelKey: 'menu.createStrategy',
        path: '/strategy/create',
        roles: ['gl'],
      },
    ],
  },
  {
    key: 'department-management',
    icon: <Building2 size={18} />,
    labelKey: 'menu.departmentManagement',
    path: '/department',
    roles: ['gl'],
  },
  {
    key: 'department-reports',
    icon: <PieChart size={18} />,
    labelKey: 'menu.departmentReports',
    path: '/reports/department',
    roles: ['gl'],
  },

  
  // CEO Menu
  {
    key: 'executive-dashboard',
    icon: <Activity size={18} />,
    labelKey: 'menu.executiveDashboard',
    path: '/executive',
    roles: ['ceo'],
  },
  {
    key: 'strategic-approval',
    icon: <Target size={18} />,
    labelKey: 'menu.strategicApproval',
    path: '/strategic',
    roles: ['ceo'],
  },
  {
    key: 'organization',
    icon: <Building2 size={18} />,
    labelKey: 'menu.organization',
    path: '/organization',
    roles: ['ceo'],
  },
  {
    key: 'notifications',
    icon: <Bell size={18} />,
    labelKey: 'menu.notifications',
    path: '/notifications',
    roles: ['employee', 'tl', 'gl', 'ceo'],
  },
];

export const getMenuByRole = (role: UserRole): MenuItem[] => {
  return menuConfig.filter(item => item.roles.includes(role));
};
