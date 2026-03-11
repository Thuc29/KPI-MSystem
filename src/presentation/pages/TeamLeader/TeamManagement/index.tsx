import { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Tag, 
  Progress, 
  Button, 
  Avatar, 
  Statistic, 
  Row, 
  Col,
  Modal,
  Tabs,
  Badge,
  Space,
  Select,
  Input,
  Descriptions,
  Timeline,
  Empty,
  Form,
  Image,
  Collapse,
  Tooltip as AntTooltip
} from 'antd';
import { 
  Users, 
  Eye, 
  TrendingUp, 
  Award, 
  AlertTriangle,
  Search,
  Filter,
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  Target,
  Calendar,
  BarChart3,
  FilePlus,
  ThumbsUp,
  ThumbsDown,
  ChevronDown,
  File,
  Paperclip
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { kpiApi } from '../../../../infrastructure/api';
import { storage } from '../../../../infrastructure/utils';
import { KPIStatusTag } from '../../../components';
import type { IKPIRecord, IKPITarget } from '../../../../core/models';
import type { ColumnsType } from 'antd/es/table';

const { Option } = Select;
const { Search: AntSearch } = Input;
const { TextArea } = Input;
const { Panel } = Collapse;

interface TeamMember {
  id: string;
  name: string;
  email: string;
  position: string;
  kpiCount: number;
  avgCompletion: number;
  status: 'excellent' | 'good' | 'average' | 'poor';
}

export const TeamManagementPage = () => {
  const navigate = useNavigate();
  const [kpiList, setKpiList] = useState<IKPIRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [kpiDetailModalVisible, setKpiDetailModalVisible] = useState(false);
  const [selectedKPI, setSelectedKPI] = useState<IKPIRecord | null>(null);
  const [approveModalVisible, setApproveModalVisible] = useState(false);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [form] = Form.useForm();
  const userRole = storage.getUserRole() || 'gl';
  const userId = storage.getUserId();

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

  // Mock team members data with more details
  const teamMembers: TeamMember[] = [
    {
      id: '1',
      name: 'Trần Văn Bình',
      email: 'employee1@gmail.com',
      position: 'Nhân viên kinh doanh',
      kpiCount: 3,
      avgCompletion: 75,
      status: 'good',
    },
    {
      id: '5',
      name: 'Lê Thị C',
      email: 'employee2@gmail.com',
      position: 'Marketing Executive',
      kpiCount: 2,
      avgCompletion: 85,
      status: 'excellent',
    },
    {
      id: '6',
      name: 'Phạm Văn D',
      email: 'employee3@gmail.com',
      position: 'Content Creator',
      kpiCount: 2,
      avgCompletion: 65,
      status: 'average',
    },
  ];

  // Get member KPIs
  const getMemberKPIs = (memberId: string): IKPIRecord[] => {
    return kpiList.filter(kpi => kpi.employeeId === memberId);
  };

  // Get member KPI statistics
  const getMemberStats = (memberId: string) => {
    const memberKPIs = getMemberKPIs(memberId);
    const draftCount = memberKPIs.filter(k => k.status === 'draft').length;
    const pendingCount = memberKPIs.filter(k => k.status === 'pending_approval').length;
    const approvedCount = memberKPIs.filter(k => k.status === 'in_progress' || k.status === 'completed').length;
    const rejectedCount = memberKPIs.filter(k => k.status === 'rejected').length;
    
    return { draftCount, pendingCount, approvedCount, rejectedCount, total: memberKPIs.length };
  };

  // Show member detail modal
  const showMemberDetail = (member: TeamMember) => {
    setSelectedMember(member);
    setDetailModalVisible(true);
  };

  // Show KPI detail modal
  const showKPIDetail = (kpi: IKPIRecord) => {
    setSelectedKPI(kpi);
    setKpiDetailModalVisible(true);
  };

  // Handle approve KPI
  const handleApproveKPI = async () => {
    if (!selectedKPI) return;

    try {
      await kpiApi.approve(selectedKPI.id);
      toast.success('Đã phê duyệt KPI');
      setApproveModalVisible(false);
      setKpiDetailModalVisible(false);
      setSelectedKPI(null);
      fetchKPIList();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Không thể phê duyệt KPI');
    }
  };

  // Handle reject KPI
  const handleRejectKPI = async (values: { reason: string }) => {
    if (!selectedKPI) return;

    try {
      await kpiApi.reject(selectedKPI.id, values.reason);
      toast.success('Đã từ chối KPI');
      setRejectModalVisible(false);
      setKpiDetailModalVisible(false);
      setSelectedKPI(null);
      form.resetFields();
      fetchKPIList();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Không thể từ chối KPI');
    }
  };

  // Filter team members
  const filteredMembers = teamMembers.filter(member => {
    const matchSearch = member.name.toLowerCase().includes(searchText.toLowerCase()) ||
    member.email.toLowerCase().includes(searchText.toLowerCase()) ||
    member.position.toLowerCase().includes(searchText.toLowerCase());
    const matchStatus = statusFilter === 'all' || member.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const getStatusColor = (status: string) => {
    const colors = {
      excellent: 'green',
      good: 'blue',
      average: 'orange',
      poor: 'red',
    };
    return colors[status as keyof typeof colors] || 'default';
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      excellent: 'Xuất sắc',
      good: 'Tốt',
      average: 'Trung bình',
      poor: 'Cần cải thiện',
    };
    return labels[status as keyof typeof labels] || status;
  };

  const columns: ColumnsType<TeamMember> = [
    {
      title: 'Nhân viên',
      key: 'member',
      fixed: 'left',
      width: 250,
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <Avatar size={48} className="bg-gradient-to-br from-blue-500 to-purple-500 flex-shrink-0">
            <span className="text-lg font-bold">{record.name.charAt(0)}</span>
          </Avatar>
          <div className="min-w-0">
            <div className="font-semibold text-gray-900 truncate">{record.name}</div>
            <div className="text-xs text-gray-500 truncate">{record.position}</div>
            <div className="text-xs text-gray-400 truncate">{record.email}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Số KPI',
      key: 'kpiCount',
      align: 'center',
      width: 120,
      render: (_, record) => {
        const stats = getMemberStats(record.id);
        
        return (
          <div className="flex flex-col items-center gap-1">
            <Badge count={stats.total} showZero color="#4C9C2E">
              <FileText size={24} className="text-gray-400" />
            </Badge>
            <div className="text-xs text-gray-500">
              {stats.pendingCount > 0 && (
                <span className="text-orange-500">{stats.pendingCount} chờ</span>
              )}
            </div>
          </div>
        );
      },
      sorter: (a, b) => getMemberStats(a.id).total - getMemberStats(b.id).total,
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
            strokeColor={{
              '0%': record.avgCompletion >= 80 ? '#52c41a' :
                    record.avgCompletion >= 60 ? '#1890ff' :
                    record.avgCompletion >= 40 ? '#faad14' : '#ff4d4f',
              '100%': record.avgCompletion >= 80 ? '#73d13d' :
                      record.avgCompletion >= 60 ? '#40a9ff' :
                      record.avgCompletion >= 40 ? '#ffc53d' : '#ff7875',
            }}
            size="small"
          />
        </div>
      ),
      sorter: (a, b) => a.avgCompletion - b.avgCompletion,
    },
    {
      title: 'Đánh giá',
      dataIndex: 'status',
      key: 'status',
      width: 140,
      align: 'center',
      render: (status) => {
        const config = {
          excellent: { color: 'success', icon: <Award size={14} />, label: 'Xuất sắc' },
          good: { color: 'processing', icon: <TrendingUp size={14} />, label: 'Tốt' },
          average: { color: 'warning', icon: <Clock size={14} />, label: 'Trung bình' },
          poor: { color: 'error', icon: <AlertTriangle size={14} />, label: 'Cần cải thiện' },
        };
        const { color, icon, label } = config[status as keyof typeof config];
        return (
          <Tag color={color} icon={icon} className="px-3 py-1">
            {label}
          </Tag>
        );
      },
      filters: [
        { text: 'Xuất sắc', value: 'excellent' },
        { text: 'Tốt', value: 'good' },
        { text: 'Trung bình', value: 'average' },
        { text: 'Cần cải thiện', value: 'poor' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Hành động',
      key: 'action',
      align: 'center',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<Eye size={14} />}
            onClick={() => showMemberDetail(record)}
            className="bg-primary"
          >
            Chi tiết
          </Button>
        </Space>
      ),
    },
  ];

  const excellentCount = teamMembers.filter(m => m.status === 'excellent').length;
  const avgCount = teamMembers.filter(m => m.status === 'average').length;
  const poorCount = teamMembers.filter(m => m.status === 'poor').length;
  const totalAvgCompletion = Math.round(
    teamMembers.reduce((sum, m) => sum + m.avgCompletion, 0) / teamMembers.length
  );

  // Team KPI statistics
  const totalTeamKPIs = kpiList.length;
  const pendingApprovalKPIs = kpiList.filter(k => k.status === 'pending_approval');
  const approvedKPIs = kpiList.filter(k => k.status === 'in_progress' || k.status === 'completed');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <Users size={32} className="text-primary" />
            Quản lý Team
          </h1>
          <p className="text-gray-500">Theo dõi và quản lý hiệu suất của team</p>
        </div>
        
        <Space>
          <Button
            icon={<FilePlus size={18} />}
            onClick={() => navigate('/kpi/create')}
            size="large"
          >
            Tạo KPI
          </Button>
          <Button
            type="primary"
            icon={<BarChart3 size={18} />}
            onClick={() => navigate('/team-reports')}
            className="bg-primary"
            size="large"
          >
            Báo cáo Team
          </Button>
        </Space>
      </div>

      {/* Statistics */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-md border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
            <Statistic
              title={<span className="text-gray-600 font-medium">Tổng nhân viên</span>}
              value={teamMembers.length}
              prefix={<Users size={28} className="text-blue-500" />}
              valueStyle={{ color: '#1890ff', fontSize: '32px', fontWeight: 'bold' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-md border-l-4 border-l-green-500 hover:shadow-lg transition-shadow">
            <Statistic
              title={<span className="text-gray-600 font-medium">Xuất sắc</span>}
              value={excellentCount}
              prefix={<Award size={28} className="text-green-500" />}
              valueStyle={{ color: '#52c41a', fontSize: '32px', fontWeight: 'bold' }}
              suffix={<span className="text-sm text-gray-500">/ {teamMembers.length}</span>}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-md border-l-4 border-l-purple-500 hover:shadow-lg transition-shadow">
            <Statistic
              title={<span className="text-gray-600 font-medium">Hiệu suất TB</span>}
              value={totalAvgCompletion}
              prefix={<Target size={28} className="text-purple-500" />}
              suffix="%"
              valueStyle={{ color: '#722ed1', fontSize: '32px', fontWeight: 'bold' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-md border-l-4 border-l-orange-500 hover:shadow-lg transition-shadow">
            <Statistic
              title={<span className="text-gray-600 font-medium">Tổng KPI</span>}
              value={totalTeamKPIs}
              prefix={<FileText size={28} className="text-orange-500" />}
              valueStyle={{ color: '#fa8c16', fontSize: '32px', fontWeight: 'bold' }}
              suffix={pendingApprovalKPIs.length > 0 && (
                <Badge count={pendingApprovalKPIs.length} className="ml-2" />
              )}
            />
          </Card>
        </Col>
      </Row>

      {/* Team Members Table */}
      <Card 
        title={
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users size={20} className="text-primary" />
              <span className="font-semibold">Danh sách nhân viên</span>
              <Badge count={filteredMembers.length} showZero color="#4C9C2E" />
            </div>
          </div>
        }
        extra={
          <Space size="middle">
            <AntSearch
              placeholder="Tìm kiếm nhân viên..."
              allowClear
              style={{ width: 250 }}
              prefix={<Search size={16} />}
              onChange={(e) => setSearchText(e.target.value)}
            />
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: 160 }}
              suffixIcon={<Filter size={16} />}
            >
              <Option value="all">Tất cả trạng thái</Option>
              <Option value="excellent">Xuất sắc</Option>
              <Option value="good">Tốt</Option>
              <Option value="average">Trung bình</Option>
              <Option value="poor">Cần cải thiện</Option>
            </Select>
          </Space>
        }
        className="shadow-md"
      >
        <Table
          columns={columns}
          dataSource={filteredMembers}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} nhân viên`,
          }}
          scroll={{ x: 1200 }}
          bordered
          className="custom-table"
        />
      </Card>

      {/* Member Detail Modal */}
      <Modal
        title={
          <div className="flex items-center gap-3">
            <Avatar size={48} className="bg-gradient-to-br from-blue-500 to-purple-500">
              <span className="text-xl font-bold">{selectedMember?.name.charAt(0)}</span>
            </Avatar>
            <div>
              <div className="text-lg font-semibold">{selectedMember?.name}</div>
              <div className="text-sm text-gray-500 font-normal">{selectedMember?.position}</div>
            </div>
          </div>
        }
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={
          <Space>
            <Button onClick={() => setDetailModalVisible(false)}>Đóng</Button>
            <Button
              type="primary"
              icon={<Eye size={16} />}
              onClick={() => {
                if (selectedMember) {
                  navigate(`/team/${selectedMember.id}`);
                }
              }}
              className="bg-primary"
            >
              Xem chi tiết đầy đủ
            </Button>
          </Space>
        }
        width={900}
      >
        {selectedMember && (
          <div className="space-y-4 mt-4">
            {/* Basic Info */}
            <Card size="small" className="bg-gray-50">
              <Descriptions column={2} size="small">
                <Descriptions.Item label="Email">
                  <span className="font-medium">{selectedMember.email}</span>
                </Descriptions.Item>
                <Descriptions.Item label="Vị trí">
                  <span className="font-medium">{selectedMember.position}</span>
                </Descriptions.Item>
                <Descriptions.Item label="Số KPI">
                  <Badge count={getMemberStats(selectedMember.id).total} showZero color="#4C9C2E" />
                </Descriptions.Item>
                <Descriptions.Item label="Hiệu suất">
                  <Progress 
                    percent={selectedMember.avgCompletion} 
                    size="small"
                    strokeColor={{
                      '0%': selectedMember.avgCompletion >= 80 ? '#52c41a' : '#1890ff',
                      '100%': selectedMember.avgCompletion >= 80 ? '#73d13d' : '#40a9ff',
                    }}
                  />
                </Descriptions.Item>
                <Descriptions.Item label="Đánh giá" span={2}>
                  <Tag color={getStatusColor(selectedMember.status)} className="px-3 py-1">
                    {getStatusLabel(selectedMember.status)}
                  </Tag>
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* KPI Statistics */}
            <Card size="small" title="Thống kê KPI">
              <div className="grid grid-cols-4 gap-3">
                <div className="bg-gray-50 p-3 rounded-lg text-center">
                  <div className="text-xl font-bold text-gray-700">
                    {getMemberStats(selectedMember.id).total}
                  </div>
                  <div className="text-xs text-gray-600">Tổng KPI</div>
                </div>
                <div className="bg-orange-50 p-3 rounded-lg text-center">
                  <div className="text-xl font-bold text-orange-600">
                    {getMemberStats(selectedMember.id).pendingCount}
                  </div>
                  <div className="text-xs text-gray-600">Chờ duyệt</div>
                </div>
                <div className="bg-green-50 p-3 rounded-lg text-center">
                  <div className="text-xl font-bold text-green-600">
                    {getMemberStats(selectedMember.id).approvedCount}
                  </div>
                  <div className="text-xs text-gray-600">Đã duyệt</div>
                </div>
                <div className="bg-red-50 p-3 rounded-lg text-center">
                  <div className="text-xl font-bold text-red-600">
                    {getMemberStats(selectedMember.id).rejectedCount}
                  </div>
                  <div className="text-xs text-gray-600">Từ chối</div>
                </div>
              </div>
            </Card>

            {/* KPI List */}
            <Tabs
              defaultActiveKey="kpis"
              items={[
                {
                  key: 'kpis',
                  label: (
                    <span className="flex items-center gap-2">
                      <FileText size={16} />
                      Danh sách KPI
                      <Badge count={getMemberKPIs(selectedMember.id).length} showZero />
                    </span>
                  ),
                  children: (
                    <div className="space-y-3">
                      {getMemberKPIs(selectedMember.id).length > 0 ? (
                        getMemberKPIs(selectedMember.id).map((kpi) => (
                          <Card 
                            key={kpi.id} 
                            size="small" 
                            className="hover:shadow-md transition-shadow"
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="font-semibold text-primary">KPI #{kpi.id}</span>
                                  <KPIStatusTag status={kpi.status} />
                                </div>
                                <div className="text-sm text-gray-600 mb-2">
                                  <Calendar size={14} className="inline mr-1" />
                                  Năm {kpi.year} {kpi.quarter && `- Quý ${kpi.quarter}`}
                                </div>
                                <div className="flex gap-2">
                                  <Tag color="blue">{kpi.targets.length} mục tiêu</Tag>
                                  <Tag color="green">
                                    {kpi.targets.reduce((sum, t) => sum + t.weight, 0)}% trọng số
                                  </Tag>
                                </div>
                              </div>
                              <Space>
                                <Button
                                  type="link"
                                  icon={<Eye size={16} />}
                                  onClick={() => showKPIDetail(kpi)}
                                >
                                  Xem chi tiết
                                </Button>
                                {kpi.status === 'pending_approval' && userRole === 'gl' && (
                                  <>
                                    <Button
                                      type="primary"
                                      size="small"
                                      icon={<ThumbsUp size={14} />}
                                      onClick={() => {
                                        setSelectedKPI(kpi);
                                        setApproveModalVisible(true);
                                      }}
                                      className="bg-primary"
                                    >
                                      Duyệt
                                    </Button>
                                    <Button
                                      danger
                                      size="small"
                                      icon={<ThumbsDown size={14} />}
                                      onClick={() => {
                                        setSelectedKPI(kpi);
                                        setRejectModalVisible(true);
                                      }}
                                    >
                                      Từ chối
                                    </Button>
                                  </>
                                )}
                              </Space>
                            </div>
                          </Card>
                        ))
                      ) : (
                        <Empty description="Chưa có KPI nào" />
                      )}
                    </div>
                  ),
                },
                {
                  key: 'timeline',
                  label: (
                    <span className="flex items-center gap-2">
                      <Clock size={16} />
                      Lịch sử hoạt động
                    </span>
                  ),
                  children: (
                    <Timeline
                      items={[
                        {
                          color: 'green',
                          dot: <CheckCircle size={16} />,
                          children: (
                            <div>
                              <div className="font-medium">KPI Q4/2024 được phê duyệt</div>
                              <div className="text-xs text-gray-500">2 ngày trước</div>
                            </div>
                          ),
                        },
                        {
                          color: 'blue',
                          dot: <FileText size={16} />,
                          children: (
                            <div>
                              <div className="font-medium">Gửi KPI Q4/2024</div>
                              <div className="text-xs text-gray-500">5 ngày trước</div>
                            </div>
                          ),
                        },
                        {
                          color: 'red',
                          dot: <XCircle size={16} />,
                          children: (
                            <div>
                              <div className="font-medium">KPI Q3/2024 bị từ chối</div>
                              <div className="text-xs text-gray-500">1 tuần trước</div>
                            </div>
                          ),
                        },
                      ]}
                    />
                  ),
                },
              ]}
            />
          </div>
        )}
      </Modal>

      {/* KPI Detail Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <FileText size={20} className="text-primary" />
            <span>Chi tiết KPI - {selectedKPI?.id}</span>
          </div>
        }
        open={kpiDetailModalVisible}
        onCancel={() => {
          setKpiDetailModalVisible(false);
          setSelectedKPI(null);
        }}
        footer={
          <Space>
            <Button onClick={() => setKpiDetailModalVisible(false)}>Đóng</Button>
            {selectedKPI?.status === 'pending_approval' && userRole === 'gl' && (
              <>
                <Button
                  type="primary"
                  icon={<CheckCircle size={16} />}
                  onClick={() => {
                    setKpiDetailModalVisible(false);
                    setApproveModalVisible(true);
                  }}
                  className="bg-primary"
                >
                  Phê duyệt
                </Button>
                <Button
                  danger
                  icon={<XCircle size={16} />}
                  onClick={() => {
                    setKpiDetailModalVisible(false);
                    setRejectModalVisible(true);
                  }}
                >
                  Từ chối
                </Button>
              </>
            )}
          </Space>
        }
        width={1000}
      >
        {selectedKPI && (
          <div className="space-y-4">
            {/* Basic Info */}
            <Card size="small" className="bg-gray-50">
              <Descriptions column={2} size="small">
                <Descriptions.Item label="Team Leader">
                  <span className="font-semibold">{selectedKPI.employeeName}</span>
                </Descriptions.Item>
                <Descriptions.Item label="Phòng ban">
                  <span className="font-semibold">{selectedKPI.department}</span>
                </Descriptions.Item>
                <Descriptions.Item label="Năm">
                  <span className="font-semibold">{selectedKPI.year}</span>
                </Descriptions.Item>
                <Descriptions.Item label="Quý">
                  {selectedKPI.quarter ? (
                    <Tag color="blue">Q{selectedKPI.quarter}</Tag>
                  ) : (
                    <span className="text-gray-400">Cả năm</span>
                  )}
                </Descriptions.Item>
                <Descriptions.Item label="Trạng thái">
                  <KPIStatusTag status={selectedKPI.status} />
                </Descriptions.Item>
                <Descriptions.Item label="Tổng trọng số">
                  <Tag 
                    color={selectedKPI.targets.reduce((sum, t) => sum + t.weight, 0) === 100 ? 'success' : 'error'} 
                    className="text-lg font-bold"
                  >
                    {selectedKPI.targets.reduce((sum, t) => sum + t.weight, 0)}%
                  </Tag>
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* Targets List */}
            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-lg">
                  Danh sách mục tiêu ({selectedKPI.targets.length})
                </h4>
                <Tag color="blue" icon={<FileText size={14} />}>
                  {selectedKPI.targets.length} mục tiêu
                </Tag>
              </div>

              {selectedKPI.groups && selectedKPI.groups.length > 0 ? (
                <Collapse
                  expandIcon={({ isActive }) => (
                    <ChevronDown 
                      size={18} 
                      className={`transition-transform ${isActive ? 'rotate-180' : ''}`} 
                    />
                  )}
                  defaultActiveKey={selectedKPI.groups.map(g => g.id)}
                  className="mb-4"
                >
                  {selectedKPI.groups.map((group, groupIndex) => {
                    const groupWeight = group.targets.reduce((sum, t) => sum + t.weight, 0);
                    
                    return (
                      <Panel
                        key={group.id}
                        header={
                          <div className="flex items-center justify-between w-full pr-4">
                            <div className="flex items-center gap-3">
                              <span className="font-semibold text-base text-purple-700">
                                #{groupIndex + 1} {group.name}
                              </span>
                              <Tag color="purple">{group.targets.length} mục tiêu</Tag>
                              <Tag color="green">{groupWeight}%</Tag>
                            </div>
                          </div>
                        }
                        className="border-l-4 border-l-purple-500"
                      >
                        {group.description && (
                          <div className="mb-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                            <p className="text-sm text-gray-700 italic">{group.description}</p>
                          </div>
                        )}
                        
                        {group.targets.map((target, index) => (
                          <TargetDetailCard 
                            key={target.id} 
                            target={target} 
                            index={index}
                          />
                        ))}
                      </Panel>
                    );
                  })}
                </Collapse>
              ) : (
                selectedKPI.targets.map((target, index) => (
                  <TargetDetailCard 
                    key={target.id} 
                    target={target} 
                    index={index}
                  />
                ))
              )}
            </div>

            {/* Summary */}
            <div className="border-t pt-4 bg-green-50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Tổng trọng số</p>
                  <p className="text-3xl font-bold text-green-600">
                    {selectedKPI.targets.reduce((sum, t) => sum + t.weight, 0)}%
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600 mb-1">Tổng số mục tiêu</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {selectedKPI.targets.length}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600 mb-1">File đính kèm</p>
                  <p className="text-3xl font-bold text-purple-600">
                    {selectedKPI.targets.reduce((sum, t) => sum + (t.attachments?.length || 0), 0)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Approve Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <CheckCircle size={20} className="text-green-500" />
            <span>Xác nhận phê duyệt</span>
          </div>
        }
        open={approveModalVisible}
        onOk={handleApproveKPI}
        onCancel={() => setApproveModalVisible(false)}
        okText="Phê duyệt"
        cancelText="Hủy"
        okButtonProps={{ className: 'bg-primary' }}
      >
        {selectedKPI && (
          <div className="space-y-3">
            <p className="text-gray-700">Bạn có chắc chắn muốn phê duyệt KPI này?</p>
            <div className="bg-blue-50 p-3 rounded-lg">
              <p><strong>Team Leader:</strong> {selectedKPI.employeeName}</p>
              <p><strong>Năm:</strong> {selectedKPI.year}</p>
              <p><strong>Số mục tiêu:</strong> {selectedKPI.targets.length}</p>
              <p><strong>Tổng trọng số:</strong> {selectedKPI.targets.reduce((sum, t) => sum + t.weight, 0)}%</p>
            </div>
          </div>
        )}
      </Modal>

      {/* Reject Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <XCircle size={20} className="text-red-500" />
            <span>Từ chối KPI</span>
          </div>
        }
        open={rejectModalVisible}
        onOk={() => form.submit()}
        onCancel={() => {
          setRejectModalVisible(false);
          form.resetFields();
        }}
        okText="Từ chối"
        cancelText="Hủy"
        okButtonProps={{ danger: true }}
      >
        {selectedKPI && (
          <Form form={form} layout="vertical" onFinish={handleRejectKPI}>
            <div className="mb-4 bg-gray-50 p-3 rounded-lg">
              <p><strong>Team Leader:</strong> {selectedKPI.employeeName}</p>
              <p><strong>Năm:</strong> {selectedKPI.year}</p>
            </div>

            <Form.Item
              name="reason"
              label="Lý do từ chối"
              rules={[
                { required: true, message: 'Vui lòng nhập lý do từ chối' },
                { min: 10, message: 'Lý do phải có ít nhất 10 ký tự' },
              ]}
            >
              <TextArea
                rows={4}
                placeholder="Nhập lý do từ chối chi tiết để Team Leader có thể chỉnh sửa..."
                maxLength={500}
                showCount
              />
            </Form.Item>
          </Form>
        )}
      </Modal>
    </div>
  );
};

// Target Detail Card Component
interface TargetDetailCardProps {
  target: IKPITarget;
  index: number;
}

const TargetDetailCard = ({ target, index }: TargetDetailCardProps) => {
  return (
    <Card type="inner" className="mb-3 shadow-sm hover:shadow-md transition-shadow">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                {index + 1}
              </span>
              <h5 className="font-semibold text-base">{target.title}</h5>
              {target.category && (
                <Tag color="blue">{target.category}</Tag>
              )}
            </div>
          </div>
          <Tag color="green" className="text-lg font-bold px-3 py-1">
            {target.weight}%
          </Tag>
        </div>

        {/* Description */}
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{target.description}</p>
        </div>

        {/* Target & Unit */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-xs text-gray-600 mb-1">Chỉ tiêu</p>
            <p className="text-lg font-bold text-blue-600">
              {target.target} <span className="text-sm">{target.unit}</span>
            </p>
          </div>
          
          {target.measurementMethod && (
            <div className="bg-purple-50 p-3 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">Phương pháp đo lường</p>
              <p className="text-sm font-medium text-purple-700">{target.measurementMethod}</p>
            </div>
          )}
        </div>

        {/* Evaluation Criteria */}
        {target.evaluationCriteria && (
          <div className="bg-green-50 p-3 rounded-lg">
            <p className="text-xs text-gray-600 mb-1">Tiêu chí đánh giá</p>
            <p className="text-sm font-medium text-green-700">{target.evaluationCriteria}</p>
          </div>
        )}

        {/* Attachments */}
        {target.attachments && target.attachments.length > 0 && (
          <div className="border-t pt-3">
            <div className="flex items-center gap-2 mb-2">
              <Paperclip size={16} className="text-gray-500" />
              <span className="text-sm font-semibold text-gray-700">
                File đính kèm ({target.attachments.length})
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {target.attachments.map((file) => {
                const isImage = file.fileName.match(/\.(jpg|jpeg|png|gif|webp)$/i);
                return (
                  <div key={file.id}>
                    {isImage ? (
                      <div className="relative group">
                        <Image
                          src={file.fileUrl}
                          alt={file.fileName}
                          width={80}
                          height={80}
                          className="rounded border object-cover cursor-pointer"
                          preview={{
                            mask: <Eye size={16} />,
                          }}
                        />
                        <AntTooltip title={file.fileName}>
                          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white text-xs p-1 truncate rounded-b">
                            {file.fileName}
                          </div>
                        </AntTooltip>
                      </div>
                    ) : (
                      <a
                        href={file.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded border hover:bg-gray-200 hover:border-primary transition-colors"
                      >
                        <File size={16} className="text-blue-500" />
                        <div className="flex flex-col">
                          <span className="text-sm font-medium max-w-[150px] truncate">
                            {file.fileName}
                          </span>
                          <span className="text-xs text-gray-500">
                            {(file.fileSize / 1024).toFixed(1)} KB
                          </span>
                        </div>
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
