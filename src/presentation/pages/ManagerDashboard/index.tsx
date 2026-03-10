import { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Table, Button, Progress, Tag, Timeline } from 'antd';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Eye,
  ThumbsUp,
  ThumbsDown,
  Bell
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { kpiApi } from '../../../infrastructure/api';
import { KPIStatusTag } from '../../components';
import type { IKPIRecord } from '../../../core/models';
import type { ColumnsType } from 'antd/es/table';

interface TeamMember {
  id: string;
  name: string;
  department: string;
  progress: number;
  status: 'on-track' | 'off-track' | 'at-risk';
  targetCount: number;
}

export const ManagerDashboardPage = () => {
  const navigate = useNavigate();
  const [kpiList, setKpiList] = useState<IKPIRecord[]>([]);
  const [loading, setLoading] = useState(false);

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
      toast.error(error?.response?.data?.message || 'Không thể tải danh sách KPI');
    } finally {
      setLoading(false);
    }
  };

  // Filter KPIs for manager
  const pendingKPIs = kpiList.filter(k => k.status === 'pending_approval');
  const approvedKPIs = kpiList.filter(k => k.status === 'in_progress' || k.status === 'completed');
  const totalKPIs = kpiList.length;
  
  // Mock off-track employees
  const offTrackEmployees: TeamMember[] = [
    {
      id: '1',
      name: 'Hoàng Văn E',
      department: 'Kinh doanh',
      progress: 45,
      status: 'off-track',
      targetCount: 5,
    },
    {
      id: '2',
      name: 'Vũ Thị F',
      department: 'Marketing',
      progress: 38,
      status: 'off-track',
      targetCount: 4,
    },
  ];

  // Pending approval columns
  const pendingColumns: ColumnsType<IKPIRecord> = [
    {
      title: '#',
      key: 'priority',
      width: 60,
      render: (_, __, index) => {
        const daysSinceSubmit = Math.floor(Math.random() * 3);
        const color = daysSinceSubmit >= 2 ? 'red' : daysSinceSubmit >= 1 ? 'orange' : 'green';
        return (
          <div className={`w-8 h-8 rounded-full bg-${color}-100 flex items-center justify-center`}>
            <span className={`text-${color}-600 font-bold text-xs`}>
              {color === 'red' ? '🔴' : color === 'orange' ? '🟡' : '🟢'}
            </span>
          </div>
        );
      },
    },
    {
      title: 'Nhân viên',
      dataIndex: 'employeeName',
      key: 'employeeName',
      render: (text) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
            <span className="text-blue-600 font-semibold text-xs">
              {text.charAt(0)}
            </span>
          </div>
          <span className="font-medium">{text}</span>
        </div>
      ),
    },
    {
      title: 'Bộ phận',
      dataIndex: 'department',
      key: 'department',
    },
    {
      title: 'Số mục tiêu',
      key: 'targets',
      align: 'center',
      render: (_, record) => (
        <Tag color="blue">{record.targets.length} mục tiêu</Tag>
      ),
    },
    {
      title: 'Ngày gửi',
      key: 'submittedAt',
      render: () => {
        const days = Math.floor(Math.random() * 3);
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
      align: 'center',
      render: (_, record) => (
        <div className="flex gap-2 justify-center">
          <Button
            type="primary"
            size="small"
            icon={<ThumbsUp size={14} />}
            className="bg-primary hover:bg-primary-dark"
          >
            Duyệt
          </Button>
          <Button
            danger
            size="small"
            icon={<ThumbsDown size={14} />}
          >
            Từ chối
          </Button>
        </div>
      ),
    },
  ];

  // Off-track employees columns
  const offTrackColumns: ColumnsType<TeamMember> = [
    {
      title: '#',
      key: 'alert',
      width: 60,
      render: () => (
        <AlertTriangle size={20} className="text-orange-500" />
      ),
    },
    {
      title: 'Nhân viên',
      dataIndex: 'name',
      key: 'name',
      render: (text) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
            <span className="text-orange-600 font-semibold text-xs">
              {text.charAt(0)}
            </span>
          </div>
          <span className="font-medium">{text}</span>
        </div>
      ),
    },
    {
      title: 'Bộ phận',
      dataIndex: 'department',
      key: 'department',
    },
    {
      title: 'Tiến độ',
      key: 'progress',
      render: (_, record) => (
        <div className="w-full">
          <Progress 
            percent={record.progress} 
            status={record.progress < 50 ? 'exception' : 'normal'}
            size="small"
          />
        </div>
      ),
    },
    {
      title: 'Mục tiêu',
      dataIndex: 'targetCount',
      key: 'targetCount',
      align: 'center',
      render: (count) => <Tag>{count} mục tiêu</Tag>,
    },
    {
      title: 'Hành động',
      key: 'action',
      align: 'center',
      render: () => (
        <div className="flex gap-2 justify-center">
          <Button size="small" icon={<Bell size={14} />}>
            Nhắc
          </Button>
          <Button size="small" icon={<Eye size={14} />}>
            Xem
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Team Leader</h1>
        <p className="text-gray-500">Tổng quan hiệu suất Team</p>
      </div>

      {/* Section 1: Statistics Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-sm hover:shadow-md transition-shadow border-l-4 border-l-blue-500">
            <Statistic
              title={<span className="text-gray-600 font-medium">Tổng số KPI Team</span>}
              value={totalKPIs}
              prefix={<FileText size={24} className="text-blue-500" />}
              valueStyle={{ color: '#1890ff', fontWeight: 'bold' }}
              suffix={
                <span className="text-sm text-gray-500">
                  +12% so kỳ trước
                </span>
              }
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-sm hover:shadow-md transition-shadow border-l-4 border-l-yellow-500">
            <Statistic
              title={<span className="text-gray-600 font-medium">Chờ duyệt</span>}
              value={pendingKPIs.length}
              prefix={<Clock size={24} className="text-yellow-500" />}
              valueStyle={{ color: '#faad14', fontWeight: 'bold' }}
              suffix={
                <span className="text-sm text-red-500">
                  Cần xử lý ngay
                </span>
              }
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
              suffix={
                <span className="text-sm text-gray-500">
                  {totalKPIs > 0 ? Math.round((approvedKPIs.length / totalKPIs) * 100) : 0}%
                </span>
              }
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-sm hover:shadow-md transition-shadow border-l-4 border-l-orange-500">
            <Statistic
              title={<span className="text-gray-600 font-medium">Off-track</span>}
              value={offTrackEmployees.length}
              prefix={<AlertTriangle size={24} className="text-orange-500" />}
              valueStyle={{ color: '#fa8c16', fontWeight: 'bold' }}
              suffix={
                <span className="text-sm text-orange-500">
                  Nhân viên chậm tiến độ
                </span>
              }
            />
          </Card>
        </Col>
      </Row>

      {/* Section 2: Charts */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card 
            title={
              <div className="flex items-center gap-2">
                <FileText size={20} className="text-primary" />
                <span className="text-lg font-semibold">Tiến độ KPI Team</span>
              </div>
            }
            className="shadow-sm"
          >
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Q1 2026</span>
                  <span className="font-semibold text-primary">85%</span>
                </div>
                <Progress percent={85} strokeColor="#4C9C2E" />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Q2 2026</span>
                  <span className="font-semibold text-primary">72%</span>
                </div>
                <Progress percent={72} strokeColor="#4C9C2E" />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Q3 2026</span>
                  <span className="font-semibold text-blue-500">65%</span>
                </div>
                <Progress percent={65} strokeColor="#3b82f6" status="active" />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Q4 2026</span>
                  <span className="font-semibold text-gray-400">0%</span>
                </div>
                <Progress percent={0} strokeColor="#d1d5db" />
              </div>
              <div className="pt-4 border-t">
                <div className="text-center">
                  <span className="text-gray-600">Trung bình: </span>
                  <span className="text-2xl font-bold text-primary">75%</span>
                </div>
              </div>
            </div>
          </Card>
        </Col>
        
        <Col xs={24} lg={12}>
          <Card 
            title={
              <div className="flex items-center gap-2">
                <CheckCircle size={20} className="text-primary" />
                <span className="text-lg font-semibold">Tỷ lệ hoàn thành</span>
              </div>
            }
            className="shadow-sm"
          >
            <div className="flex flex-col items-center justify-center h-full py-8">
              <div className="relative w-48 h-48 mb-6">
                <Progress 
                  type="circle" 
                  percent={75} 
                  strokeColor="#4C9C2E"
                  strokeWidth={12}
                  format={(percent) => (
                    <div className="text-center">
                      <div className="text-4xl font-bold text-primary">{percent}%</div>
                      <div className="text-sm text-gray-500">Hoàn thành</div>
                    </div>
                  )}
                />
              </div>
              <div className="space-y-2 w-full">
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-gray-600">Hoàn thành</span>
                  </span>
                  <span className="font-semibold">18 (75%)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span className="text-gray-600">Đang thực hiện</span>
                  </span>
                  <span className="font-semibold">4 (17%)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                    <span className="text-gray-600">Chậm tiến độ</span>
                  </span>
                  <span className="font-semibold">2 (8%)</span>
                </div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Section 3: Pending Approvals */}
      <Card 
        title={
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell size={20} className="text-primary" />
              <span className="text-lg font-semibold">
                KPI cần duyệt ngay ({pendingKPIs.length} hồ sơ)
              </span>
            </div>
            <Button type="link" onClick={() => navigate('/approval')}>
              Xem tất cả →
            </Button>
          </div>
        }
        className="shadow-sm"
      >
        <Table
          columns={pendingColumns}
          dataSource={pendingKPIs.slice(0, 5)}
          loading={loading}
          rowKey="id"
          pagination={false}
        />
      </Card>

      {/* Section 4: Off-track Employees */}
      <Card 
        title={
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle size={20} className="text-orange-500" />
              <span className="text-lg font-semibold">
                Nhân viên chậm tiến độ ({offTrackEmployees.length} người)
              </span>
            </div>
            <Button type="link">
              Xem chi tiết →
            </Button>
          </div>
        }
        className="shadow-sm"
      >
        <Table
          columns={offTrackColumns}
          dataSource={offTrackEmployees}
          rowKey="id"
          pagination={false}
        />
      </Card>

      {/* Section 5: Recent Activities */}
      <Card 
        title={
          <div className="flex items-center gap-2">
            <Clock size={20} className="text-primary" />
            <span className="text-lg font-semibold">Hoạt động gần đây</span>
          </div>
        }
        className="shadow-sm"
      >
        <Timeline
          items={[
            {
              color: 'green',
              children: (
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-gray-500 text-sm">10:30 - Hôm nay</span>
                  </div>
                  <div className="font-medium">
                    ✅ Bạn đã phê duyệt KPI của Trần Văn B
                  </div>
                </div>
              ),
            },
            {
              color: 'blue',
              children: (
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-gray-500 text-sm">09:15 - Hôm nay</span>
                  </div>
                  <div className="font-medium">
                    📝 Lê Thị C đã gửi KPI mới cần duyệt
                  </div>
                </div>
              ),
            },
            {
              color: 'gray',
              children: (
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-gray-500 text-sm">16:45 - Hôm qua</span>
                  </div>
                  <div className="font-medium">
                    💬 Bạn đã thêm nhận xét cho KPI của Phạm Văn D
                  </div>
                </div>
              ),
            },
          ]}
        />
        <div className="text-center mt-4">
          <Button type="link">Xem tất cả hoạt động →</Button>
        </div>
      </Card>
    </div>
  );
};
