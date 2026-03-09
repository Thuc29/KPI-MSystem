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
import type { UserRole } from '../types';

export interface MenuItem {
  key: string;
  icon: React.ReactNode;
  label: string;
  path: string;
  roles: UserRole[];
  children?: MenuItem[];
}

export const menuConfig: MenuItem[] = [
  // Employee Menu
  {
    key: 'dashboard',
    icon: <LayoutDashboard size={18} />,
    label: 'Dashboard',
    path: '/dashboard',
    roles: ['employee', 'manager', 'hr', 'ceo'],
  },
  {
    key: 'my-kpi',
    icon: <FileText size={18} />,
    label: 'KPI của tôi',
    path: '/kpi',
    roles: ['employee'],
    children: [
      {
        key: 'kpi-list',
        icon: <FileText size={16} />,
        label: 'Danh sách KPI',
        path: '/kpi',
        roles: ['employee'],
      },
      {
        key: 'kpi-create',
        icon: <FilePlus size={16} />,
        label: 'Tạo KPI mới',
        path: '/kpi/create',
        roles: ['employee'],
      },
    ],
  },
  {
    key: 'progress',
    icon: <TrendingUp size={18} />,
    label: 'Tiến độ & Check-in',
    path: '/progress',
    roles: ['employee'],
  },
  
  // Manager Menu
  {
    key: 'approval',
    icon: <CheckSquare size={18} />,
    label: 'Duyệt KPI',
    path: '/approval',
    roles: ['manager', 'hr', 'ceo'],
  },
  {
    key: 'team-management',
    icon: <Users size={18} />,
    label: 'Quản lý Team',
    path: '/team',
    roles: ['manager'],
  },
  {
    key: 'team-reports',
    icon: <BarChart3 size={18} />,
    label: 'Báo cáo Team',
    path: '/reports/team',
    roles: ['manager'],
  },
  
//hr menu
  {
    key: 'department-management',
    icon: <Building2 size={18} />,
    label: 'Quản lý Bộ phận',
    path: '/department',
    roles: ['hr'],
  },
  {
    key: 'department-reports',
    icon: <PieChart size={18} />,
    label: 'Báo cáo & Phân tích',
    path: '/reports/department',
    roles: ['hr'],
  },

  
  // CEO Menu
  {
    key: 'executive-dashboard',
    icon: <Activity size={18} />,
    label: 'Executive Dashboard',
    path: '/executive',
    roles: ['ceo'],
  },
  {
    key: 'strategic-approval',
    icon: <Target size={18} />,
    label: 'Phê duyệt Chiến lược',
    path: '/strategic',
    roles: ['ceo'],
  },
  {
    key: 'organization',
    icon: <Building2 size={18} />,
    label: 'Tổng quan Tổ chức',
    path: '/organization',
    roles: ['ceo'],
  },
  
  
  // Common Menu Items
  {
    key: 'notifications',
    icon: <Bell size={18} />,
    label: 'Thông báo',
    path: '/notifications',
    roles: ['employee', 'manager', 'hr', 'ceo'],
  },
];

export const getMenuByRole = (role: UserRole): MenuItem[] => {
  return menuConfig.filter(item => item.roles.includes(role));
};
