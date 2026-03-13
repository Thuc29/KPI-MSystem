import { useEffect, useState, useMemo } from 'react';
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
import type { IStrategicPlan } from '../../../../core/models';
import { useTranslation } from '../../../../infrastructure/i18n';

const { Option } = Select;

export const StrategyListPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
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
      toast.error(t.groupLeader.strategy.cannotLoad);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: t.groupLeader.strategy.confirmDelete,
      content: t.groupLeader.strategy.confirmDeleteMessage,
      okText: t.groupLeader.strategy.delete,
      cancelText: t.common.cancel,
      okButtonProps: { danger: true },
      onOk: () => {
        setStrategies(strategies.filter(s => s.id !== id));
        toast.success(t.groupLeader.strategy.deleted);
      },
    });
  };

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { color: string; label: string; icon: any }> = {
      draft: { color: 'default', label: t.groupLeader.strategy.draft, icon: <FileText size={14} /> },
      pending_ceo: { color: 'orange', label: t.groupLeader.strategy.pendingCEO, icon: <Clock size={14} /> },
      approved: { color: 'green', label: t.groupLeader.strategy.approved, icon: <CheckCircle size={14} /> },
      rejected: { color: 'red', label: t.groupLeader.strategy.rejected, icon: <XCircle size={14} /> },
      in_execution: { color: 'blue', label: t.groupLeader.strategy.inExecution, icon: <Target size={14} /> },
      completed: { color: 'success', label: t.groupLeader.strategy.completed, icon: <CheckCircle size={14} /> },
    };
    return configs[status] || configs.draft;
  };

  const filteredStrategies = strategies.filter(strategy => {
    const matchesSearch = strategy.title.toLowerCase().includes(searchText.toLowerCase()) ||
                          strategy.description.toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus = statusFilter === 'all' || strategy.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const columns: ColumnsType<IStrategicPlan> = useMemo(() => [
    {
      title: t.groupLeader.strategy.code,
      dataIndex: 'id',
      key: 'id',
      width: 100,
      render: (text) => (
        <span className="font-mono text-xs font-semibold text-primary">{text}</span>
      ),
    },
    {
      title: t.groupLeader.strategy.title,
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
      title: t.groupLeader.strategy.period,
      key: 'period',
      width: 90,
      render: (_, record) => {
        const periodLabels: Record<string, string> = {
          yearly: t.groupLeader.strategy.yearly,
          'half-yearly': t.groupLeader.strategy.halfYearly,
          quarterly: t.groupLeader.strategy.quarterly,
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
      title: t.groupLeader.strategy.teams,
      key: 'teams',
      width: 90,
      align: 'center',
      render: (_, record) => (
        <Badge count={record.teamPlans.length} showZero color="#1890ff" />
      ),
    },
    {
      title: t.groupLeader.strategy.budget,
      dataIndex: 'totalBudget',
      key: 'totalBudget',
      width: 110,
      render: (budget) => budget ? `${(budget / 1000000).toFixed(0)}M VNĐ` : '-',
    },
    {
      title: t.groupLeader.strategy.status,
      dataIndex: 'status',
      key: 'status',
      width: 150,
      align: 'center',
      render: (status) => {
        const config = getStatusConfig(status);
        return (
          <Tag color={config.color} className='flex items-center gap-2 w-fit mx-auto' icon={config.icon}>
            {config.label}
          </Tag>
        );
      },
    },
    {
      title: t.groupLeader.strategy.createdDate,
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 100,
      render: (date) => new Date(date).toLocaleDateString('vi-VN'),
    },
    {
      title: t.groupLeader.strategy.action,
      key: 'action',
      width: 200,
      align: 'center',
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Tooltip title={t.groupLeader.strategy.viewDetail}>
            <Button
              type="link"
              size="small"
              icon={<Eye size={14} />}
              onClick={() => navigate(`/strategy/${record.id}`)}
            />
          </Tooltip>
          {record.status === 'draft' && (
            <>
              <Tooltip title={t.groupLeader.strategy.edit}>
                <Button
                  type="link"
                  size="small"
                  icon={<Edit size={14} />}
                  onClick={() => navigate(`/strategy/edit/${record.id}`)}
                />
              </Tooltip>
              <Tooltip title={t.groupLeader.strategy.delete}>
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
            <Tooltip title={t.groupLeader.strategy.sendForApproval}>
              <Button
                type="primary"
                size="small"
                icon={<Send size={14} />}
                onClick={() => {
                  toast.success(t.groupLeader.strategy.sent);
                  // Update status logic here
                }}
              >
                {t.groupLeader.strategy.send}
              </Button>
            </Tooltip>
          )}
        </Space>
      ),
    },
  ], [t, navigate]);

  const stats = {
    total: strategies.length,
    draft: strategies.filter(s => s.status === 'draft').length,
    pending: strategies.filter(s => s.status === 'pending_ceo').length,
    approved: strategies.filter(s => s.status === 'approved').length,
    rejected: strategies.filter(s => s.status === 'rejected').length,
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <Target size={32} className="text-primary" />
            {t.groupLeader.strategy.listTitle}
          </h1>
          <p className="text-gray-500">{t.groupLeader.strategy.listSubtitle}</p>
        </div>
        <Button
          type="primary"
          size="middle"
          icon={<Plus size={20} />}
          onClick={() => navigate('/strategy/create')}
          className="bg-primary"
        >
          {t.groupLeader.strategy.createNew}
        </Button>
      </div>

        {/* Filters */}
      <Card className="shadow-md">
        <div className="flex gap-4">
          <Input
            placeholder={t.groupLeader.strategy.searchPlaceholder}
            prefix={<Search size={16} />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
            size="middle"
          />
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: 200 }}
            size="middle"
          >
            <Option value="all">{t.groupLeader.strategy.allStatus}</Option>
            <Option value="draft">{t.groupLeader.strategy.draft}</Option>
            <Option value="pending_ceo">{t.groupLeader.strategy.pendingCEO}</Option>
            <Option value="approved">{t.groupLeader.strategy.approved}</Option>
            <Option value="rejected">{t.groupLeader.strategy.rejected}</Option>
            <Option value="in_execution">{t.groupLeader.strategy.inExecution}</Option>
            <Option value="completed">{t.groupLeader.strategy.completed}</Option>
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
            showTotal: (total) => t.groupLeader.strategy.totalStrategies.replace('{count}', total.toString()),
          }}
          bordered
        />
      </Card>
    </div>
  );
};
