import { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Progress, Button, Timeline, Empty } from 'antd';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  TrendingUp,
  Plus,
  AlertCircle,
  Target
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { kpiApi } from '../../../infrastructure/api';
import { storage } from '../../../infrastructure/utils';
import { getUnreadCount } from '../../../infrastructure/api/mockNotifications';
import type { IKPIRecord } from '../../../core/models';

export const EmployeeDashboardPage = () => {
  const navigate = useNavigate();
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
      toast.error('Không thể tải danh sách KPI');
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

  return (
    <div className="space-y-2">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Dashboard - Nhân viên
        </h1>
        <p className="text-gray-500">Tổng quan KPI cá nhân của bạn</p>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[10, 10]}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-sm hover:shadow-md transition-shadow border-l-4 border-l-blue-500">
            <Statistic
              title={<span className="text-gray-600 font-medium">Tổng số KPI</span>}
              value={kpiList.length}
              prefix={<FileText size={24} className="text-blue-500" />}
              valueStyle={{ color: '#1890ff', fontWeight: 'bold' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-sm hover:shadow-md transition-shadow border-l-4 border-l-orange-500">
            <Statistic
              title={<span className="text-gray-600 font-medium">Bản nháp</span>}
              value={draftKPIs.length}
              prefix={<Clock size={24} className="text-orange-500" />}
              valueStyle={{ color: '#fa8c16', fontWeight: 'bold' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-sm hover:shadow-md transition-shadow border-l-4 border-l-yellow-500">
            <Statistic
              title={<span className="text-gray-600 font-medium">Đang chờ duyệt</span>}
              value={pendingKPIs.length}
              prefix={<Clock size={24} className="text-yellow-500" />}
              valueStyle={{ color: '#faad14', fontWeight: 'bold' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-sm hover:shadow-md transition-shadow border-l-4 border-l-green-500">
            <Statistic
              title={<span className="text-gray-600 font-medium">Đã duyệt</span>}
              value={approvedKPIs.length}
              prefix={<CheckCircle size={24} className="text-green-500" />}
              valueStyle={{ color: '#52c41a', fontWeight: 'bold' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Content */}
      <Row gutter={[16, 16]}>
        {/* Left Column */}
        <Col xs={24} lg={16}>
          {/* Performance Overview */}
          {approvedKPIs.length > 0 ? (
            <Card 
              title={
                <div className="flex items-center gap-2">
                  <Target size={20} className="text-primary" />
                  <span className="text-lg font-semibold">Hiệu suất tổng thể</span>
                </div>
              }
              className="shadow-sm mb-4"
            >
              <div className="text-center py-8">
                <Progress
                  type="circle"
                  percent={avgCompletionRate}
                  strokeColor="#4C9C2E"
                  strokeWidth={12}
                  width={200}
                  format={(percent) => (
                    <div className="text-center">
                      <div className="text-5xl font-bold text-primary">{percent}%</div>
                      <div className="text-sm text-gray-500 mt-2">Hoàn thành</div>
                    </div>
                  )}
                />
                <div className="mt-6 grid grid-cols-3 gap-4">
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {approvedKPIs.reduce((sum, k) => sum + k.targets.length, 0)}
                    </div>
                    <div className="text-sm text-gray-500">Mục tiêu</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-600">
                      {approvedKPIs.length}
                    </div>
                    <div className="text-sm text-gray-500">KPI đang chạy</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-orange-600">
                      {unreadNotifications}
                    </div>
                    <div className="text-sm text-gray-500">Thông báo mới</div>
                  </div>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="shadow-sm mb-4">
              <Empty
                description="Bạn chưa có KPI nào được phê duyệt"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              >
                <Button 
                  type="primary" 
                  icon={<Plus size={16} />}
                  onClick={() => navigate('/kpi/create')}
                  className="bg-primary"
                >
                  Tạo KPI mới
                </Button>
              </Empty>
            </Card>
          )}

          {/* Rejected KPIs Alert */}
          {rejectedKPIs.length > 0 && (
            <Card className="shadow-sm border-l-4 border-l-red-500">
              <div className="flex items-start gap-3">
                <AlertCircle size={24} className="text-red-500 mt-1" />
                <div className="flex-1">
                  <h3 className="font-semibold text-red-600 mb-2">
                    KPI bị từ chối ({rejectedKPIs.length})
                  </h3>
                  <p className="text-gray-600 mb-3">
                    Bạn có {rejectedKPIs.length} KPI bị từ chối. Vui lòng xem lý do và chỉnh sửa lại.
                  </p>
                  <Button 
                    danger
                    onClick={() => navigate('/kpi')}
                  >
                    Xem chi tiết
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </Col>

        {/* Right Column */}
        <Col xs={24} lg={8}>
          {/* Quick Actions */}
          <Card 
            title="Hành động nhanh"
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
                Tạo KPI mới
              </Button>
              <Button
                icon={<TrendingUp size={16} />}
                onClick={() => navigate('/progress')}
                block
                size="large"
              >
                Check-in tiến độ
              </Button>
              <Button
                icon={<FileText size={16} />}
                onClick={() => navigate('/kpi')}
                block
                size="large"
              >
                Xem tất cả KPI
              </Button>
            </div>
          </Card>

          {/* Recent Activities */}
          <Card 
            title={
              <div className="flex items-center gap-2">
                <Clock size={18} className="text-primary" />
                <span>Hoạt động gần đây</span>
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
                      <div className="text-sm text-gray-500">Hôm nay</div>
                      <div className="font-medium">❌ KPI bị từ chối</div>
                      <div className="text-xs text-gray-600">Cần chỉnh sửa lại</div>
                    </div>
                  ),
                }] : []),
                ...(pendingKPIs.length > 0 ? [{
                  color: 'blue',
                  children: (
                    <div>
                      <div className="text-sm text-gray-500">Hôm qua</div>
                      <div className="font-medium">📝 Đã gửi KPI duyệt</div>
                      <div className="text-xs text-gray-600">Đang chờ quản lý</div>
                    </div>
                  ),
                }] : []),
                ...(approvedKPIs.length > 0 ? [{
                  color: 'green',
                  children: (
                    <div>
                      <div className="text-sm text-gray-500">2 ngày trước</div>
                      <div className="font-medium">✅ KPI được duyệt</div>
                      <div className="text-xs text-gray-600">Bắt đầu thực hiện</div>
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
