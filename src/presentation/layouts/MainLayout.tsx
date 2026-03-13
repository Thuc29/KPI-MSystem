import { Layout, Menu, Avatar, Dropdown, Badge, Tag, Drawer, Button } from 'antd';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import React, { Suspense, useState, useEffect } from 'react';
import { 
  LogOut, 
  User,
  UserCircle,
  Briefcase,
  Users,
  Crown,
  Settings,
  Bell,
  ChevronLeft,
  ChevronRight,
  Menu as MenuIcon
} from 'lucide-react';
import type { MenuProps } from 'antd';
import { storage, getRoleLabel } from '../../infrastructure/utils';
import { getMenuByRole, BRAND_COLORS } from '../../core/constants';
import { getUnreadCount } from '../../infrastructure/api/mockNotifications';
import type { UserRole } from '../../core/models';
import { LanguageSwitcher, LoadingFallback } from '../components';
import { useTranslation } from '../../infrastructure/i18n';
const { Header, Sider, Content } = Layout;

const getRoleIcon = (role: UserRole) => {
  const icons = {
    employee: UserCircle,
    tl: Briefcase,
    gl: Users,
    ceo: Crown,
  };
  return icons[role] || UserCircle;
};

const getRoleColor = (role: UserRole) => {
  const colors = {
    employee: 'blue',
    tl: 'purple',
    gl: 'orange',
    ceo: 'red',
  };
  return colors[role] || 'default';
};

export const MainLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const userName = storage.getUserName() || 'User';
  const userRole = storage.getUserRole() || 'employee';
  const userId = storage.getUserId() || '1';
  const [unreadCount, setUnreadCount] = useState(0);
  const [collapsed, setCollapsed] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Update unread count
    const count = getUnreadCount(userId);
    setUnreadCount(count);

    // Poll for updates every 30 seconds
    const interval = setInterval(() => {
      const newCount = getUnreadCount(userId);
      setUnreadCount(newCount);
    }, 30000);

    return () => clearInterval(interval);
  }, [userId]);

  const handleLogout = () => {
    storage.clearAll();
    navigate('/login');
  };

  const RoleIcon = getRoleIcon(userRole);

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <User size={16} />,
      label: t.sidebar.profile,
      onClick: () => navigate('/profile'),
    },
    {
      key: 'settings',
      icon: <Settings size={16} />,
      label: t.sidebar.settings,
      onClick: () => navigate('/settings'),
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogOut size={16} />,
      label: t.sidebar.logout,
      onClick: handleLogout,
      danger: true,
    },
  ];

  // Get menu items based on user role
  const roleMenuItems = getMenuByRole(userRole);
  
  const handleMenuClick = (path: string) => {
    navigate(path);
    if (mobileMenuOpen) {
      setMobileMenuOpen(false);
    }
  };

  // Helper function to get label from translation key
  const getLabel = (labelKey: string) => {
    const keys = labelKey.split('.');
    let value: any = t;
    for (const key of keys) {
      value = value[key];
    }
    return value;
  };

  const menuItems: MenuProps['items'] = roleMenuItems.map(item => ({
    key: item.path,
    icon: item.icon,
    label: getLabel(item.labelKey),
    onClick: () => handleMenuClick(item.path),
    children: item.children?.map(child => ({
      key: child.path,
      icon: child.icon,
      label: getLabel(child.labelKey),
      onClick: () => handleMenuClick(child.path),
    })),
  }));

  return (
    <Layout className="min-h-screen"> 
      <Sider
        breakpoint="md"
        collapsedWidth="0"
        width={280}
        collapsed={collapsed}
        className="hidden md:block bg-[url('./images/sibarbg.jpg')] bg-cover fixed top-0 bottom-0 left-0 overflow-auto glassmorphism-sidebar transition-all duration-300 z-50"
        style={{
          transform: collapsed ? 'translateX(-100%)' : 'translateX(0)',
        }}
      >
        {/* Logo Section */}
        <div className="mt-2 px-2 rounded-2xl  w-fit mx-auto">
          <Link to={"/"} className="flex items-center justify-center"> 
            <img 
              src='./images/logoW.png' 
              alt="Smart KPI Logo" 
              className="h-[50px] w-auto object-contain transform transition-all duration-300 hover:scale-105"
            />
          </Link>
        </div>

        {/* Menu */}
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          defaultOpenKeys={roleMenuItems.filter(item => item.children).map(item => item.path)}
          items={menuItems}
          className="border-r-0 px-3"
        />

        {/* Bottom Info */}
        <div className="absolute bottom-0 left-0 right-0">
          <div className="glassmorphism-info text-xs text-center">
            <p className="font-semibold mb-1">{t.sidebar.support}</p>
            <p>{t.sidebar.contactTeam}</p>
          </div>
        </div>
      </Sider>

      {/* Toggle Button - Always visible on desktop */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="hidden md:flex fixed top-14 w-8 h-8 bg-white/50 rounded-full shadow-lg items-center justify-center hover:bg-gray-100 transition-all duration-300 z-[60] border border-gray-200"
        style={{
          left: collapsed ? '16px' : '290px',
        }}
      >
        {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
      </button>
      
      <Layout 
        className={`transition-all duration-300 ${!collapsed ? 'md:ml-[280px]' : ''}`}
      >
        <Header className='flex sticky h-16 top-0 z-10 items-center justify-between shadow-md py-0 md:px-6 px-2 bg-transparent backdrop-blur-sm'
        >
          <div className="flex items-center md:gap-4 gap-1">
            <Button 
              type="text" 
              icon={<MenuIcon size={24} className="text-primary" />} 
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden flex items-center justify-center mr-1"
            />
            <div>
              <h2 className="text-2xl font-bold text-primary-dark m-0">
                {t.sidebar.systemTitle}
              </h2>
              <p className="text-xs text-gray-500 m-0">
                {t.sidebar.systemSubtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            
            {/* Notifications */}
            <Badge count={unreadCount} size="small">
              <button 
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                onClick={() => navigate('/notifications')}
              >
                <Bell size={16} className="text-yellow-500" />
              </button>
            </Badge>

            {/* User Dropdown */}
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" trigger={['click']}>
              <div className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 px-2 py-2 rounded-xl transition-colors">
                <div className="text-right hidden md:block">
                  <div className="font-semibold  text-gray-800 text-sm">{userName}</div>
                  <div className="flex items-center gap-1.5">
                    <Tag 
                      color={getRoleColor(userRole)} 
                      className="m-0 text-xs flex items-center gap-1.5 px-2 py-0.5 rounded-full"
                      icon={<RoleIcon size={12} />}
                    >
                      {getRoleLabel(userRole)}
                    </Tag>
                  </div>
                </div>
                <Avatar 
                  size={35}
                  icon={<User size={20} />} 
                  className={
                    userRole === 'employee' ? 'bg-blue-500' :
                    userRole === 'tl' ? 'bg-purple-500' :
                    userRole === 'gl' ? 'bg-orange-500' :
                    'bg-red-500'
                  }
                />
              </div>
            </Dropdown>
          </div>
        </Header>
        
        <Content style={{ margin: '18px 18px 0', overflow: 'initial' }}>
          <div style={{ padding: 20, background: '#fff', minHeight: 'calc(100vh - 120px)', borderRadius: '12px' }} >
            <Suspense fallback={<LoadingFallback />}>
              <Outlet />
            </Suspense>
          </div>
        </Content>
      </Layout>

      {/* Mobile Bottom Menu */}
      <Drawer
        placement="bottom"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        height="80vh"
        closable={false}
        styles={{ body: { padding: 0 } }}
        className="md:hidden rounded-t-3xl overflow-hidden"
      >
        <div className="bg-[url('./images/sibarbg.jpg')] bg-cover h-full glassmorphism-sidebar relative">
          <div className="flex flex-col h-full pt-6 relative z-10">
            <div className="px-6 pb-2 mb-2 flex justify-between items-center w-full">
              <img 
                src='./images/logoW.png' 
                alt="Smart KPI Logo" 
                className="h-[36px] w-auto object-contain"
              />
              <button 
                onClick={() => setMobileMenuOpen(false)} 
                className="text-white hover:text-gray-200 text-sm font-medium px-4 py-2 bg-white/10 rounded-xl transition-colors hover:bg-white/20"
              >
                {t.sidebar.close}
              </button>
            </div>
            
            <div className="flex-1 overflow-auto mt-2">
              <Menu
                mode="inline"
                selectedKeys={[location.pathname]}
                defaultOpenKeys={roleMenuItems.filter(item => item.children).map(item => item.path)}
                items={menuItems}
                className="border-r-0 px-3 bg-transparent"
              />
            </div>
          </div>
        </div>
      </Drawer>
    </Layout>
  );
};
