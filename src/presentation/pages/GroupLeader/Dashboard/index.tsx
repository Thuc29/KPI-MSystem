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
import { useTranslation } from '../../../../infrastructure/i18n';

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
  const { t } = useTranslation();
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
      toast.error(t.groupLeader.dashboard.cannotLoadKPIs);
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
      title: t.groupLeader.dashboard.priority,
      key: 'priority',
      width: 80,
      align: 'center',
      render: (_, record) => {
        const days = record.submittedAt 
          ? Math.floor((Date.now() - new Date(record.submittedAt).getTime()) / (1000 * 60 * 60 * 24))
          : 0;
        
        if (days >= 2) return <AlertTriangle size={20} className="text-red-500" />;
        if (days >= 1) return <AlertTriangle size={20} className="text-yellow-500" />;
        return <CheckCircle size={20} className="text-green-500" />;
      },
    },
    {
      title: t.groupLeader.dashboard.teamLeader,
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
      title: t.groupLeader.dashboard.kpiCode,
      dataIndex: 'id',
      key: 'id',
      width: 120,
      render: (text) => (
        <span className="font-mono text-xs font-semibold text-primary">{text}</span>
      ),
    },
    {
      title: t.groupLeader.dashboard.year,
      dataIndex: 'year',
      key: 'year',
      width: 80,
      align: 'center',
    },
    {
      title: t.groupLeader.dashboard.targetCount,
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
      title: t.groupLeader.dashboard.submittedDate,
      key: 'submittedAt',
      width: 120,
      render: (_, record) => {
        if (!record.submittedAt) return '-';
        const days = Math.floor((Date.now() - new Date(record.submittedAt).getTime()) / (1000 * 60 * 60 * 24));
        return (
          <span className="text-gray-600">
            {days === 0 ? t.groupLeader.dashboard.today : t.groupLeader.dashboard.daysAgo.replace('{count}', days.toString())}
          </span>
        );
      },
    },
    {
      title: t.groupLeader.dashboard.action,
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
          {t.groupLeader.dashboard.approve}
        </Button>
      ),
    },
  ];

  // Team Leader performance columns
  const teamLeaderColumns: ColumnsType<TeamLeaderSummary> = [
    {
      title: t.groupLeader.dashboard.leader,
      dataIndex: 'name',
      key: 'name',
      width: 170,
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
      title: t.groupLeader.dashboard.totalKPIs,
      dataIndex: 'kpiCount',
      key: 'kpiCount',
      align: 'center',
      width: 90,
      render: (count) => <Tag color="blue">{count} KPI</Tag>,
    },
    {
      title: t.groupLeader.dashboard.pending,
      dataIndex: 'pendingCount',
      key: 'pendingCount',
      align: 'center',
      width: 50,
      render: (count) => (
        count > 0 ? (
          <Tag color="orange" className="font-semibold">{count}</Tag>
        ) : (
          <Tag color="default">0</Tag>
        )
      ),
    },
    {
      title: t.groupLeader.dashboard.approvedLabel,
      dataIndex: 'approvedCount',
      key: 'approvedCount',
      align: 'center',
      width: 80,
      render: (count) => <Tag color="green">{count}</Tag>,
    },
    {
      title: t.groupLeader.dashboard.performance,
      key: 'performance',
      width: 230,
      render: (_, record) => (
        <div className="space-y-1">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-600">{t.groupLeader.dashboard.completion}</span>
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
      title: t.groupLeader.dashboard.rating,
      dataIndex: 'status',
      key: 'status',
      width: 70,
      align: 'center',
      render: (status: string) => {
        const config: Record<string, { color: string; label: string }> = {
          excellent: { color: 'success', label: t.groupLeader.dashboard.excellent },
          good: { color: 'processing', label: t.groupLeader.dashboard.good },
          average: { color: 'warning', label: t.groupLeader.dashboard.average },
          poor: { color: 'error', label: t.groupLeader.dashboard.poor },
        };
        const { color, label } = config[status] || { color: 'default', label: status };
        return <Tag color={color}>{label}</Tag>;
      },
    },
    {
      title: t.groupLeader.dashboard.detail,
      key: 'action',
      width: 60,
      align: 'center',
      render: (_, record) => (
        <Button
          type="link"
          size="small"
          icon={<Eye size={14} />}
          onClick={() => navigate(`/department`)}
        >
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {t.groupLeader.dashboard.title}
        </h1>
        <p className="text-gray-500 flex gap-1">{t.groupLeader.dashboard.welcome} <p className='text-primary font-semibold'> {userName}</p>, {t.groupLeader.dashboard.subtitle}</p>
      </div>

      {/* Urgent Alert */}
      {urgentKPIs.length > 0 && (
        <Card className="shadow-md border-l-4 border-l-red-500 bg-red-50">
          <div className="flex items-start gap-3">
            <AlertTriangle size={28} className="text-red-500 mt-1" />
            <div className="flex-1">
              <h3 className="font-semibold text-red-600 text-lg mb-2">
                {t.groupLeader.dashboard.urgentAlert.replace('{count}', urgentKPIs.length.toString())}
              </h3>
              <p className="text-gray-700 mb-2">
                {t.groupLeader.dashboard.urgentMessage.replace('{count}', urgentKPIs.length.toString())}
              </p>
              <Button 
                danger
                icon={<Eye size={16} />}
                onClick={() => navigate('/approval')}
                size="large"
              >
                {t.groupLeader.dashboard.viewNow}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Statistics Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-md border-l-4 border-l-purple-500 !max-h-20 hover:shadow-lg transition-shadow">
            <Statistic
              title={<span className="text-gray-600 font-medium">{t.groupLeader.dashboard.teamLeaders}</span>}
              value={totalTeamLeaders}
              prefix={<Users size={20} className="text-purple-500" />}
              valueStyle={{ color: '#722ed1', fontSize: '25px', fontWeight: 'bold' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-md border-l-4 border-l-orange-500 !max-h-20 hover:shadow-lg transition-shadow">
            <Statistic
              title={<span className="text-gray-600 font-medium">{t.groupLeader.dashboard.pendingApproval}</span>}
              value={pendingApprovalKPIs.length}
              prefix={<Clock size={20} className="text-orange-500" />}
              valueStyle={{ color: '#fa8c16', fontSize: '25px', fontWeight: 'bold' }}
              suffix={urgentKPIs.length > 0 && (
                <Tooltip title={`${urgentKPIs.length} ${t.groupLeader.dashboard.urgent}`}>
                  <Badge count={urgentKPIs.length} className="ml-2" />
                </Tooltip>
              )}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-md border-l-4 border-l-green-500 !max-h-20 hover:shadow-lg transition-shadow">
            <Statistic
              title={<span className="text-gray-600 font-medium">{t.groupLeader.dashboard.approved}</span>}
              value={approvedKPIs.length}
              prefix={<CheckCircle size={20} className="text-green-500" />}
              valueStyle={{ color: '#52c41a', fontSize: '25px', fontWeight: 'bold' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-md border-l-4 border-l-blue-500 !max-h-20 hover:shadow-lg transition-shadow">
            <Statistic
              title={<span className="text-gray-600 font-medium">{t.groupLeader.dashboard.avgPerformance}</span>}
              value={avgDeptCompletion}
              suffix="%"
              prefix={<Target size={20} className="text-blue-500" />}
              valueStyle={{ color: '#1890ff', fontSize: '25px', fontWeight: 'bold' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Content */}
      <Row gutter={[16, 16]}>
        {/* Left Column */}
        <Col xs={24} lg={16}>
          {/* Pending Approvals */}
          <Card 
            title={
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock size={20} className="text-orange-500" />
                  <span className="font-semibold">{t.groupLeader.dashboard.pendingKPIsFromTL}</span>
                  <Badge count={pendingApprovalKPIs.length} showZero color="#fa8c16" />
                </div>
                <div
                  onClick={() => navigate('/approval')}
                  className='text-sm text-blue-600 hover:text-blue-400 underline cursor-pointer'
                >
                  {t.groupLeader.dashboard.viewAll}
                </div>
              </div>
            }
            className="shadow-md mb-3"
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
                bordered
              />
            ) : (
              <Empty 
                description={t.groupLeader.dashboard.noPendingKPIs}
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )}
          </Card>

          {/* Team Leader Performance */}
          <Card 
            title={
              <div className="flex items-center gap-2">
                <Users size={20} className="text-primary" />
                <span className="font-semibold">{t.groupLeader.dashboard.teamLeaderPerformance}</span>
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
              bordered
              scroll={{x:800}}
            />
          </Card>
        </Col>

        {/* Right Column */}
        <Col xs={24} lg={8}>
          {/* Quick Actions */}
          <Card 
            title={
              <div className="flex items-center gap-2">
                <Activity size={18} className="text-primary" />
                <span>{t.groupLeader.dashboard.quickActions}</span>
              </div>
            }
            className="shadow-md mb-3"
          >
            <div className="space-y-3">
              <Button
                type="primary"
                icon={<Target size={16} />}
                onClick={() => navigate('/strategy/create')}
                block
                size="middle"
                className="bg-purple-500 hover:bg-purple-600"
              >
                {t.groupLeader.dashboard.createStrategy}
              </Button>
              <Button
                icon={<FileText size={16} />}
                onClick={() => navigate('/strategy')}
                block
                size="middle"
              >
                {t.groupLeader.dashboard.manageStrategy}
              </Button>
              <Button
                type="primary"
                icon={<CheckCircle size={16} />}
                onClick={() => navigate('/approval')}
                block
                size="middle"
                className="bg-primary"
              >
                {t.groupLeader.dashboard.approveKPIFromTL} ({pendingApprovalKPIs.length})
              </Button>
              <Button
                icon={<Building2 size={16} />}
                onClick={() => navigate('/department')}
                block
                size="middle"
              >
                {t.groupLeader.dashboard.manageDepartment}
              </Button>
              <Button
                icon={<BarChart3 size={16} />}
                onClick={() => navigate('/reports/department')}
                block
                size="middle"
              >
                {t.groupLeader.dashboard.departmentReports}
              </Button>
            </div>
          </Card>

          {/* Department Overview */}
          <Card 
            title={
              <div className="flex items-center gap-2">
                <Target size={18} className="text-primary" />
                <span>{t.groupLeader.dashboard.departmentOverview}</span>
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
                      <div className="text-xs text-gray-500 mt-1">{t.groupLeader.dashboard.avgPerformanceLabel}</div>
                    </div>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-purple-50 p-3 rounded-lg text-center">
                  <div className="text-2xl font-bold text-purple-600">{totalTeamLeaders}</div>
                  <div className="text-xs text-gray-600">{t.groupLeader.dashboard.teamLeadersLabel}</div>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg text-center">
                  <div className="text-2xl font-bold text-blue-600">{totalDeptKPIs}</div>
                  <div className="text-xs text-gray-600">{t.groupLeader.dashboard.totalKPIsLabel}</div>
                </div>
                <div className="bg-orange-50 p-3 rounded-lg text-center">
                  <div className="text-2xl font-bold text-orange-600">{pendingApprovalKPIs.length}</div>
                  <div className="text-xs text-gray-600">{t.groupLeader.dashboard.pendingLabel}</div>
                </div>
                <div className="bg-green-50 p-3 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-600">{approvedKPIs.length}</div>
                  <div className="text-xs text-gray-600">{t.groupLeader.dashboard.approvedShort}</div>
                </div>
              </div>
            </div>
          </Card>

          {/* Recent Activities */}
          <Card 
            title={
              <div className="flex items-center gap-2">
                <Bell size={18} className="text-primary" />
                <span>{t.groupLeader.dashboard.recentActivities}</span>
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
                      <div className="text-sm text-gray-500">{t.groupLeader.dashboard.minutesAgo.replace('{count}', '5')}</div>
                      <div className="font-medium">{t.groupLeader.dashboard.receivedNewKPI.replace('{name}', 'Nguyễn Văn A')}</div>
                      <div className="text-xs text-gray-600">{t.groupLeader.dashboard.needsApproval}</div>
                    </div>
                  ),
                },
                {
                  color: 'green',
                  dot: <CheckCircle size={16} />,
                  children: (
                    <div>
                      <div className="text-sm text-gray-500">{t.groupLeader.dashboard.hourAgo.replace('{count}', '1')}</div>
                      <div className="font-medium">{t.groupLeader.dashboard.approvedKPIOf.replace('{name}', 'Trần Thị B')}</div>
                      <div className="text-xs text-gray-600">Q4/2024</div>
                    </div>
                  ),
                },
                {
                  color: 'red',
                  dot: <XCircle size={16} />,
                  children: (
                    <div>
                      <div className="text-sm text-gray-500">{t.groupLeader.dashboard.hourAgo.replace('{count}', '2')}</div>
                      <div className="font-medium">{t.groupLeader.dashboard.rejectedKPIOf.replace('{name}', 'Lê Văn C')}</div>
                      <div className="text-xs text-gray-600">{t.groupLeader.dashboard.needsMoreInfo}</div>
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
