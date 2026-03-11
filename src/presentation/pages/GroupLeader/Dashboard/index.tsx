import { useEffect, useState } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Statistic, 
  Progress, 
  Button, 
  Table, 
  Tag, 
  Badge,
  Tooltip,
  Avatar,
  Timeline,
  Empty,
  Space
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { 
  Users,
  FileText, 
  Clock, 
  CheckCircle, 
  TrendingUp,
  AlertTriangle,
  Target,
  Award,
  Eye,
  BarChart3,
  Activity,
  Bell,
  XCircle,
  FilePlus,
  Building2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { kpiApi } from '../../../../infrastructure/api';
import { storage } from '../../../../infrastructure/utils';
import { KPIStatusTag } from '../../../components';
import type { IKPIRecord } from '../../../../core/models';

interface TeamLeaderSummary {
  id: string;
  name: string;
  department: string;
  kpiCount: number;
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
  avgCompletion: number;
  status: 'excellent' | 'good' | 'average' | 'poor';
}

export const GroupLeaderDashboardPage = () => {
  const navigate = useNavigate();
  const [kpiList, setKpiList] = useState<IKPIRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const userId = storage.getUserId();
  const userName = storage.getUserName() || 'Group Leader';

  useEffect(() => {
    fetchKPIList();
  }, []);

  const fetchKPIList = async () => {
    setLoading(true);
    try {
      const response = await kpiApi.getList();
      if (response.data.data) {
        setKpiList(response.data.data);
      }
    } catch (error: any) {
      toast.error('Không thể tải danh sách KPI');
    } finally {
      setLoading(false);
    }
  };

  // Department statistics (KPIs from Team Leaders)
  const pendingApprovalKPIs = kpiList.filter(k => k.status === 'pending_approval');
  const approvedKPIs = kpiList.filter(k => k.status === 'in_progress' || k.status === 'completed');
  const rejectedKPIs = kpiList.filter(k => k.status === 'rejected');
  const totalDeptKPIs = kpiList.length;

  // Mock Team Leaders data (in real app, this would come from API)
  const teamLeaders: TeamLeaderSummary[] = [
    { 
      id: '2', 
      name: 'Nguyễn Văn A', 
      department: 'Sales',
      kpiCount: 4, 
      pendingCount: 1,
      approvedCount: 2,
      rejectedCount: 1,
      avgCompletion: 82, 
      status: 'good' 
    },
    { 
      id: '3', 
      name: 'Trần Thị B', 
      department: 'Marketing',
      kpiCount: 3, 
      pendingCount: 2,
      approvedCount: 1,
      rejectedCount: 0,
      avgCompletion: 88, 
      status: 'excellent' 
    },
    { 
      id: '4', 
      name: 'Lê Văn C', 
      department: 'IT',
      kpiCount: 3, 
      pendingCount: 0,
      approvedCount: 2,
      rejectedCount: 1,
      avgCompletion: 70, 
      status: 'average' 
    },
  ];

  const totalTeamLeaders = teamLeaders.length;
  const avgDeptCompletion = Math.round(
    teamLeaders.reduce((sum, m) => sum + m.avgCompletion, 0) / teamLeaders.length
  );

  // Urgent items (pending > 2 days)
  const urgentKPIs = pendingApprovalKPIs.filter(kpi => {
    if (!kpi.submittedAt) return false;
    const days = Math.floor((Date.now() - new Date(kpi.submittedAt).getTime()) / (1000 * 60 * 60 * 24));
    return days >= 2;
  });

  // Recent pending KPIs
  const recentPendingKPIs = [...pendingApprovalKPIs]
    .sort((a, b) => new Date(b.submittedAt || 0).getTime() - new Date(a.submittedAt || 0).getTime())
    .slice(0, 5);

  // Columns for pending KPIs table
  const pendingColumns: ColumnsType<IKPIRecord> = [
    {
      title: 'Ưu tiên',
      key: 'priority',
      width: 80,
      align: 'center',
      render: (_, record) => {
        const days = record.submittedAt 
          ? Math.floor((Date.now() - new Date(record.submittedAt).getTime()) / (1000 * 60 * 60 * 24))
          : 0;
        
        if (days >= 2) return <span className="text-2xl">🔴</span>;
        if (days >= 1) return <span className="text-2xl">🟡</span>;
        return <span className="text-2xl">🟢</span>;
      },
    },
    {
      title: 'Team Leader',
      dataIndex: 'employeeName',
      key: 'employeeName',
      width: 200,
      render: (text) => (
        <div className="flex items-center gap-2">
          <Avatar className="bg-purple-500">{text.charAt(0)}</Avatar>
          <span className="font-medium">{text}</span>
        </div>
      ),
    },
    {
      title: 'Mã KPI',
      dataIndex: 'id',
      key: 'id',
      width: 120,
      render: (text) => (
        <span className="font-mono text-xs font-semibold text-primary">{text}</span>
      ),
    },
    {
      title: 'Năm',
      dataIndex: 'year',
      key: 'year',
      width: 80,
      align: 'center',
    },
    {
      title: 'Số mục tiêu',
      key: 'targets',
      width: 100,
      align: 'center',
      render: (_, record) => (
        <Badge count={record.targets.length} showZero color="#4C9C2E">
          <FileText size={20} className="text-gray-400" />
        </Badge>
      ),
    },
    {
      title: 'Ngày gửi',
      key: 'submittedAt',
      width: 120,
      render: (_, record) => {
        if (!record.submittedAt) return '-';
        const days = Math.floor((Date.now() - new Date(record.submittedAt).getTime()) / (1000 * 60 * 60 * 24));
        return (
          <span className="text-gray-600">
            {days === 0 ? 'Hôm nay' : `${days} ngày trước`}
          </span>
        );
      },
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 120,
      align: 'center',
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          icon={<Eye size={14} />}
          onClick={() => navigate(`/kpi/${record.id}`)}
          className="bg-primary"
        >
          Duyệt
        </Button>
      ),
    },
  ];

  // Team Leader performance columns
  const teamLeaderColumns: ColumnsType<TeamLeaderSummary> = [
    {
      title: 'Team Leader',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div className="flex items-center gap-3">
          <Avatar size={40} className="bg-gradient-to-br from-purple-500 to-pink-500">
            {text.charAt(0)}
          </Avatar>
          <div>
            <div className="font-medium">{text}</div>
            <div className="text-xs text-gray-500">{record.department}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Tổng KPI',
      dataIndex: 'kpiCount',
      key: 'kpiCount',
      align: 'center',
      width: 100,
      render: (count) => <Tag color="blue">{count} KPI</Tag>,
    },
    {
      title: 'Chờ duyệt',
      dataIndex: 'pendingCount',
      key: 'pendingCount',
      align: 'center',
      width: 100,
      render: (count) => (
        count > 0 ? (
          <Tag color="orange" className="font-semibold">{count}</Tag>
        ) : (
          <Tag color="default">0</Tag>
        )
      ),
    },
    {
      title: 'Đã duyệt',
      dataIndex: 'approvedCount',
      key: 'approvedCount',
      align: 'center',
      width: 100,
      render: (count) => <Tag color="green">{count}</Tag>,
    },
    {
      title: 'Hiệu suất',
      key: 'performance',
      width: 200,
      render: (_, record) => (
        <div className="space-y-1">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-600">Hoàn thành</span>
            <span className="font-semibold">{record.avgCompletion}%</span>
          </div>
          <Progress 
            percent={record.avgCompletion}
            size="small"
            strokeColor={{
              '0%': record.avgCompletion >= 80 ? '#52c41a' : 
                    record.avgCompletion >= 60 ? '#1890ff' : '#faad14',
              '100%': record.avgCompletion >= 80 ? '#73d13d' : 
                      record.avgCompletion >= 60 ? '#40a9ff' : '#ffc53d',
            }}
          />
        </div>
      ),
      sorter: (a, b) => a.avgCompletion - b.avgCompletion,
    },
    {
      title: 'Đánh giá',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      align: 'center',
      render: (status: string) => {
        const config: Record<string, { color: string; label: string }> = {
          excellent: { color: 'success', label: 'Xuất sắc' },
          good: { color: 'processing', label: 'Tốt' },
          average: { color: 'warning', label: 'TB' },
          poor: { color: 'error', label: 'Yếu' },
        };
        const { color, label } = config[status] || { color: 'default', label: status };
        return <Tag color={color}>{label}</Tag>;
      },
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 100,
      align: 'center',
      render: (_, record) => (
        <Button
          type="link"
          size="small"
          icon={<Eye size={14} />}
          onClick={() => navigate(`/department`)}
        >
          Xem
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Dashboard - Group Leader
        </h1>
        <p className="text-gray-500">Chào mừng {userName}, quản lý và theo dõi hiệu suất bộ phận của bạn</p>
      </div>

      {/* Urgent Alert */}
      {urgentKPIs.length > 0 && (
        <Card className="shadow-md border-l-4 border-l-red-500 bg-red-50">
          <div className="flex items-start gap-3">
            <AlertTriangle size={28} className="text-red-500 mt-1" />
            <div className="flex-1">
              <h3 className="font-semibold text-red-600 text-lg mb-2">
                Cảnh báo: {urgentKPIs.length} KPI cần duyệt gấp!
              </h3>
              <p className="text-gray-700 mb-3">
                Có {urgentKPIs.length} KPI từ Team Leader đã chờ duyệt hơn 2 ngày. Vui lòng xem xét ngay.
              </p>
              <Button 
                danger
                icon={<Eye size={16} />}
                onClick={() => navigate('/approval')}
                size="large"
              >
                Xem ngay
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Statistics Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-md border-l-4 border-l-purple-500 hover:shadow-lg transition-shadow">
            <Statistic
              title={<span className="text-gray-600 font-medium">Team Leader</span>}
              value={totalTeamLeaders}
              prefix={<Users size={28} className="text-purple-500" />}
              valueStyle={{ color: '#722ed1', fontSize: '32px', fontWeight: 'bold' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-md border-l-4 border-l-orange-500 hover:shadow-lg transition-shadow">
            <Statistic
              title={<span className="text-gray-600 font-medium">Chờ duyệt</span>}
              value={pendingApprovalKPIs.length}
              prefix={<Clock size={28} className="text-orange-500" />}
              valueStyle={{ color: '#fa8c16', fontSize: '32px', fontWeight: 'bold' }}
              suffix={urgentKPIs.length > 0 && (
                <Tooltip title={`${urgentKPIs.length} khẩn cấp`}>
                  <Badge count={urgentKPIs.length} className="ml-2" />
                </Tooltip>
              )}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-md border-l-4 border-l-green-500 hover:shadow-lg transition-shadow">
            <Statistic
              title={<span className="text-gray-600 font-medium">Đã duyệt</span>}
              value={approvedKPIs.length}
              prefix={<CheckCircle size={28} className="text-green-500" />}
              valueStyle={{ color: '#52c41a', fontSize: '32px', fontWeight: 'bold' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-md border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
            <Statistic
              title={<span className="text-gray-600 font-medium">Hiệu suất TB</span>}
              value={avgDeptCompletion}
              suffix="%"
              prefix={<Target size={28} className="text-blue-500" />}
              valueStyle={{ color: '#1890ff', fontSize: '32px', fontWeight: 'bold' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Content */}
      <Row gutter={[16, 16]}>
        {/* Left Column */}
        <Col xs={24} lg={14}>
          {/* Pending Approvals */}
          <Card 
            title={
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock size={20} className="text-orange-500" />
                  <span className="font-semibold">KPI chờ duyệt từ Team Leader</span>
                  <Badge count={pendingApprovalKPIs.length} showZero color="#fa8c16" />
                </div>
                <Button
                  type="link"
                  onClick={() => navigate('/approval')}
                >
                  Xem tất cả
                </Button>
              </div>
            }
            className="shadow-md mb-4"
          >
            {recentPendingKPIs.length > 0 ? (
              <Table
                columns={pendingColumns}
                dataSource={recentPendingKPIs}
                rowKey="id"
                pagination={false}
                size="small"
                scroll={{ x: 800 }}
                loading={loading}
              />
            ) : (
              <Empty 
                description="Không có KPI nào chờ duyệt"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )}
          </Card>

          {/* Team Leader Performance */}
          <Card 
            title={
              <div className="flex items-center gap-2">
                <Users size={20} className="text-primary" />
                <span className="font-semibold">Hiệu suất Team Leader</span>
              </div>
            }
            className="shadow-md"
          >
            <Table
              columns={teamLeaderColumns}
              dataSource={teamLeaders}
              rowKey="id"
              pagination={false}
              size="small"
              loading={loading}
            />
          </Card>
        </Col>

        {/* Right Column */}
        <Col xs={24} lg={10}>
          {/* Quick Actions */}
          <Card 
            title={
              <div className="flex items-center gap-2">
                <Activity size={18} className="text-primary" />
                <span>Hành động nhanh</span>
              </div>
            }
            className="shadow-md mb-4"
          >
            <div className="space-y-3">
              <Button
                type="primary"
                icon={<Target size={16} />}
                onClick={() => navigate('/strategy/create')}
                block
                size="large"
                className="bg-purple-500 hover:bg-purple-600"
              >
                Tạo Chiến lược mới
              </Button>
              <Button
                icon={<FileText size={16} />}
                onClick={() => navigate('/strategy')}
                block
                size="large"
              >
                Quản lý Chiến lược
              </Button>
              <Button
                type="primary"
                icon={<CheckCircle size={16} />}
                onClick={() => navigate('/approval')}
                block
                size="large"
                className="bg-primary"
              >
                Duyệt KPI Team Leader ({pendingApprovalKPIs.length})
              </Button>
              <Button
                icon={<Building2 size={16} />}
                onClick={() => navigate('/department')}
                block
                size="large"
              >
                Quản lý bộ phận
              </Button>
              <Button
                icon={<BarChart3 size={16} />}
                onClick={() => navigate('/reports/department')}
                block
                size="large"
              >
                Báo cáo bộ phận
              </Button>
            </div>
          </Card>

          {/* Department Overview */}
          <Card 
            title={
              <div className="flex items-center gap-2">
                <Target size={18} className="text-primary" />
                <span>Tổng quan bộ phận</span>
              </div>
            }
            className="shadow-md mb-4"
          >
            <div className="space-y-4">
              <div className="text-center py-4">
                <Progress
                  type="circle"
                  percent={avgDeptCompletion}
                  strokeColor={{
                    '0%': '#108ee9',
                    '100%': '#87d068',
                  }}
                  strokeWidth={10}
                  width={140}
                  format={(percent) => (
                    <div className="text-center">
                      <div className="text-4xl font-bold text-primary">{percent}%</div>
                      <div className="text-xs text-gray-500 mt-1">Hiệu suất TB</div>
                    </div>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-purple-50 p-3 rounded-lg text-center">
                  <div className="text-2xl font-bold text-purple-600">{totalTeamLeaders}</div>
                  <div className="text-xs text-gray-600">Team Leader</div>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg text-center">
                  <div className="text-2xl font-bold text-blue-600">{totalDeptKPIs}</div>
                  <div className="text-xs text-gray-600">Tổng KPI</div>
                </div>
                <div className="bg-orange-50 p-3 rounded-lg text-center">
                  <div className="text-2xl font-bold text-orange-600">{pendingApprovalKPIs.length}</div>
                  <div className="text-xs text-gray-600">Chờ duyệt</div>
                </div>
                <div className="bg-green-50 p-3 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-600">{approvedKPIs.length}</div>
                  <div className="text-xs text-gray-600">Đã duyệt</div>
                </div>
              </div>
            </div>
          </Card>

          {/* Recent Activities */}
          <Card 
            title={
              <div className="flex items-center gap-2">
                <Bell size={18} className="text-primary" />
                <span>Hoạt động gần đây</span>
              </div>
            }
            className="shadow-md"
          >
            <Timeline
              items={[
                {
                  color: 'orange',
                  dot: <Clock size={16} />,
                  children: (
                    <div>
                      <div className="text-sm text-gray-500">5 phút trước</div>
                      <div className="font-medium">📝 Nhận KPI mới từ Nguyễn Văn A</div>
                      <div className="text-xs text-gray-600">Cần duyệt</div>
                    </div>
                  ),
                },
                {
                  color: 'green',
                  dot: <CheckCircle size={16} />,
                  children: (
                    <div>
                      <div className="text-sm text-gray-500">1 giờ trước</div>
                      <div className="font-medium">✅ Đã duyệt KPI của Trần Thị B</div>
                      <div className="text-xs text-gray-600">Q4/2024</div>
                    </div>
                  ),
                },
                {
                  color: 'red',
                  dot: <XCircle size={16} />,
                  children: (
                    <div>
                      <div className="text-sm text-gray-500">2 giờ trước</div>
                      <div className="font-medium">❌ Từ chối KPI của Lê Văn C</div>
                      <div className="text-xs text-gray-600">Cần bổ sung thông tin</div>
                    </div>
                  ),
                },
              ]}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};
