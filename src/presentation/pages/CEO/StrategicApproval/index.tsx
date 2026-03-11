import { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Modal, 
  Tag, 
  Space, 
  Tabs, 
  Input,
  Badge,
  Tooltip,
  Divider,
  Empty
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { 
  CheckCircle, 
  XCircle, 
  Eye, 
  Clock, 
  Target, 
  TrendingUp,
  Users,
  DollarSign,
  Calendar,
  Building2,
  TagIcon
} from 'lucide-react';
import { toast } from 'react-toastify';
import type { IStrategicPlan } from '../../../../core/models';

const { TextArea } = Input;

export const StrategicApprovalPage = () => {
  const [strategies, setStrategies] = useState<IStrategicPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStrategy, setSelectedStrategy] = useState<IStrategicPlan | null>(null);
  const [reason, setReason] = useState('');

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
          title: 'Chiến lược Tăng trưởng Q4/2024',
          description: 'Kế hoạch tăng trưởng doanh thu và mở rộng thị trường trong quý 4',
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
                  title: 'Tăng doanh số bán hàng',
                  description: 'Tăng 30% doanh số so với Q3',
                  weight: 50,
                  target: '500',
                  unit: 'triệu VNĐ',
                  category: 'revenue',
                  measurementMethod: 'Tổng doanh thu từ hệ thống CRM',
                  evaluationCriteria: 'Đạt >= 500 triệu VNĐ',
                  expectedOutcome: 'Tăng 30% so với Q3',
                },
                {
                  id: 'obj-2',
                  title: 'Mở rộng khách hàng mới',
                  description: 'Tăng 50 khách hàng doanh nghiệp mới',
                  weight: 30,
                  target: '50',
                  unit: 'khách hàng',
                  category: 'customer',
                  expectedOutcome: 'Tăng 50 khách hàng B2B',
                },
              ],
              budget: 100000000,
              timeline: {
                startDate: '2024-10-01',
                endDate: '2024-12-31',
              },
            },
            {
              id: 'tp-2',
              teamName: 'Marketing Team',
              teamLeaderId: 'tl-2',
              teamLeaderName: 'Lê Thị C',
              objectives: [
                {
                  id: 'obj-3',
                  title: 'Tăng brand awareness',
                  description: 'Tăng 40% lượt tương tác trên social media',
                  weight: 40,
                  target: '100000',
                  unit: 'lượt tương tác',
                  category: 'marketing',
                },
              ],
              budget: 80000000,
            },
          ],
          totalBudget: 180000000,
          expectedImpact: 'Tăng 30% doanh thu, mở rộng 50 khách hàng mới',
          createdAt: '2024-10-01',
          updatedAt: '2024-10-05',
          submittedAt: '2024-10-05',
        },
        {
          id: 'STR-2024-002',
          title: 'Digital Transformation 2024',
          description: 'Chuyển đổi số toàn diện cho bộ phận IT',
          departmentId: 'dept-2',
          departmentName: 'IT',
          groupLeaderId: 'gl-2',
          groupLeaderName: 'Phạm Văn D',
          year: 2024,
          period: 'yearly',
          status: 'pending_ceo',
          teamPlans: [
            {
              id: 'tp-3',
              teamName: 'Infrastructure Team',
              teamLeaderId: 'tl-3',
              teamLeaderName: 'Hoàng Văn E',
              objectives: [
                {
                  id: 'obj-4',
                  title: 'Nâng cấp hệ thống cloud',
                  description: 'Migration 80% services lên cloud',
                  weight: 60,
                  target: '80',
                  unit: '%',
                  category: 'infrastructure',
                },
              ],
              budget: 500000000,
            },
          ],
          totalBudget: 500000000,
          expectedImpact: 'Giảm 40% chi phí vận hành, tăng 50% hiệu suất',
          createdAt: '2024-09-15',
          updatedAt: '2024-09-20',
          submittedAt: '2024-09-20',
        },
      ];
      setStrategies(mockData);
    } catch (error) {
      toast.error('Không thể tải danh sách chiến lược');
    } finally {
      setLoading(false);
    }
  };

  const handleView = (record: IStrategicPlan) => {
    setSelectedStrategy(record);
    setIsModalOpen(true);
    setReason('');
  };

  const handleAction = async (type: 'approve' | 'reject') => {
    if (!selectedStrategy) return;

    try {
      // API call here
      setStrategies(prev => prev.map(s => 
        s.id === selectedStrategy.id 
          ? { 
              ...s, 
              status: type === 'approve' ? 'approved' : 'rejected',
              approvedAt: type === 'approve' ? new Date().toISOString() : undefined,
              approvedBy: type === 'approve' ? 'CEO' : undefined,
              rejectionReason: type === 'reject' ? reason : undefined,
            }
          : s
      ));

      toast.success(type === 'approve' ? 'Đã phê duyệt chiến lược' : 'Đã từ chối chiến lược');
      setIsModalOpen(false);
      setReason('');
    } catch (error) {
      toast.error('Có lỗi xảy ra');
    }
  };

  const getPriorityIcon = (submittedAt?: string) => {
    if (!submittedAt) return <CheckCircle size={20} className="text-green-500" />;
    const days = Math.floor((Date.now() - new Date(submittedAt).getTime()) / (1000 * 60 * 60 * 24));
    if (days >= 3) return <XCircle size={20} className="text-red-500" />;
    if (days >= 1) return <Clock size={20} className="text-yellow-500" />;
    return <CheckCircle size={20} className="text-green-500" />;
  };

  const columns: ColumnsType<IStrategicPlan> = [
    {
      title: 'Ưu tiên',
      key: 'priority',
      width: 80,
      align: 'center',
      render: (_, record) => (
        <Tooltip title={
          record.submittedAt 
            ? `Gửi ${Math.floor((Date.now() - new Date(record.submittedAt).getTime()) / (1000 * 60 * 60 * 24))} ngày trước`
            : 'Mới gửi'
        }>
          <span className="text-2xl">{getPriorityIcon(record.submittedAt)}</span>
        </Tooltip>
      ),
    },
    {
      title: 'Mã',
      dataIndex: 'id',
      key: 'id',
      width: 120,
      render: (text) => <span className="font-mono text-xs font-semibold text-primary">{text}</span>,
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
      width: 300,
    },
    {
      title: 'Bộ phận',
      dataIndex: 'departmentName',
      key: 'departmentName',
      width: 140,
      render: (text) => <Tag color="purple">{text}</Tag>,
    },
    {
      title: 'Group Leader',
      dataIndex: 'groupLeaderName',
      key: 'groupLeaderName',
      width: 130,
    },
    {
      title: 'Kỳ',
      key: 'period',
      width: 90,
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
      width: 90,
      align: 'center',
      render: (_, record) => (
        <Badge count={record.teamPlans.length} showZero color="#1890ff" />
      ),
    },
    {
      title: 'Ngày gửi',
      dataIndex: 'submittedAt',
      key: 'submittedAt',
      width: 100,
      render: (date) => date ? new Date(date).toLocaleDateString('vi-VN') : '-',
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 120,
      align: 'center',
      fixed: 'right',
      render: (_, record) => (
        <Button 
          type="primary"
          size="small"
          icon={<Eye size={14} />}
          onClick={() => handleView(record)}
        >
          Xem
        </Button>
      ),
    },
  ];

  const pendingStrategies = strategies.filter(s => s.status === 'pending_ceo');
  const approvedStrategies = strategies.filter(s => s.status === 'approved');
  const rejectedStrategies = strategies.filter(s => s.status === 'rejected');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-1 flex items-center gap-3">
          <Target size={30} className="text-primary" />
          Phê duyệt Chiến lược
        </h1>
        <p className="text-gray-500">Phê duyệt các kế hoạch chiến lược từ Group Leader</p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="shadow-md border-l-4 border-l-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Chờ phê duyệt</p>
              <p className="text-3xl font-bold text-orange-600">{pendingStrategies.length}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <Clock size={24} className="text-orange-600" />
            </div>
          </div>
        </Card>

        <Card className="shadow-md border-l-4 border-l-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Đã phê duyệt</p>
              <p className="text-3xl font-bold text-green-600">{approvedStrategies.length}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle size={24} className="text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="shadow-md border-l-4 border-l-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Đã từ chối</p>
              <p className="text-3xl font-bold text-red-600">{rejectedStrategies.length}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <XCircle size={24} className="text-red-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <Card className="shadow-md">
        <Tabs
          defaultActiveKey="pending"
          items={[
            {
              key: 'pending',
              label: `Chờ phê duyệt (${pendingStrategies.length})`,
              children: (
                <Table
                  columns={columns}
                  dataSource={pendingStrategies}
                  rowKey="id"
                  loading={loading}
                  pagination={{ pageSize: 10 }}
                  scroll={{ x: 1200 }}
                  bordered
                />
              ),
            },
            {
              key: 'approved',
              label: `Đã phê duyệt (${approvedStrategies.length})`,
              children: (
                <Table
                  columns={columns}
                  dataSource={approvedStrategies}
                  rowKey="id"
                  loading={loading}
                  pagination={{ pageSize: 10 }}
                  scroll={{ x: 1200 }}
                  bordered
                />
              ),
            },
            {
              key: 'rejected',
              label: `Đã từ chối (${rejectedStrategies.length})`,
              children: (
                <Table
                  columns={columns}
                  dataSource={rejectedStrategies}
                  rowKey="id"
                  loading={loading}
                  pagination={{ pageSize: 10 }}
                  scroll={{ x: 1200 }}
                  bordered
                />
              ),
            },
          ]}
        />
      </Card>

      {/* Detail Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <Target size={24} className="text-primary" />
            <span>Chi tiết Chiến lược</span>
          </div>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={900}
      >
        {selectedStrategy && (
          <div className="space-y-3">
            {/* Header Info */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 py-3 px-4 border border-blue-200 rounded-2xl space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-xl font-bold">{selectedStrategy.title}</h3>
                  <p className="text-gray-700">{selectedStrategy.description}</p>
                </div>
                <Tag className='rounded-lg' color={selectedStrategy.status === 'pending_ceo' ? 'orange' : selectedStrategy.status === 'approved' ? 'green' : 'red'}>
                  {selectedStrategy.status === 'pending_ceo' ? 'Chờ duyệt' : selectedStrategy.status === 'approved' ? 'Đã duyệt' : 'Từ chối'}
                </Tag>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <Building2 size={16} className="text-gray-500" />
                  <span className="text-gray-600">Bộ phận:</span>
                  <span className="font-semibold">{selectedStrategy.departmentName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users size={16} className="text-gray-500" />
                  <span className="text-gray-600">Group Leader:</span>
                  <span className="font-semibold">{selectedStrategy.groupLeaderName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-gray-500" />
                  <span className="text-gray-600">Kỳ:</span>
                  <span className="font-semibold">
                    {selectedStrategy.year}{selectedStrategy.quarter ? ` - Q${selectedStrategy.quarter}` : ''}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign size={16} className="text-gray-500" />
                  <span className="text-gray-600">Ngân sách:</span>
                  <span className="font-semibold">
                    {selectedStrategy.totalBudget ? `${(selectedStrategy.totalBudget / 1000000).toFixed(0)}M VNĐ` : '-'}
                  </span>
                </div>
              </div>

              {selectedStrategy.expectedImpact && (
                <div className="bg-white p-3 border-l-4 rounded-xl border-l-blue-500">
                  <div className="flex items-start gap-2">
                    <TrendingUp size={16} className="text-blue-500 mt-1" />
                    <div>
                      <div className="text-xs text-gray-600 mb-1">Tác động dự kiến:</div>
                      <div className="font-medium text-gray-800">{selectedStrategy.expectedImpact}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Divider>Kế hoạch các Team ({selectedStrategy.teamPlans.length})</Divider>

            {/* Team Plans */}
            {selectedStrategy.teamPlans.length > 0 ? (
              <div className="space-y-3">
                {selectedStrategy.teamPlans.map((team, teamIndex) => (
                  <Card 
                    key={team.id} 
                    size="small"
                    className="border-l-4 border-l-blue-500 rounded-2xl"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <Users size={20} className="text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-base">{team.teamName}</h4>
                            <p className="text-sm text-gray-600">Team Leader: {team.teamLeaderName}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {team.budget && (
                            <Tag color="green" className="rounded-lg">
                              {(team.budget / 1000000).toFixed(0)}M VNĐ
                            </Tag>
                          )}
                          <Tag color="blue" className="rounded-lg">
                            {team.objectives.length} mục tiêu
                          </Tag>
                        </div>
                      </div>

                      {team.timeline && (
                        <div className="text-sm text-gray-700 font-semibold flex items-center gap-2">
                          <Calendar size={14} />
                          <span>{team.timeline.startDate} → {team.timeline.endDate}</span>
                        </div>
                      )}

                      {/* Team Objectives */}
                      <div className="space-y-2">
                        <div className="font-medium text-sm text-gray-700">Mục tiêu của team:</div>
                        {team.objectives.map((obj, objIndex) => (
                          <div key={obj.id} className="bg-primary/10 border border-primary/30 p-3 rounded-2xl">
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 bg-primary/20   rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-primary font-semibold text-sm">{objIndex + 1}</span>
                              </div>
                              <div className="flex-1 space-y-1">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <h5 className="font-semibold">{obj.title}</h5>
                                    <p className="text-sm text-gray-600 mt-1">{obj.description}</p>
                                  </div>
                                  <Tag color="blue">Trọng số: {obj.weight}%</Tag>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-1 text-sm">
                                  <div className="bg-white p-2 rounded-lg">
                                    <span className="text-gray-600">Mục tiêu: </span>
                                    <span className="font-semibold">{obj.target} {obj.unit}</span>
                                  </div>
                                  {obj.category && (
                                    <div className="bg-white p-2 rounded-lg">
                                      <span className="text-gray-600">Danh mục: </span>
                                      <TagIcon size="small">{obj.category}</TagIcon>
                                    </div>
                                  )}
                                  {obj.measurementMethod && (
                                    <div className="bg-white p-2 rounded-lg col-span-2">
                                      <span className="text-gray-600">Đo lường: </span>
                                      <span className="text-gray-800">{obj.measurementMethod}</span>
                                    </div>
                                  )}
                                  {obj.expectedOutcome && (
                                    <div className="bg-white p-2 rounded-lg col-span-2">
                                      <span className="text-gray-600">Kết quả mong đợi: </span>
                                      <span className="text-gray-800">{obj.expectedOutcome}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Empty description="Chưa có kế hoạch team nào" />
            )}

            {/* Action Section */}
            {selectedStrategy.status === 'pending_ceo' && (
              <>
                <Divider />
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Nhận xét / Lý do:
                    </label>
                    <TextArea
                      rows={4}
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="Nhập nhận xét hoặc lý do từ chối (nếu có)..."
                    />
                  </div>

                  <div className="flex justify-end gap-3">
                    <Button size="middle" onClick={() => setIsModalOpen(false)}>
                      Đóng
                    </Button>
                    <Button 
                      danger
                      size="middle"
                      icon={<XCircle size={16} />}
                      onClick={() => {
                        if (!reason.trim()) {
                          toast.warning('Vui lòng nhập lý do từ chối');
                          return;
                        }
                        handleAction('reject');
                      }}
                    >
                      Từ chối
                    </Button>
                    <Button 
                      type="primary"
                      size="middle"
                      icon={<CheckCircle size={16} />}
                      onClick={() => handleAction('approve')}
                      className="bg-primary"
                    >
                      Phê duyệt
                    </Button>
                  </div>
                </div>
              </>
            )}

            {selectedStrategy.status !== 'pending_ceo' && (
              <div className="flex justify-end">
                <Button size="middle" onClick={() => setIsModalOpen(false)}>
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
