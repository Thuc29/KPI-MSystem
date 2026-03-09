import { useState } from 'react';
import { Card, List, Input, Button, Avatar, Tag, Empty } from 'antd';
import { MessageSquare, Send, User } from 'lucide-react';
import { storage } from '../../utils';

const { TextArea } = Input;

interface Comment {
  id: string;
  author: string;
  authorRole: string;
  content: string;
  timestamp: string;
  kpiId: string;
  kpiTitle: string;
}

export const DiscussionPage = () => {
  const userName = storage.getUserName() || 'User';
  const userRole = storage.getUserRole() || 'employee';
  
  const [comments] = useState<Comment[]>([
    {
      id: '1',
      author: 'Nguyễn Thị Lan',
      authorRole: 'Manager',
      content: 'KPI của bạn rất rõ ràng và chi tiết. Tuy nhiên, trọng số cho mục tiêu "Mở rộng mạng lưới" có thể tăng lên 35% để phù hợp hơn với chiến lược công ty.',
      timestamp: '2 giờ trước',
      kpiId: 'KPI-2026-KI-001',
      kpiTitle: 'KPI Q1/2026',
    },
    {
      id: '2',
      author: 'Trần Văn Bình',
      authorRole: 'Employee',
      content: 'Cảm ơn anh/chị đã góp ý. Em sẽ điều chỉnh lại trọng số theo hướng dẫn.',
      timestamp: '1 giờ trước',
      kpiId: 'KPI-2026-KI-001',
      kpiTitle: 'KPI Q1/2026',
    },
    {
      id: '3',
      author: 'Lê Văn Hùng',
      authorRole: 'HR',
      content: 'Các mục tiêu đã phù hợp với khung KPI của bộ phận. Đề nghị bổ sung thêm phương pháp đo lường cụ thể cho từng mục tiêu.',
      timestamp: '3 ngày trước',
      kpiId: 'KPI-2026-KI-002',
      kpiTitle: 'KPI Năm 2026',
    },
  ]);

  const [newComment, setNewComment] = useState('');

  const handleSendComment = () => {
    if (!newComment.trim()) return;
    // In real app, call API to post comment
    setNewComment('');
  };

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      employee: 'blue',
      manager: 'purple',
      hr: 'orange',
      ceo: 'red',
    };
    return colors[role.toLowerCase()] || 'default';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
          <MessageSquare size={32} className="text-primary" />
          Phản hồi & Trao đổi
        </h1>
        <p className="text-gray-500">Trao đổi và nhận phản hồi về KPI</p>
      </div>

      {/* New Comment */}
      <Card className="shadow-sm">
        <div className="flex gap-3">
          <Avatar size={40} icon={<User size={20} />} className="bg-blue-500" />
          <div className="flex-1">
            <TextArea
              rows={3}
              placeholder="Viết bình luận hoặc câu hỏi của bạn..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="mb-2"
            />
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">
                Đăng với tư cách: <strong>{userName}</strong>
              </span>
              <Button
                type="primary"
                icon={<Send size={16} />}
                onClick={handleSendComment}
                disabled={!newComment.trim()}
                className="bg-primary"
              >
                Gửi
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Comments List */}
      <Card 
        title={
          <div className="flex items-center gap-2">
            <MessageSquare size={20} className="text-primary" />
            <span>Trao đổi gần đây ({comments.length})</span>
          </div>
        }
        className="shadow-sm"
      >
        {comments.length > 0 ? (
          <List
            itemLayout="vertical"
            dataSource={comments}
            renderItem={(comment) => (
              <List.Item>
                <div className="flex gap-3">
                  <Avatar size={40} className="bg-blue-500">
                    {comment.author.charAt(0)}
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold">{comment.author}</span>
                      <Tag color={getRoleColor(comment.authorRole)}>
                        {comment.authorRole}
                      </Tag>
                      <span className="text-sm text-gray-400">
                        {comment.timestamp}
                      </span>
                    </div>
                    <div className="mb-2">
                      <Tag color="blue" className="mb-2">
                        {comment.kpiTitle}
                      </Tag>
                    </div>
                    <p className="text-gray-700">{comment.content}</p>
                  </div>
                </div>
              </List.Item>
            )}
          />
        ) : (
          <Empty description="Chưa có trao đổi nào" />
        )}
      </Card>
    </div>
  );
};
