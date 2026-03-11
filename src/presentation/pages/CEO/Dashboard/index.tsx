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
  Avatar,
  Space,
  Tooltip
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { 
  Building2,
  Users,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Target,
  Award,
  Eye,
  Activity,
  DollarSign,
  BarChart3,
  Crown
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { kpiApi } from '../../../../infrastructure/api';
import { storage } from '../../../../infrastructure/utils';
import { BRAND_COLORS } from '../../../../core/constants';
import type { IKPIRecord } from '../../../../core/models';

interface DepartmentSummary {
  id: string;
  name: string;
  code: string;
  manager: string;
  employees: number;
  kpiCount: number;
  pendingCount: number;
  avgPerformance: number;
  status: 'excellent' | 'good' | 'average' | 'poor';
  trend: 'up' | 'down' | 'stable';
}

interface StrategicKPI {
  id: string;
  title: string;
  department: string;
  submittedBy: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending_ceo' | 'approved' | 'rejected';
  targetCount: number;
}

export const CEODashboardPage = () => {
  const navigate = useNavigate();
  const [kpiList, setKpiList] = useState<IKPIRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const userName = storage.getUserName() || 'CEO';

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

  // Company-wide statistics
  const totalKPIs = kpiList.length;
  const pendingApprovalKPIs = kpiList.filter(k => k.status === 'pending_approval');
  const approvedKPIs = kpiList.filter(k => k.status === 'in_progress' || k.status === 'completed');
  const completionRate = totalKPIs > 0 ? Math.round((approvedKPIs.length / totalKPIs) * 100) : 0;

  // Mock departments data
  const departments: DepartmentSummary[] = [
    {
      id: '1',
      name: 'Sales',
      code: 'SALES',
      manager: 'Nguyễn Văn A',
      employees: 15,
      kpiCount: 45,
      pendingCount: 3,
      avgPerformance: 85,
      status: 'good',
      trend: 'up',
    },
    {
      id: '2',
      name: 'Marketing',
      code: 'MKT',
      manager: 'Trần Thị B',
      employees: 10,
      kpiCount: 30,
      pendingCount: 2,
      avgPerformance: 92,
      status: 'excellent',
      trend: 'up',
    },
    {
      id: '3',
      name: 'IT',
      code: 'IT',
      manager: 'Lê Văn C',
      employees: 12,
      kpiCount: 36,
      pendingCount: 1,
      avgPerformance: 88,
      status: 'good',
      trend: 'stable',
    },
    {
      id: '4',
      name: 'HR',
      code: 'HR',
      manager: 'Phạm Thị D',
      employees: 8,
      kpiCount: 24,
      pendingCount: 0,
      avgPerformance: 78,
      status: 'average',
      trend: 'down',
    },
  ];

  // Mock strategic KPIs
  const strategicKPIs: StrategicKPI[] = [
    {
      id: 'STR-001',
      title: 'Chiến lược Tăng trưởng Q4/2024',
      department: 'Sales',
      submittedBy: 'Nguyễn Văn A',
      priority: 'high',
      status: 'pending_ceo',
      targetCount: 8,
    },
    {
      id: 'STR-002',
      title: 'Digital Marketing 2024',
      department: 'Marketing',
      submittedBy: 'Trần Thị B',
      priority: 'high',
      status: 'pending_ceo',
      targetCount: 10,
    },
  ];

  const totalEmployees = departments.reduce((sum, d) => sum + d.employees, 0);
  const avgCompanyPerformance = Math.round(
    departments.reduce((sum, d) => sum + d.avgPerformance, 0) / departments.length
  );
  const totalPendingStrategic = strategicKPIs.filter(k => k.status === 'pending_ceo').length;

  // Department columns
  const departmentColumns: ColumnsType<DepartmentSummary> = [
    {
      title: 'Bộ phận',
      key: 'department',
      width: 180,
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <Avatar size={40} className="bg-gradient-to-br from-blue-500 to-purple-500">
            {record.code}
          </Avatar>
          <div>
            <div className="font-semibold">{record.name}</div>
            <div className="text-xs text-gray-500">{record.manager}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Nhân viên',
      dataIndex: 'employees',
      key: 'employees',
      align: 'center',
      width: 80,
      render: (count) => (
        <div className="flex items-center justify-center gap-1">
          <Users size={14} className="text-gray-500" />
          <span className="font-semibold">{count}</span>
        </div>
      ),
    },
    {
      title: 'Tổng KPI',
      dataIndex: 'kpiCount',
      key: 'kpiCount',
      align: 'center',
      width: 80,
      render: (count) => <Tag color="blue">{count}</Tag>,
    },
    {
      title: 'Chờ',
      dataIndex: 'pendingCount',
      key: 'pendingCount',
      align: 'center',
      width: 60,
      render: (count) => (
        count > 0 ? (
          <Tag color="orange" className="font-semibold">{count}</Tag>
        ) : (
          <Tag color="default">0</Tag>
        )
      ),
    },
    {
      title: 'Hiệu suất',
      key: 'performance',
      width: 200,
      render: (_, record) => (
        <div className="space-y-1">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-600">Trung bình</span>
            <div className="flex items-center gap-1">
              <span className="font-semibold">{record.avgPerformance}%</span>
              {record.trend === 'up' && <TrendingUp size={12} style={{ color: BRAND_COLORS.apple }} />}
              {record.trend === 'down' && <TrendingDown size={12} className="text-red-500" />}
            </div>
          </div>
          <Progress 
            percent={record.avgPerformance}
            size="small"
            strokeColor={{
              '0%': record.avgPerformance >= 85 ? '#52c41a' : 
                    record.avgPerformance >= 70 ? '#1890ff' : '#faad14',
              '100%': record.avgPerformance >= 85 ? '#73d13d' : 
                      record.avgPerformance >= 70 ? '#40a9ff' : '#ffc53d',
            }}
          />
        </div>
      ),
    },
    {
      title: 'Đánh giá',
      dataIndex: 'status',
      key: 'status',
      width: 90,
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
          onClick={() => navigate('/organization')}
        >
          Xem
        </Button>
      ),
    },
  ];

  // Strategic KPI columns
  const strategicColumns: ColumnsType<StrategicKPI> = [
    {
      title: 'Ưu tiên',
      dataIndex: 'priority',
      key: 'priority',
      width: 60,
      align: 'center',
      render: (priority: string) => {
        const config = {
          high: { icon: <AlertTriangle size={18} className="text-red-500" />, label: 'Cao' },
          medium: { icon: <Activity size={18} className="text-orange-500" />, label: 'TB' },
          low: { icon: <TrendingUp size={18} className="text-blue-500" />, label: 'Thấp' },
        };
        const { icon, label } = config[priority as keyof typeof config];
        return (
          <Tooltip title={label}>
            <span className="text-2xl">{icon}</span>
          </Tooltip>
        );
      },
    },
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
      render: (text) => <span className="font-semibold">{text}</span>,
      width: 200,
    },
    {
      title: 'Bộ phận',
      dataIndex: 'department',
      key: 'department',
      width: 80,
      render: (text) => <Tag color="purple">{text}</Tag>,
    },
    {
      title: 'Người gửi',
      dataIndex: 'submittedBy',
      key: 'submittedBy',
      width: 70,
    },
    {
      title: 'Số mục tiêu',
      dataIndex: 'targetCount',
      key: 'targetCount',
      align: 'center',
      width: 70,
      render: (count) => (
        <Badge count={count} showZero color="#4C9C2E">
          <Target size={20} className="text-gray-400" />
        </Badge>
      ),
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 60,
      align: 'center',
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          icon={<Eye size={14} />}
          onClick={() => navigate('/strategic')}
          className="bg-primary"
        >
          Duyệt
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-1 flex items-center gap-3">
          <Crown size={30} className="text-yellow-500" />
          CEO Dashboard
        </h1>
        <p className="text-gray-500">Chào mừng {userName}, tổng quan chiến lược toàn công ty</p>
      </div>

      {/* Strategic Alert */}
      {totalPendingStrategic > 0 && (
        <Card className="shadow-md border-l-4 border-l-red-500 bg-red-50">
          <div className="flex items-start gap-1">
            <AlertTriangle size={25} className="text-red-500 mt-1" />
            <div className="flex-1">
              <h3 className="font-semibold text-red-600 text-lg mb-1">
                Cảnh báo: {totalPendingStrategic} KPI chiến lược cần phê duyệt!
              </h3>
              <p className="text-gray-700 mb-2">
                Có {totalPendingStrategic} KPI chiến lược từ các Group Leader đang chờ phê duyệt của bạn.
              </p>
              <Button 
                danger
                icon={<Eye size={16} />}
                onClick={() => navigate('/strategic')}
                size="middle"
              >
                Xem ngay
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Key Metrics */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-md border-l-4 border-l-green-500 hover:shadow-lg transition-shadow">
            <Statistic
              title={<span className="text-gray-600 font-medium">Doanh thu</span>}
              value="3.8B"
              prefix={<DollarSign size={28} style={{ color: BRAND_COLORS.apple }} />}
              valueStyle={{ color: BRAND_COLORS.apple, fontSize: '32px', fontWeight: 'bold' }}
              suffix={
                <div className="flex items-center gap-1 text-sm">
                  <TrendingUp size={14} style={{ color: BRAND_COLORS.apple }} />
                  <span style={{ color: BRAND_COLORS.apple }}>+12.5%</span>
                </div>
              }
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-md border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
            <Statistic
              title={<span className="text-gray-600 font-medium">Hiệu suất TB</span>}
              value={avgCompanyPerformance}
              prefix={<Activity size={28} className="text-blue-500" />}
              valueStyle={{ color: '#1890ff', fontSize: '32px', fontWeight: 'bold' }}
              suffix={
                <div className="flex items-center gap-1 text-sm">
                  <span>%</span>
                  <TrendingUp size={14} style={{ color: BRAND_COLORS.apple }} />
                  <span style={{ color: BRAND_COLORS.apple }}>+3.2%</span>
                </div>
              }
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-md border-l-4 border-l-purple-500 hover:shadow-lg transition-shadow">
            <Statistic
              title={<span className="text-gray-600 font-medium">Tổng nhân viên</span>}
              value={totalEmployees}
              prefix={<Users size={28} className="text-purple-500" />}
              valueStyle={{ color: '#722ed1', fontSize: '32px', fontWeight: 'bold' }}
              suffix={
                <div className="flex items-center gap-1 text-sm">
                  <TrendingUp size={14} style={{ color: BRAND_COLORS.apple }} />
                  <span style={{ color: BRAND_COLORS.apple }}>+2</span>
                </div>
              }
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-md border-l-4 border-l-orange-500 hover:shadow-lg transition-shadow">
            <Statistic
              title={<span className="text-gray-600 font-medium">KPI hoàn thành</span>}
              value={completionRate}
              suffix="%"
              prefix={<Target size={28} className="text-orange-500" />}
              valueStyle={{ color: '#fa8c16', fontSize: '32px', fontWeight: 'bold' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Content */}
      <Row gutter={[16, 16]}>
        {/* Left Column */}
        <Col xs={24} lg={14}>
          {/* Strategic KPIs Pending */}
          {strategicKPIs.filter(k => k.status === 'pending_ceo').length > 0 && (
            <Card 
              title={
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target size={20} className="text-red-500" />
                    <span className="font-semibold">KPI Chiến lược chờ phê duyệt</span>
                    <Badge count={totalPendingStrategic} showZero color="#ff4d4f" />
                  </div>
                  <div
                  className='text-sm cursor-pointer text-blue-600 hover:text-blue-400 underline'
                    onClick={() => navigate('/strategic')}
                  >
                    Xem tất cả
                  </div>
                </div>
              }
              className="shadow-md mb-4"
            >
              <Table
                columns={strategicColumns}
                dataSource={strategicKPIs.filter(k => k.status === 'pending_ceo')}
                rowKey="id"
                pagination={false}
                size="small"
                loading={loading}
                bordered
                scroll={{x:800}}
              />
            </Card>
          )}

          {/* Department Performance */}
          <Card 
            title={
              <div className="flex items-center gap-2">
                <Building2 size={20} className="text-primary" />
                <span className="font-semibold">Hiệu suất các bộ phận</span>
              </div>
            }
            className="shadow-md"
          >
            <Table
              columns={departmentColumns}
              dataSource={departments}
              rowKey="id"
              pagination={false}
              size="small"
              loading={loading}
              bordered
              scroll={{x:900}}
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
                onClick={() => navigate('/strategic')}
                block
                size="middle"
                className="bg-red-500 hover:bg-red-600"
                danger
              >
                Phê duyệt Chiến lược ({totalPendingStrategic})
              </Button>
              <Button
                type="primary"
                icon={<Activity size={16} />}
                onClick={() => navigate('/executive')}
                block
                size="middle"
                className="bg-primary"
              >
                Executive Dashboard
              </Button>
              <Button
                icon={<Building2 size={16} />}
                onClick={() => navigate('/organization')}
                block
                size="middle"
              >
                Tổng quan Tổ chức
              </Button>
            </div>
          </Card>

          {/* Company Overview */}
          <Card 
            title={
              <div className="flex items-center gap-2">
                <Target size={18} className="text-primary" />
                <span>Tổng quan công ty</span>
              </div>
            }
            className="shadow-md mb-4"
          >
            <div className="space-y-4">
              <div className="text-center py-4">
                <Progress
                  type="circle"
                  percent={avgCompanyPerformance}
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
                  <div className="text-2xl font-bold text-purple-600">{departments.length}</div>
                  <div className="text-xs text-gray-600">Bộ phận</div>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg text-center">
                  <div className="text-2xl font-bold text-blue-600">{totalEmployees}</div>
                  <div className="text-xs text-gray-600">Nhân viên</div>
                </div>
                <div className="p-3 rounded-lg text-center" style={{ backgroundColor: '#f4f7e6' }}>
                  <div className="text-2xl font-bold" style={{ color: BRAND_COLORS.apple }}>{totalKPIs}</div>
                  <div className="text-xs text-gray-600">Tổng KPI</div>
                </div>
                <div className="bg-orange-50 p-3 rounded-lg text-center">
                  <div className="text-2xl font-bold text-orange-600">{completionRate}%</div>
                  <div className="text-xs text-gray-600">Hoàn thành</div>
                </div>
              </div>
            </div>
          </Card>

          {/* Top Departments */}
          <Card 
            title={
              <div className="flex items-center gap-2">
                <Award size={18} className="text-yellow-500" />
                <span>Top Bộ phận</span>
              </div>
            }
            className="shadow-md"
          >
            <div className="space-y-3">
              {[...departments]
                .sort((a, b) => b.avgPerformance - a.avgPerformance)
                .slice(0, 3)
                .map((dept, index) => (
                  <div key={dept.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                      index === 0 ? 'bg-yellow-100 text-yellow-600' :
                      index === 1 ? 'bg-gray-200 text-gray-600' :
                      'bg-orange-100 text-orange-600'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold truncate">{dept.name}</div>
                      <div className="text-xs text-gray-500">{dept.manager}</div>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <div className="text-lg font-bold text-primary">{dept.avgPerformance}%</div>
                      <div className="text-xs text-gray-500">{dept.employees} NV</div>
                    </div>
                  </div>
                ))}
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};
