import { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Progress, Button, Timeline, Empty, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  TrendingUp,
  Plus,
  AlertCircle,
  Target,
  Award,
  Calendar,
  Activity,
  Eye
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { kpiApi } from '../../../../infrastructure/api';
import { storage } from '../../../../infrastructure/utils';
import { getUnreadCount } from '../../../../infrastructure/api/mockNotifications';
import type { IKPIRecord } from '../../../../core/models';
import { KPIStatusTag } from '../../../components';
import { useTranslation } from '../../../../infrastructure/i18n';

export const EmployeeDashboardPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [kpiList, setKpiList] = useState<IKPIRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const userId = storage.getUserId();
  const unreadNotifications = getUnreadCount(userId || '1');

  useEffect(() => {
    fetchKPIList();
  }, []);

  const fetchKPIList = async () => {
    setLoading(true);
    try {
      const response = await kpiApi.getList();
      if (response.data.data) {
        const myKPIs = response.data.data.filter(
          (k: IKPIRecord) => k.employeeId === userId
        );
        setKpiList(myKPIs);
      }
    } catch (error: any) {
      toast.error(t.dashboard.employee.cannotLoadKPIs);
    } finally {
      setLoading(false);
    }
  };

  const draftKPIs = kpiList.filter(k => k.status === 'draft');
  const pendingKPIs = kpiList.filter(k => 
    k.status === 'pending_approval'
  );
  const approvedKPIs = kpiList.filter(k => k.status === 'in_progress' || k.status === 'completed');
  const rejectedKPIs = kpiList.filter(k => k.status === 'rejected');

  // Calculate average completion rate
  const avgCompletionRate = approvedKPIs.length > 0
    ? Math.round(
        approvedKPIs.reduce((sum, kpi) => {
          const totalCompletion = kpi.targets.reduce(
            (tSum, t) => tSum + (t.completionRate || 0),
            0
          );
          return sum + (totalCompletion / kpi.targets.length);
        }, 0) / approvedKPIs.length
      )
    : 0;

  // Get all targets from approved KPIs
  const allTargets = approvedKPIs.flatMap(kpi => 
    kpi.targets.map(target => ({
      ...target,
      kpiId: kpi.id,
      year: kpi.year
    }))
  );

  // Calculate targets by status
  const onTrackTargets = allTargets.filter(t => (t.completionRate || 0) >= 80);
  const atRiskTargets = allTargets.filter(t => (t.completionRate || 0) >= 50 && (t.completionRate || 0) < 80);
  const behindTargets = allTargets.filter(t => (t.completionRate || 0) < 50);

  // Get top performing targets
  const topTargets = [...allTargets]
    .sort((a, b) => (b.completionRate || 0) - (a.completionRate || 0))
    .slice(0, 5);

  // Recent KPIs for quick access
  const recentKPIs = [...kpiList]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  // Columns for recent KPIs table
  const columns: ColumnsType<IKPIRecord> = [
    {
      title: t.kpiList.recordCode,
      dataIndex: 'id',
      key: 'id',
      width: 150,
      render: (text) => (
        <span className="font-mono text-xs font-semibold text-primary">{text}</span>
      ),
    },
    {
      title: t.kpiList.year,
      dataIndex: 'year',
      key: 'year',
      width: 80,
      align: 'center',
    },
    {
      title: t.kpiList.targets,
      key: 'targets',
      width: 100,
      align: 'center',
      render: (_, record) => (
        <Tag color="blue">{record.targets.length}</Tag>
      ),
    },
    {
      title: t.kpiList.status,
      dataIndex: 'status',
      key: 'status',
      width: 130,
      render: (status) => <KPIStatusTag status={status} />,
    },
    {
      title: t.kpiList.action,
      key: 'action',
      width: 100,
      align: 'center',
      render: (_, record) => (
        <Button
          type="link"
          icon={<Eye size={14} />}
          onClick={() => navigate(`/kpi/${record.id}`)}
        >
          {t.common.view}
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-2">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {t.dashboard.employee.title}
        </h1>
        <p className="text-gray-500">{t.dashboard.employee.subtitle}</p>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[10, 10]}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-sm hover:shadow-md transition-shadow border-l-4 border-l-blue-500">
            <Statistic
              title={<span className="text-gray-600 font-medium">{t.dashboard.employee.totalKPIs}</span>}
              value={kpiList.length}
              prefix={<FileText size={24} className="text-blue-500" />}
              valueStyle={{ color: '#1890ff', fontWeight: 'bold' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-sm hover:shadow-md transition-shadow border-l-4 border-l-orange-500">
            <Statistic
              title={<span className="text-gray-600 font-medium">{t.dashboard.employee.drafts}</span>}
              value={draftKPIs.length}
              prefix={<Clock size={24} className="text-orange-500" />}
              valueStyle={{ color: '#fa8c16', fontWeight: 'bold' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-sm hover:shadow-md transition-shadow border-l-4 border-l-yellow-500">
            <Statistic
              title={<span className="text-gray-600 font-medium">{t.dashboard.employee.pendingApproval}</span>}
              value={pendingKPIs.length}
              prefix={<Clock size={24} className="text-yellow-500" />}
              valueStyle={{ color: '#faad14', fontWeight: 'bold' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-sm hover:shadow-md transition-shadow border-l-4 border-l-green-500">
            <Statistic
              title={<span className="text-gray-600 font-medium">{t.dashboard.employee.approved}</span>}
              value={approvedKPIs.length}
              prefix={<CheckCircle size={24} className="text-green-500" />}
              valueStyle={{ color: '#52c41a', fontWeight: 'bold' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Target Status Overview */}
      {approvedKPIs.length > 0 && (
        <Card className="shadow-sm mt-4">
          <div className="mb-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-semibold text-gray-700">{t.dashboard.employee.targetOverview}</h3>
              <span className="text-sm text-gray-500">{allTargets.length} {t.dashboard.employee.targets}</span>
            </div>
            
            {/* Progress Bar */}
            <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
              {/* On Track - Green */}
              <div 
                className="absolute left-0 top-0 h-full bg-green-500 transition-all duration-500 flex items-center justify-center"
                style={{ width: `${(onTrackTargets.length / allTargets.length) * 100}%` }}
              >
                {onTrackTargets.length > 0 && (
                  <span className="text-white text-xs font-semibold px-2">
                    {onTrackTargets.length}
                  </span>
                )}
              </div>
              
              {/* At Risk - Orange */}
              <div 
                className="absolute top-0 h-full bg-orange-500 transition-all duration-500 flex items-center justify-center"
                style={{ 
                  left: `${(onTrackTargets.length / allTargets.length) * 100}%`,
                  width: `${(atRiskTargets.length / allTargets.length) * 100}%` 
                }}
              >
                {atRiskTargets.length > 0 && (
                  <span className="text-white text-xs font-semibold px-2">
                    {atRiskTargets.length}
                  </span>
                )}
              </div>
              
              {/* Behind - Red */}
              <div 
                className="absolute right-0 top-0 h-full bg-red-500 transition-all duration-500 flex items-center justify-center"
                style={{ width: `${(behindTargets.length / allTargets.length) * 100}%` }}
              >
                {behindTargets.length > 0 && (
                  <span className="text-white text-xs font-semibold px-2">
                    {behindTargets.length}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-700">{t.dashboard.employee.onTrack}</div>
                <div className="text-xs text-gray-500">
                  {onTrackTargets.length} {t.dashboard.employee.targets} • ≥80%
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-500 rounded"></div>
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-700">{t.dashboard.employee.atRisk}</div>
                <div className="text-xs text-gray-500">
                  {atRiskTargets.length} {t.dashboard.employee.targets} • 50-79%
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-700">{t.dashboard.employee.behind}</div>
                <div className="text-xs text-gray-500">
                  {behindTargets.length} {t.dashboard.employee.targets} • &lt;50%
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Main Content */}
      <Row gutter={[16, 16]}>
        {/* Left Column */}
        <Col xs={24} lg={12}>
          {/* Performance Overview */}
          {approvedKPIs.length > 0 ? (
            <Card 
              title={
                <div className="flex items-center gap-2">
                  <Target size={20} className="text-primary" />
                  <span className="text-lg font-semibold">{t.dashboard.employee.overallPerformance}</span>
                </div>
              }
              className="shadow-sm mb-4"
            >
              <div className="text-center py-6">
                <Progress
                  type="circle"
                  percent={avgCompletionRate}
                  strokeColor={{
                    '0%': '#108ee9',
                    '100%': '#87d068',
                  }}
                  strokeWidth={12}
                  width={180}
                  format={(percent) => (
                    <div className="text-center">
                      <div className="text-5xl font-bold text-primary">{percent}%</div>
                      <div className="text-sm text-gray-500 mt-2">{t.dashboard.employee.completion}</div>
                    </div>
                  )}
                />
                <div className="mt-6 grid grid-cols-3 gap-4">
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {approvedKPIs.reduce((sum, k) => sum + k.targets.length, 0)}
                    </div>
                    <div className="text-sm text-gray-500">{t.dashboard.employee.activeTargets}</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-600">
                      {approvedKPIs.length}
                    </div>
                    <div className="text-sm text-gray-500">{t.dashboard.employee.activeKPIs}</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-orange-600">
                      {unreadNotifications}
                    </div>
                    <div className="text-sm text-gray-500">{t.dashboard.employee.newNotifications}</div>
                  </div>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="shadow-sm mb-4">
              <Empty
                description={t.dashboard.employee.noApprovedKPIs}
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              >
                <Button 
                  type="primary" 
                  icon={<Plus size={16} />}
                  onClick={() => navigate('/kpi/create')}
                  className="bg-primary"
                >
                  {t.dashboard.employee.createNewKPI}
                </Button>
              </Empty>
            </Card>
          )}

          {/* Top Performing Targets */}
          {topTargets.length > 0 && (
            <Card 
              title={
                <div className="flex items-center gap-2">
                  <Award size={20} className="text-yellow-500" />
                  <span className="text-lg font-semibold">{t.dashboard.employee.topTargets}</span>
                </div>
              }
              className="shadow-sm"
            >
              <div className="space-y-3">
                {topTargets.map((target, index) => (
                  <div key={target.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                      index === 0 ? 'bg-yellow-100 text-yellow-600' :
                      index === 1 ? 'bg-gray-200 text-gray-600' :
                      index === 2 ? 'bg-orange-100 text-orange-600' :
                      'bg-blue-100 text-blue-600'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{target.title}</div>
                      <div className="text-xs text-gray-500">
                        {target.category} • {target.weight}%
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <Progress
                        type="circle"
                        percent={target.completionRate || 0}
                        width={50}
                        strokeWidth={8}
                        strokeColor={
                          (target.completionRate || 0) >= 90 ? '#52c41a' :
                          (target.completionRate || 0) >= 70 ? '#1890ff' :
                          '#faad14'
                        }
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Rejected KPIs Alert */}
          {rejectedKPIs.length > 0 && (
            <Card className="shadow-sm border-l-4 border-l-red-500 mt-4">
              <div className="flex items-start gap-3">
                <AlertCircle size={24} className="text-red-500 mt-1" />
                <div className="flex-1">
                  <h3 className="font-semibold text-red-600 mb-2">
                    {t.dashboard.employee.rejectedKPIs} ({rejectedKPIs.length})
                  </h3>
                  <p className="text-gray-600 mb-3">
                    {t.dashboard.employee.rejectedAlert.replace('{count}', rejectedKPIs.length.toString())}
                  </p>
                  <Button 
                    danger
                    onClick={() => navigate('/kpi')}
                  >
                    {t.dashboard.employee.viewDetails}
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </Col>

        {/* Right Column */}
        <Col xs={24} lg={12}>
          {/* Quick Actions */}
          <Card 
            title={
              <div className="flex items-center gap-2">
                <Activity size={18} className="text-primary" />
                <span>{t.dashboard.employee.quickActions}</span>
              </div>
            }
            className="shadow-sm mb-4"
          >
            <div className="space-y-3">
              <Button
                type="primary"
                icon={<Plus size={16} />}
                onClick={() => navigate('/kpi/create')}
                block
                size="large"
                className="bg-primary"
              >
                {t.dashboard.employee.createNewKPI}
              </Button>
              <Button
                icon={<TrendingUp size={16} />}
                onClick={() => navigate('/progress')}
                block
                size="large"
              >
                {t.dashboard.employee.checkInProgress}
              </Button>
              <Button
                icon={<FileText size={16} />}
                onClick={() => navigate('/kpi')}
                block
                size="large"
              >
                {t.dashboard.employee.viewAllKPIs}
              </Button>
            </div>
          </Card>

          {/* Recent KPIs */}
          {recentKPIs.length > 0 && (
            <Card 
              title={
                <div className="flex items-center gap-2">
                  <Calendar size={18} className="text-primary" />
                  <span>{t.dashboard.employee.recentKPIs}</span>
                </div>
              }
              className="shadow-sm mb-4"
            >
              <Table
                columns={columns}
                dataSource={recentKPIs}
                rowKey="id"
                pagination={false}
                size="small"
              />
            </Card>
          )}

          {/* Recent Activities */}
          <Card 
            title={
              <div className="flex items-center gap-2">
                <Clock size={18} className="text-primary" />
                <span>{t.dashboard.employee.recentActivities}</span>
              </div>
            }
            className="shadow-sm"
          >
            <Timeline
              items={[
                ...(rejectedKPIs.length > 0 ? [{
                  color: 'red',
                  children: (
                    <div>
                      <div className="text-sm text-gray-500">{t.dashboard.employee.today}</div>
                      <div className="font-medium">{t.dashboard.employee.kpiRejected}</div>
                      <div className="text-xs text-gray-600">{t.dashboard.employee.needsRevision}</div>
                    </div>
                  ),
                }] : []),
                ...(pendingKPIs.length > 0 ? [{
                  color: 'blue',
                  children: (
                    <div>
                      <div className="text-sm text-gray-500">{t.dashboard.employee.yesterday}</div>
                      <div className="font-medium">{t.dashboard.employee.kpiSubmitted}</div>
                      <div className="text-xs text-gray-600">{t.dashboard.employee.waitingForManager}</div>
                    </div>
                  ),
                }] : []),
                ...(approvedKPIs.length > 0 ? [{
                  color: 'green',
                  children: (
                    <div>
                      <div className="text-sm text-gray-500">{t.dashboard.employee.daysAgo.replace('{count}', '2')}</div>
                      <div className="font-medium">{t.dashboard.employee.kpiApproved}</div>
                      <div className="text-xs text-gray-600">{t.dashboard.employee.startExecution}</div>
                    </div>
                  ),
                }] : []),
              ]}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};
