import { useState, useEffect } from 'react';
import { 
  Card, 
  List, 
  Badge, 
  Button, 
  Empty, 
  Tag, 
  Space,
  Tabs,
  Dropdown,
  Tooltip
} from 'antd';
import { 
  Bell, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Clock,
  MessageSquare,
  TrendingDown,
  FileText,
  MoreVertical,
  Check,
  Trash2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { storage } from '../../../../infrastructure/utils';
import { 
  mockNotifications, 
  getNotificationsByUser, 
  getUnreadCount,
  markAsRead,
  markAllAsRead 
} from '../../../../infrastructure/api/mockNotifications';
import type { INotification, NotificationType } from '../../../../core/models';

const getNotificationIcon = (type: NotificationType) => {
  const icons = {
    kpi_submitted: <FileText size={20} className="text-blue-500" />,
    kpi_approved: <CheckCircle size={20} className="text-green-500" />,
    kpi_rejected: <XCircle size={20} className="text-red-500" />,
    kpi_revision_requested: <AlertCircle size={20} className="text-orange-500" />,
    checkin_reminder: <Clock size={20} className="text-yellow-500" />,
    deadline_approaching: <AlertCircle size={20} className="text-red-500" />,
    comment_added: <MessageSquare size={20} className="text-blue-500" />,
    mention: <MessageSquare size={20} className="text-purple-500" />,
    performance_alert: <TrendingDown size={20} className="text-orange-500" />,
  };
  return icons[type] || <Bell size={20} />;
};

const getPriorityColor = (priority: string) => {
  const colors = {
    urgent: 'red',
    high: 'orange',
    medium: 'blue',
    low: 'default',
  };
  return colors[priority as keyof typeof colors] || 'default';
};

const getPriorityLabel = (priority: string) => {
  const labels = {
    urgent: 'Khẩn cấp',
    high: 'Cao',
    medium: 'Trung bình',
    low: 'Thấp',
  };
  return labels[priority as keyof typeof labels] || priority;
};

const getTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Vừa xong';
  if (diffMins < 60) return `${diffMins} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;
  if (diffDays < 7) return `${diffDays} ngày trước`;
  return date.toLocaleDateString('vi-VN');
};

export const NotificationsPage = () => {
  const navigate = useNavigate();
  const userId = storage.getUserId() || '1';
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = () => {
    const userNotifications = getNotificationsByUser(userId);
    setNotifications(userNotifications);
  };

  const handleMarkAsRead = (notificationId: string) => {
    markAsRead(notificationId);
    loadNotifications();
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead(userId);
    loadNotifications();
  };

  const handleNotificationClick = (notification: INotification) => {
    if (!notification.isRead) {
      handleMarkAsRead(notification.id);
    }
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
  };

  const handleDelete = (notificationId: string) => {
    // In real app, call API to delete
    setNotifications(notifications.filter(n => n.id !== notificationId));
  };

  const filteredNotifications = notifications.filter(n => {
    if (activeTab === 'all') return true;
    if (activeTab === 'unread') return !n.isRead;
    if (activeTab === 'read') return n.isRead;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <Bell size={32} className="text-primary" />
            Thông báo
            {unreadCount > 0 && (
              <Badge count={unreadCount} className="ml-2" />
            )}
          </h1>
          <p className="text-gray-500">Quản lý và theo dõi thông báo của bạn</p>
        </div>
        {unreadCount > 0 && (
          <Button
            type="primary"
            icon={<Check size={16} />}
            onClick={handleMarkAllAsRead}
            className="bg-primary hover:bg-primary-dark"
          >
            Đánh dấu tất cả đã đọc
          </Button>
        )}
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <Bell size={24} className="text-blue-500" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{notifications.length}</div>
              <div className="text-sm text-gray-500">Tổng thông báo</div>
            </div>
          </div>
        </Card>

        <Card className="shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
              <AlertCircle size={24} className="text-orange-500" />
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">{unreadCount}</div>
              <div className="text-sm text-gray-500">Chưa đọc</div>
            </div>
          </div>
        </Card>

        <Card className="shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle size={24} className="text-green-500" />
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {notifications.length - unreadCount}
              </div>
              <div className="text-sm text-gray-500">Đã đọc</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Notifications List */}
      <Card className="shadow-sm">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: 'all',
              label: (
                <span className="flex items-center gap-2">
                  <Bell size={16} />
                  Tất cả
                  <Badge count={notifications.length} showZero />
                </span>
              ),
            },
            {
              key: 'unread',
              label: (
                <span className="flex items-center gap-2">
                  <AlertCircle size={16} />
                  Chưa đọc
                  <Badge count={unreadCount} showZero />
                </span>
              ),
            },
            {
              key: 'read',
              label: (
                <span className="flex items-center gap-2">
                  <CheckCircle size={16} />
                  Đã đọc
                  <Badge count={notifications.length - unreadCount} showZero color="green" />
                </span>
              ),
            },
          ]}
        />

        {filteredNotifications.length === 0 ? (
          <Empty
            description="Không có thông báo"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        ) : (
          <List
            itemLayout="horizontal"
            dataSource={filteredNotifications}
            renderItem={(notification) => (
              <List.Item
                className={`cursor-pointer hover:bg-gray-50 transition-colors px-4 ${
                  !notification.isRead ? 'bg-blue-50' : ''
                }`}
                onClick={() => handleNotificationClick(notification)}
                actions={[
                  <Dropdown
                    menu={{
                      items: [
                        {
                          key: 'read',
                          label: notification.isRead ? 'Đánh dấu chưa đọc' : 'Đánh dấu đã đọc',
                          icon: <Check size={14} />,
                          onClick: (e) => {
                            e.domEvent.stopPropagation();
                            handleMarkAsRead(notification.id);
                          },
                        },
                        {
                          key: 'delete',
                          label: 'Xóa',
                          icon: <Trash2 size={14} />,
                          danger: true,
                          onClick: (e) => {
                            e.domEvent.stopPropagation();
                            handleDelete(notification.id);
                          },
                        },
                      ],
                    }}
                    trigger={['click']}
                  >
                    <Button
                      type="text"
                      icon={<MoreVertical size={16} />}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </Dropdown>,
                ]}
              >
                <List.Item.Meta
                  avatar={
                    <div className="relative">
                      {getNotificationIcon(notification.type)}
                      {!notification.isRead && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white" />
                      )}
                    </div>
                  }
                  title={
                    <div className="flex items-center gap-2">
                      <span className={!notification.isRead ? 'font-bold' : 'font-medium'}>
                        {notification.title}
                      </span>
                      <Tag color={getPriorityColor(notification.priority)} className="text-xs">
                        {getPriorityLabel(notification.priority)}
                      </Tag>
                    </div>
                  }
                  description={
                    <div className="space-y-1">
                      <p className="text-gray-600">{notification.message}</p>
                      <div className="flex items-center gap-3 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {getTimeAgo(notification.createdAt)}
                        </span>
                        {notification.senderName && (
                          <span>Từ: {notification.senderName}</span>
                        )}
                      </div>
                    </div>
                  }
                />
              </List.Item>
            )}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Tổng ${total} thông báo`,
            }}
          />
        )}
      </Card>
    </div>
  );
};
