import { useEffect, useState } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Tag, 
  Space,
  Input,
  Select,
  Badge,
  Tooltip,
  Modal
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { 
  Target,
  Plus,
  Eye,
  Edit,
  Trash2,
  Search,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Send
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import type { IStrategicPlan } from '../../../core/models';

const { Option } = Select;

export const StrategyListPage = () => {
  const navigate = useNavigate();
  const [strategies, setStrategies] = useState<IStrategicPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchStrategies();
  }, []);

  const fetchStrategies = async () => {
    setLoading(true);
    try {
      // Mock data - replace with actual API call
      const mockData: IStrategicPlan[] = [
        {
          id: 'STR-2024-001',
          title: 'Chiến lược tăng trưởng Q4/2024',
          description: 'Kế hoạch tăng trưởng doanh thu và mở rộng thị trường',
          departmentId: 'dept-1',
          departmentName: 'Sales & Marketing',
          groupLeaderId: 'gl-1',
          groupLeaderName: 'Nguyễn Văn A',
          year: 2024,
          quarter: 4,
          period: 'quarterly',
          status: 'pending_ceo',
          teamPlans: [
            {
              id: 'tp-1',
              teamName: 'Sales Team',
              teamLeaderId: 'tl-1',
              teamLeaderName: 'Trần Văn B',
              objectives: [
                {
                  id: 'obj-1',
                  title: 'Tăng doanh số',
                  description: 'Tăng 30% doanh số so với Q3',
                  weight: 50,
                  target: '500',
                  unit: 'triệu VNĐ',
                },
              ],
              budget: 100000000,
            },
          ],
          totalBudget: 500000000,
          expectedImpact: 'Tăng 30% doanh thu',
          createdAt: '2024-10-01',
          updatedAt: '2024-10-05',
          submittedAt: '2024-10-05',
        },
        {
          id: 'STR-2024-002',
          title: 'Digital Transformation 2024',
          description: 'Chuyển đổi số toàn diện cho bộ phận',
          departmentId: 'dept-1',
          departmentName: 'IT',
          groupLeaderId: 'gl-1',
          groupLeaderName: 'Nguyễn Văn A',
          year: 2024,
          period: 'yearly',
          status: 'approved',
          teamPlans: [],
          totalBudget: 1000000000,
          createdAt: '2024-09-01',
          updatedAt: '2024-09-15',
          submittedAt: '2024-09-10',
          approvedAt: '2024-09-15',
          approvedBy: 'CEO',
        },
        {
          id: 'STR-2024-003',
          title: 'Kế hoạch Marketing Q3',
          description: 'Chiến dịch marketing tập trung vào digital',
          departmentId: 'dept-1',
          departmentName: 'Marketing',
          groupLeaderId: 'gl-1',
          groupLeaderName: 'Nguyễn Văn A',
          year: 2024,
          quarter: 3,
          period: 'quarterly',
          status: 'draft',
          teamPlans: [],
          createdAt: '2024-09-20',
          updatedAt: '2024-09-20',
        },
      ];
      setStrategies(mockData);
    } catch (error) {
      toast.error('Không thể tải danh sách chiến lược');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: 'Bạn có chắc chắn muốn xóa chiến lược này?',
      okText: 'Xóa',
      cancelText: 'Hủy',
      okButtonProps: { danger: true },
      onOk: () => {
        setStrategies(strategies.filter(s => s.id !== id));
        toast.success('Đã xóa chiến lược');
      },
    });
  };

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { color: string; label: string; icon: any }> = {
      draft: { color: 'default', label: 'Nháp', icon: <FileText size={14} /> },
      pending_ceo: { color: 'orange', label: 'Chờ CEO duyệt', icon: <Clock size={14} /> },
      approved: { color: 'green', label: 'Đã duyệt', icon: <CheckCircle size={14} /> },
      rejected: { color: 'red', label: 'Từ chối', icon: <XCircle size={14} /> },
      in_execution: { color: 'blue', label: 'Đang thực hiện', icon: <Target size={14} /> },
      completed: { color: 'success', label: 'Hoàn thành', icon: <CheckCircle size={14} /> },
    };
    return configs[status] || configs.draft;
  };

  const filteredStrategies = strategies.filter(strategy => {
    const matchesSearch = strategy.title.toLowerCase().includes(searchText.toLowerCase()) ||
                         strategy.description.toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus = statusFilter === 'all' || strategy.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const columns: ColumnsType<IStrategicPlan> = [
    {
      title: 'Mã',
      dataIndex: 'id',
      key: 'id',
      width: 150,
      render: (text) => (
        <span className="font-mono text-xs font-semibold text-primary">{text}</span>
      ),
    },
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <div>
          <div className="font-semibold">{text}</div>
          <div className="text-xs text-gray-500">{record.description}</div>
        </div>
      ),
    },
    {
      title: 'Kỳ',
      key: 'period',
      width: 120,
      render: (_, record) => {
        const periodLabels: Record<string, string> = {
          yearly: 'Cả năm',
          'half-yearly': '6 tháng',
          quarterly: 'Quý',
        };
        return (
          <div className="text-center">
            <div className="font-medium">{periodLabels[record.period || 'yearly']}</div>
            <div className="text-xs text-gray-500">
              {record.year}{record.quarter ? ` - Q${record.quarter}` : ''}
            </div>
          </div>
        );
      },
    },
    {
      title: 'Số Team',
      key: 'teams',
      width: 100,
      align: 'center',
      render: (_, record) => (
        <Badge count={record.teamPlans.length} showZero color="#1890ff" />
      ),
    },
    {
      title: 'Ngân sách',
      dataIndex: 'totalBudget',
      key: 'totalBudget',
      width: 150,
      render: (budget) => budget ? `${(budget / 1000000).toFixed(0)}M VNĐ` : '-',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 150,
      align: 'center',
      render: (status) => {
        const config = getStatusConfig(status);
        return (
          <Tag color={config.color} icon={config.icon}>
            {config.label}
          </Tag>
        );
      },
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: (date) => new Date(date).toLocaleDateString('vi-VN'),
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 200,
      align: 'center',
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button
              type="link"
              size="small"
              icon={<Eye size={14} />}
              onClick={() => navigate(`/strategy/${record.id}`)}
            />
          </Tooltip>
          {record.status === 'draft' && (
            <>
              <Tooltip title="Chỉnh sửa">
                <Button
                  type="link"
                  size="small"
                  icon={<Edit size={14} />}
                  onClick={() => navigate(`/strategy/edit/${record.id}`)}
                />
              </Tooltip>
              <Tooltip title="Xóa">
                <Button
                  type="link"
                  size="small"
                  danger
                  icon={<Trash2 size={14} />}
                  onClick={() => handleDelete(record.id)}
                />
              </Tooltip>
            </>
          )}
          {record.status === 'draft' && (
            <Tooltip title="Gửi duyệt">
              <Button
                type="primary"
                size="small"
                icon={<Send size={14} />}
                onClick={() => {
                  toast.success('Đã gửi chiến lược đến CEO');
                  // Update status logic here
                }}
              >
                Gửi
              </Button>
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  const stats = {
    total: strategies.length,
    draft: strategies.filter(s => s.status === 'draft').length,
    pending: strategies.filter(s => s.status === 'pending_ceo').length,
    approved: strategies.filter(s => s.status === 'approved').length,
    rejected: strategies.filter(s => s.status === 'rejected').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <Target size={32} className="text-primary" />
            Quản lý Chiến lược
          </h1>
          <p className="text-gray-500">Quản lý các kế hoạch chiến lược của bộ phận</p>
        </div>
        <Button
          type="primary"
          size="large"
          icon={<Plus size={20} />}
          onClick={() => navigate('/strategy/create')}
          className="bg-primary"
        >
          Tạo Chiến lược mới
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-5 gap-4">
        <Card className="shadow-md border-l-4 border-l-blue-500">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-sm text-gray-600">Tổng số</div>
          </div>
        </Card>
        <Card className="shadow-md border-l-4 border-l-gray-500">
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-600">{stats.draft}</div>
            <div className="text-sm text-gray-600">Nháp</div>
          </div>
        </Card>
        <Card className="shadow-md border-l-4 border-l-orange-500">
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600">{stats.pending}</div>
            <div className="text-sm text-gray-600">Chờ duyệt</div>
          </div>
        </Card>
        <Card className="shadow-md border-l-4 border-l-green-500">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">{stats.approved}</div>
            <div className="text-sm text-gray-600">Đã duyệt</div>
          </div>
        </Card>
        <Card className="shadow-md border-l-4 border-l-red-500">
          <div className="text-center">
            <div className="text-3xl font-bold text-red-600">{stats.rejected}</div>
            <div className="text-sm text-gray-600">Từ chối</div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="shadow-md">
        <div className="flex gap-4">
          <Input
            placeholder="Tìm kiếm chiến lược..."
            prefix={<Search size={16} />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
            size="large"
          />
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: 200 }}
            size="large"
          >
            <Option value="all">Tất cả trạng thái</Option>
            <Option value="draft">Nháp</Option>
            <Option value="pending_ceo">Chờ CEO duyệt</Option>
            <Option value="approved">Đã duyệt</Option>
            <Option value="rejected">Từ chối</Option>
            <Option value="in_execution">Đang thực hiện</Option>
            <Option value="completed">Hoàn thành</Option>
          </Select>
        </div>
      </Card>

      {/* Table */}
      <Card className="shadow-md">
        <Table
          columns={columns}
          dataSource={filteredStrategies}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1200 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} chiến lược`,
          }}
        />
      </Card>
    </div>
  );
};
