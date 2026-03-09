export interface INotification {
  id: string;
  type: NotificationType;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  title: string;
  message: string;
  actionUrl?: string;
  isRead: boolean;
  createdAt: string;
  recipientId: string;
  senderId?: string;
  senderName?: string;
  metadata?: {
    kpiId?: string;
    targetId?: string;
    commentId?: string;
  };
}

export type NotificationType = 
  | 'kpi_submitted'           // KPI mới được gửi
  | 'kpi_approved'            // KPI được duyệt
  | 'kpi_rejected'            // KPI bị từ chối
  | 'kpi_revision_requested'  // Yêu cầu chỉnh sửa
  | 'checkin_reminder'        // Nhắc check-in
  | 'deadline_approaching'    // Sắp đến hạn
  | 'comment_added'           // Có bình luận mới
  | 'mention'                 // Được tag (@name)
  | 'performance_alert';      // Cảnh báo hiệu suất

export interface INotificationSettings {
  userId: string;
  emailEnabled: boolean;
  pushEnabled: boolean;
  notificationTypes: {
    [key in NotificationType]: boolean;
  };
  digestFrequency: 'immediate' | 'daily' | 'weekly';
}
