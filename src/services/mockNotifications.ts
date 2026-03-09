import type { INotification } from '../types';

export const mockNotifications: INotification[] = [
  {
    id: 'notif-001',
    type: 'kpi_submitted',
    priority: 'urgent',
    title: 'KPI mới cần duyệt',
    message: 'Trần Văn Bình đã gửi KPI năm 2026 cần phê duyệt',
    actionUrl: '/approval',
    isRead: false,
    createdAt: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
    recipientId: '2',
    senderId: '1',
    senderName: 'Trần Văn Bình',
    metadata: {
      kpiId: 'KPI-2026-KI-002',
    },
  },
  {
    id: 'notif-002',
    type: 'checkin_reminder',
    priority: 'medium',
    title: 'Nhắc nhở Check-in KPI',
    message: 'Bạn chưa cập nhật tiến độ KPI Q1/2026. Vui lòng check-in trước ngày 15/03',
    actionUrl: '/progress',
    isRead: false,
    createdAt: new Date(Date.now() - 18000000).toISOString(), // 5 hours ago
    recipientId: '1',
  },
  {
    id: 'notif-003',
    type: 'kpi_approved',
    priority: 'low',
    title: 'KPI đã được duyệt',
    message: 'Nguyễn Thị Lan đã phê duyệt KPI của bạn',
    actionUrl: '/kpi/KPI-2026-KI-001',
    isRead: true,
    createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    recipientId: '1',
    senderId: '2',
    senderName: 'Nguyễn Thị Lan',
    metadata: {
      kpiId: 'KPI-2026-KI-001',
    },
  },
  {
    id: 'notif-004',
    type: 'comment_added',
    priority: 'medium',
    title: 'Bình luận mới',
    message: 'Nguyễn Thị Lan đã thêm nhận xét vào KPI của bạn',
    actionUrl: '/kpi/KPI-2026-KI-001',
    isRead: true,
    createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    recipientId: '1',
    senderId: '2',
    senderName: 'Nguyễn Thị Lan',
    metadata: {
      kpiId: 'KPI-2026-KI-001',
    },
  },
  {
    id: 'notif-005',
    type: 'performance_alert',
    priority: 'high',
    title: 'Cảnh báo hiệu suất',
    message: 'Tiến độ KPI của bạn đang chậm 15% so với kế hoạch',
    actionUrl: '/progress',
    isRead: false,
    createdAt: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
    recipientId: '1',
  },
  {
    id: 'notif-006',
    type: 'kpi_rejected',
    priority: 'urgent',
    title: 'KPI bị từ chối',
    message: 'KPI của bạn đã bị từ chối. Lý do: Trọng số chưa hợp lý, cần điều chỉnh lại',
    actionUrl: '/kpi/KPI-2026-KI-003',
    isRead: false,
    createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    recipientId: '1',
    senderId: '2',
    senderName: 'Nguyễn Thị Lan',
    metadata: {
      kpiId: 'KPI-2026-KI-003',
    },
  },
  {
    id: 'notif-007',
    type: 'mention',
    priority: 'medium',
    title: 'Bạn được nhắc đến',
    message: 'Lê Thị C đã tag bạn trong một bình luận',
    actionUrl: '/kpi/KPI-2026-MK-001',
    isRead: true,
    createdAt: new Date(Date.now() - 432000000).toISOString(), // 5 days ago
    recipientId: '2',
    senderId: '5',
    senderName: 'Lê Thị C',
  },
  {
    id: 'notif-008',
    type: 'deadline_approaching',
    priority: 'high',
    title: 'Sắp đến hạn',
    message: 'KPI Q1/2026 sẽ đến hạn trong 7 ngày. Vui lòng hoàn thành check-in cuối cùng',
    actionUrl: '/progress',
    isRead: false,
    createdAt: new Date(Date.now() - 10800000).toISOString(), // 3 hours ago
    recipientId: '1',
  },
];

export const getNotificationsByUser = (userId: string): INotification[] => {
  return mockNotifications.filter(n => n.recipientId === userId);
};

export const getUnreadCount = (userId: string): number => {
  return mockNotifications.filter(n => n.recipientId === userId && !n.isRead).length;
};

export const markAsRead = (notificationId: string): void => {
  const notification = mockNotifications.find(n => n.id === notificationId);
  if (notification) {
    notification.isRead = true;
  }
};

export const markAllAsRead = (userId: string): void => {
  mockNotifications
    .filter(n => n.recipientId === userId)
    .forEach(n => n.isRead = true);
};
