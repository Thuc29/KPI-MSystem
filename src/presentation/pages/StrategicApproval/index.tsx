import { useState } from 'react';
import { Card, Table, Button, Modal, Tag, Space, Tabs, Input } from 'antd';
import { CheckCircle, XCircle, Eye, Clock, Target, TrendingUp } from 'lucide-react';
import type { ColumnsType } from 'antd/es/table';

const { TextArea } = Input;

interface IStrategicKPI {
  id: string;
  title: string;
  department: string;
  submittedBy: string;
  submittedAt: string;
  period: string;
  targetCount: number;
  priority: 'high' | 'medium' | 'low';
  status: 'pending_ceo' | 'approved' | 'rejected';
  description: string;
}

const mockStrategicKPIs: IStrategicKPI[] = [
  {
    id: '1',
    title: 'Chiến lược Tăng trưởng Q4/2024',
    department: 'Sales',
    submittedBy: 'Nguyễn Văn A (Manager)',
    submittedAt: '2024-03-05',
    period: 'Q4 2024',
    targetCount: 8,
    priority: 'high',
    status: 'pending_ceo',
    description: 'Kế hoạch tăng doanh thu 25% trong Q4',
  },
  {
    id: '2',
    title: 'Chiến lược Digital Marketing 2024',
    department: 'Marketing',
    submittedBy: 'Trần Thị B (Manager)',
    submittedAt: '2024-03-04',
    period: 'Yearly 2024',
    targetCount: 10,
    priority: 'high',
    status: 'pending_ceo',
    description: 'Chuyển đổi số và tăng cường online presence',
  },
  {
    id: '3',
    title: 'Nâng cấp Hệ thống IT',
    department: 'IT',
    submittedBy: 'Lê Văn C (Manager)',
    submittedAt: '2024-03-01',
    period: 'Q3 2024',
    targetCount: 6,
    priority: 'medium',
    status: 'approved',
    description: 'Modernize infrastructure và security',
  },
];

export const StrategicApprovalPage = () => {
  const [kpis, setKpis] = useState<IStrategicKPI[]>(mockStrategicKPIs);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedKPI, setSelectedKPI] = useState<IStrategicKPI | null>(null);
  const [reason, setReason] = useState('');

  const handleView = (record: IStrategicKPI) => {
    setSelectedKPI(record);
    setIsModalOpen(true);
    setReason('');
  };

  const handleAction = (type: 'approve' | 'reject') => {
    if (!selectedKPI) return;

    setKpis(prev => prev.map(k => 
      k.id === selectedKPI.id 
        ? { ...k, status: type === 'approve' ? 'approved' : 'rejected' }
        : k
    ));

    setIsModalOpen(false);
    setReason('');
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      high: 'red',
      medium: 'orange',
      low: 'blue',
    };
    return colors[priority as keyof typeof colors] || 'default';
  };

  const getPriorityLabel = (priority: string) => {
    const labels = {
      high: 'Cao',
      medium: 'Trung bình',
      low: 'Thấp',
    };
    return labels[priority as keyof typeof labels] || priority;
  };

  const columns: ColumnsType<IStrategicKPI> = [
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
      render: (text) => <span className="font-semibold">{text}</span>,
    },
    {
      title: 'Bộ phận',
      dataIndex: 'department',
      key: 'department',
      render: (text) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: 'Người gửi',
      dataIndex: 'submittedBy',
      key: 'submittedBy',
    },
    {
      title: 'Kỳ',
      dataIndex: 'period',
      key: 'period',
    },
    {
      title: 'Số mục tiêu',
      dataIndex: 'targetCount',
      key: 'targetCount',
      align: 'center',
      render: (count) => (
        <div className="flex items-center justify-center gap-1">
          <Target size={14} className="text-gray-500" />
          <span>{count}</span>
        </div>
      ),
    },
    {
      title: 'Độ ưu tiên',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority) => (
        <Tag color={getPriorityColor(priority)}>
          {getPriorityLabel(priority)}
        </Tag>
      ),
    },
    {
      title: 'Ngày gửi',
      dataIndex: 'submittedAt',
      key: 'submittedAt',
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button 
            type="link" 
            icon={<Eye size={16} />}
            onClick={() => handleView(record)}
          >
            Xem chi tiết
          </Button>
        </Space>
      ),
    },
  ];

  const pendingKPIs = kpis.filter(k => k.status === 'pending_ceo');
  const approvedKPIs = kpis.filter(k => k.status === 'approved');
  const rejectedKPIs = kpis.filter(k => k.status === 'rejected');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Phê duyệt Chiến lược</h1>
        <p className="text-gray-600 mt-1">Phê duyệt các KPI chiến lược cấp công ty</p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Chờ phê duyệt</p>
              <p className="text-3xl font-bold text-orange-600">{pendingKPIs.length}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <Clock size={24} className="text-orange-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Đã phê duyệt</p>
              <p className="text-3xl font-bold text-green-600">{approvedKPIs.length}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle size={24} className="text-green-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Đã từ chối</p>
              <p className="text-3xl font-bold text-red-600">{rejectedKPIs.length}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <XCircle size={24} className="text-red-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <Card>
        <Tabs
          defaultActiveKey="pending"
          items={[
            {
              key: 'pending',
              label: `Chờ phê duyệt (${pendingKPIs.length})`,
              children: (
                <Table
                  columns={columns}
                  dataSource={pendingKPIs}
                  rowKey="id"
                  pagination={{ pageSize: 10 }}
                />
              ),
            },
            {
              key: 'approved',
              label: `Đã phê duyệt (${approvedKPIs.length})`,
              children: (
                <Table
                  columns={columns}
                  dataSource={approvedKPIs}
                  rowKey="id"
                  pagination={{ pageSize: 10 }}
                />
              ),
            },
            {
              key: 'rejected',
              label: `Đã từ chối (${rejectedKPIs.length})`,
              children: (
                <Table
                  columns={columns}
                  dataSource={rejectedKPIs}
                  rowKey="id"
                  pagination={{ pageSize: 10 }}
                />
              ),
            },
          ]}
        />
      </Card>

      {/* Detail Modal */}
      <Modal
        title="Chi tiết KPI Chiến lược"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={800}
      >
        {selectedKPI && (
          <div className="space-y-6">
            {/* Header Info */}
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">{selectedKPI.title}</h3>
                <Tag color={getPriorityColor(selectedKPI.priority)}>
                  Ưu tiên: {getPriorityLabel(selectedKPI.priority)}
                </Tag>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Bộ phận:</span>
                  <span className="ml-2 font-semibold">{selectedKPI.department}</span>
                </div>
                <div>
                  <span className="text-gray-600">Kỳ:</span>
                  <span className="ml-2 font-semibold">{selectedKPI.period}</span>
                </div>
                <div>
                  <span className="text-gray-600">Người gửi:</span>
                  <span className="ml-2 font-semibold">{selectedKPI.submittedBy}</span>
                </div>
                <div>
                  <span className="text-gray-600">Ngày gửi:</span>
                  <span className="ml-2 font-semibold">{selectedKPI.submittedAt}</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <h4 className="font-semibold mb-2">Mô tả:</h4>
              <p className="text-gray-700">{selectedKPI.description}</p>
            </div>

            {/* Strategic Targets */}
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Target size={18} className="text-primary" />
                Các mục tiêu chiến lược ({selectedKPI.targetCount})
              </h4>
              <div className="space-y-2">
                {Array.from({ length: selectedKPI.targetCount }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-primary font-semibold">{i + 1}</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Mục tiêu {i + 1}</p>
                      <p className="text-sm text-gray-600">Trọng số: {Math.floor(100 / selectedKPI.targetCount)}%</p>
                    </div>
                    <TrendingUp size={18} className="text-primary" />
                  </div>
                ))}
              </div>
            </div>

            {/* Action Section */}
            {selectedKPI.status === 'pending_ceo' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Nhận xét / Lý do:
                  </label>
                  <TextArea
                    rows={4}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Nhập nhận xét hoặc lý do..."
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button onClick={() => setIsModalOpen(false)}>
                    Đóng
                  </Button>
                  <Button 
                    danger
                    icon={<XCircle size={16} />}
                    onClick={() => handleAction('reject')}
                  >
                    Từ chối
                  </Button>
                  <Button 
                    type="primary"
                    icon={<CheckCircle size={16} />}
                    onClick={() => handleAction('approve')}
                  >
                    Phê duyệt
                  </Button>
                </div>
              </div>
            )}

            {selectedKPI.status !== 'pending_ceo' && (
              <div className="flex justify-end">
                <Button onClick={() => setIsModalOpen(false)}>
                  Đóng
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};
