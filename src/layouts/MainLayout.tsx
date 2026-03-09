import { Layout, Menu, Avatar, Dropdown, Badge, Tag } from 'antd';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { 
  LogOut, 
  User,
  UserCircle,
  Briefcase,
  Users,
  Crown,
  Settings,
  Bell
} from 'lucide-react';
import type { MenuProps } from 'antd';
import { storage, getRoleLabel } from '../utils';
import { getMenuByRole } from '../constants';
import { getUnreadCount } from '../services/mockNotifications';
import type { UserRole } from '../types';

const { Header, Sider, Content } = Layout;

const getRoleIcon = (role: UserRole) => {
  const icons = {
    employee: UserCircle,
    manager: Briefcase,
    hr: Users,
    ceo: Crown,
  };
  return icons[role] || UserCircle;
};

const getRoleColor = (role: UserRole) => {
  const colors = {
    employee: 'blue',
    manager: 'purple',
    hr: 'orange',
    ceo: 'red',
  };
  return colors[role] || 'default';
};

export const MainLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const userName = storage.getUserName() || 'User';
  const userRole = storage.getUserRole() || 'employee';
  const userId = storage.getUserId() || '1';
  const [unreadCount, setUnreadCount] = useState(0);

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
      label: 'Thông tin cá nhân',
      onClick: () => navigate('/profile'),
    },
    {
      key: 'settings',
      icon: <Settings size={16} />,
      label: 'Cài đặt',
      onClick: () => navigate('/settings'),
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogOut size={16} />,
      label: 'Đăng xuất',
      onClick: handleLogout,
      danger: true,
    },
  ];

  // Get menu items based on user role
  const roleMenuItems = getMenuByRole(userRole);
  
  const menuItems: MenuProps['items'] = roleMenuItems.map(item => ({
    key: item.path,
    icon: item.icon,
    label: item.label,
    onClick: () => navigate(item.path),
    children: item.children?.map(child => ({
      key: child.path,
      icon: child.icon,
      label: child.label,
      onClick: () => navigate(child.path),
    })),
  }));

  return (
    <Layout className="min-h-screen "> 
      <Sider
        breakpoint="lg"
        collapsedWidth="0"
        width={300}
        className="bg-[url('./images/sibarbg.jpg')] bg-cover fixed top-0 bottom-0 left-0 overflow-auto glassmorphism-sidebar"
      >
        {/* Logo Section */}
        <div className=" mt-2 px-2 rounded-2xl border w-fit mx-auto border-[#ffffff1a] bg-gray-300">
          <Link to={"/"} className="flex items-center justify-center"> 
            <img 
              src='./images/logo.png' 
              alt="Smart KPI Logo" 
              className="h-12 w-auto object-contain transform transition-transform duration-300 hover:scale-105" 
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
            <p className="font-semibold mb-1">Hỗ trợ</p>
            <p>Liên hệ với nhóm EA Việt Nam</p>
          </div>
        </div>
      </Sider>
      
      <Layout className='ml-[300px]'>
        <Header 
          style={{ 
            background: '#fff', 
            padding: '0 32px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            height: '72px',
          }}
        >
          <div className="flex items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold text-primary m-0">
                Hệ thống Quản lý KPI
              </h2>
              <p className="text-xs text-gray-500 m-0">
                Quản lý hiệu suất làm việc
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Notifications */}
            <Badge count={unreadCount} size="small">
              <button 
                className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                onClick={() => navigate('/notifications')}
              >
                <Bell size={18} className="text-gray-600" />
              </button>
            </Badge>

            {/* User Dropdown */}
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" trigger={['click']}>
              <div className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 px-4 py-2 rounded-xl transition-colors">
                <div className="text-right">
                  <div className="font-semibold text-gray-800 text-sm">{userName}</div>
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
                  size={40}
                  icon={<User size={20} />} 
                  className={
                    userRole === 'employee' ? 'bg-blue-500' :
                    userRole === 'manager' ? 'bg-purple-500' :
                    userRole === 'hr' ? 'bg-orange-500' :
                    'bg-red-500'
                  }
                />
              </div>
            </Dropdown>
          </div>
        </Header>
        
        <Content style={{ margin: '18px 18px 0', overflow: 'initial' }}>
          <div style={{ padding: 20, background: '#fff', minHeight: 'calc(100vh - 120px)', borderRadius: '12px' }} >
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};
