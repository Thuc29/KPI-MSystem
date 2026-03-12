import { useState, useEffect } from 'react';
import { 
  Card, 
  Button, 
  Tag, 
  Divider,
  Badge,
  Timeline,
  Progress,
  Tabs,
  Empty,
  Modal,
  Input
} from 'antd';
import { 
  ArrowLeft,
  Target,
  Users,
  DollarSign,
  Calendar,
  Building2,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Edit,
  Send,
  FileText,
  AlertTriangle,
  Tags
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import type { IStrategicPlan } from '../../../../core/models';
import { useTranslation } from '../../../../infrastructure/i18n';

const { TextArea } = Input;

export const StrategyDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const [strategy, setStrategy] = useState<IStrategicPlan | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id) {
      fetchStrategyDetail(id);
    }
  }, [id]);

  const fetchStrategyDetail = async (strategyId: string) => {
    setLoading(true);
    try {
      // Mock data - replace with actual API call
      const mockStrategy: IStrategicPlan = {
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
                startDate: '2024-10-01',
                endDate: '2024-12-31',
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
                startDate: '2024-10-01',
                endDate: '2024-12-31',
              },
              {
                id: 'obj-3',
                title: 'Tăng tỷ lệ chốt deal',
                description: 'Cải thiện conversion rate từ 15% lên 25%',
                weight: 20,
                target: '25',
                unit: '%',
                category: 'efficiency',
                expectedOutcome: 'Tăng 10% conversion rate',
              },
            ],
            budget: 100000000,
            resources: ['CRM System', 'Sales Training', 'Marketing Support'],
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
                id: 'obj-4',
                title: 'Tăng brand awareness',
                description: 'Tăng 40% lượt tương tác trên social media',
                weight: 40,
                target: '100000',
                unit: 'lượt tương tác',
                category: 'marketing',
                measurementMethod: 'Tổng engagement trên Facebook, LinkedIn',
                expectedOutcome: 'Tăng 40% engagement',
              },
              {
                id: 'obj-5',
                title: 'Tăng leads chất lượng',
                description: 'Tạo 200 leads qualified mới',
                weight: 60,
                target: '200',
                unit: 'leads',
                category: 'marketing',
                expectedOutcome: '200 MQL mới',
              },
            ],
            budget: 80000000,
            resources: ['Social Media Tools', 'Content Team', 'Ads Budget'],
            timeline: {
              startDate: '2024-10-01',
              endDate: '2024-12-31',
            },
          },
        ],
        overallObjectives: [
          'Tăng 30% doanh thu so với Q3',
          'Mở rộng 50 khách hàng doanh nghiệp mới',
          'Tăng brand awareness 40%',
        ],
        totalBudget: 180000000,
        expectedImpact: 'Tăng 30% doanh thu, mở rộng 50 khách hàng mới, tăng 40% brand awareness',
        createdAt: '2024-10-01',
        updatedAt: '2024-10-05',
        submittedAt: '2024-10-05',
      };
      setStrategy(mockStrategy);
    } catch (error) {
      toast.error('Không thể tải chi tiết chiến lược');
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { color: string; label: string; icon: any }> = {
      draft: { color: 'default', label: 'Nháp', icon: <FileText size={16} /> },
      pending_ceo: { color: 'orange', label: 'Chờ CEO duyệt', icon: <Clock size={16} /> },
      approved: { color: 'green', label: 'Đã duyệt', icon: <CheckCircle size={16} /> },
      rejected: { color: 'red', label: 'Từ chối', icon: <XCircle size={16} /> },
      in_execution: { color: 'blue', label: 'Đang thực hiện', icon: <TrendingUp size={16} /> },
      completed: { color: 'success', label: 'Hoàn thành', icon: <CheckCircle size={16} /> },
    };
    return configs[status] || configs.draft;
  };

  const handleEdit = () => {
    navigate(`/strategy/edit/${id}`);
  };

  const handleSubmit = () => {
    Modal.confirm({
      title: 'Xác nhận gửi chiến lược',
      content: 'Bạn có chắc chắn muốn gửi chiến lược này đến CEO để phê duyệt?',
      okText: 'Gửi',
      cancelText: 'Hủy',
      onOk: () => {
        toast.success('Đã gửi chiến lược đến CEO');
        navigate('/strategy');
      },
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="text-lg text-gray-600">Đang tải...</div>
        </div>
      </div>
    );
  }

  if (!strategy) {
    return (
      <div className="flex items-center justify-center h-96">
        <Empty description="Không tìm thấy chiến lược" />
      </div>
    );
  }

  const statusConfig = getStatusConfig(strategy.status);
  const totalObjectives = strategy.teamPlans.reduce((sum, tp) => sum + tp.objectives.length, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex-1 items-center gap-2">
          <div
            className=' flex items-center gap-1 underline text-blue-600 font-semibold pb-2 cursor-pointer'
            onClick={() => navigate('/strategy')}
          ><ArrowLeft size={14} />
            {t.groupLeader.strategyDetail.backToList}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Target size={30} className="text-primary" />
              {strategy.title}
            </h1>
            <p className="text-gray-500 mt-1">{strategy.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Tag color={statusConfig.color} icon={statusConfig.icon} className="text-base flex items-center rounded-lg gap-2 px-2 py-1">
            {statusConfig.label}
          </Tag>
          {strategy.status === 'draft' && (
            <>
              <Button
                icon={<Edit size={16} />}
                onClick={handleEdit}
                size="middle"
              >
                {t.groupLeader.strategyDetail.edit}
              </Button>
              <Button
                type="primary"
                icon={<Send size={16} />}
                onClick={handleSubmit}
                size="middle"
                className="bg-primary"
              >
                {t.groupLeader.strategyDetail.sendToCEO}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Alert for rejected */}
      {strategy.status === 'rejected' && strategy.rejectionReason && (
        <Card className="shadow-md border-l-4 border-l-red-500 bg-red-50">
          <div className="flex items-start gap-3">
            <AlertTriangle size={24} className="text-red-500 mt-1" />
            <div className="flex-1">
              <h3 className="font-semibold text-red-600 text-lg mb-2">
                {t.groupLeader.strategyDetail.strategyRejected}
              </h3>
              <p className="text-gray-700 mb-3">
                <span className="font-medium">{t.groupLeader.strategyDetail.rejectionReason} </span>
                {strategy.rejectionReason}
              </p>
              <Button 
                danger
                icon={<Edit size={16} />}
                onClick={handleEdit}
              >
                {t.groupLeader.strategyDetail.editAndResend}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="shadow-md border-l-4 border-l-blue-500">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Users size={24} className="text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">{strategy.teamPlans.length}</div>
              <div className="text-sm text-gray-600">{t.groupLeader.strategyDetail.teamsParticipating}</div>
            </div>
          </div>
        </Card>

        <Card className="shadow-md border-l-4 border-l-green-500">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <Target size={24} className="text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{totalObjectives}</div>
              <div className="text-sm text-gray-600">{t.groupLeader.strategyDetail.totalObjectives}</div>
            </div>
          </div>
        </Card>

        <Card className="shadow-md border-l-4 border-l-purple-500">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <DollarSign size={24} className="text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {strategy.totalBudget ? `${(strategy.totalBudget / 1000000).toFixed(0)}M` : '-'}
              </div>
              <div className="text-sm text-gray-600">{t.groupLeader.strategyDetail.budget}</div>
            </div>
          </div>
        </Card>

        <Card className="shadow-md border-l-4 border-l-orange-500">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <Calendar size={24} className="text-orange-600" />
            </div>
            <div>
              <div className="text-lg font-bold text-orange-600">
                {strategy.year} {strategy.quarter ? `Q${strategy.quarter}` : ''}
              </div>
              <div className="text-sm text-gray-600">{t.groupLeader.strategyDetail.executionPeriod}</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-3 gap-6">
        {/* Left Column - 2/3 */}
        <div className="col-span-2 space-y-6">
          {/* Team Plans */}
          <Card 
            title={
              <div className="flex items-center gap-2">
                <Users size={20} className="text-primary" />
                <span className="font-semibold">{t.groupLeader.strategyDetail.teamPlans} ({strategy.teamPlans.length})</span>
              </div>
            }
            className="shadow-md"
          >
            <Tabs
              items={strategy.teamPlans.map((team, index) => ({
                key: team.id,
                label: (
                  <div className="flex font-semibold items-center gap-2">
                    <span>{team.teamName}</span>
                    <Badge count={team.objectives.length} showZero color="#1890ff" />
                  </div>
                ),
                children: (
                  <div className="space-y-2">
                    {/* Team Info */}
                    <div className="bg-primary/10 border border-primary/30 p-4 rounded-2xl">
                        <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div>
                          <span className="text-gray-600">{t.groupLeader.strategyDetail.teamLeader}: </span>
                          <span className="font-semibold">{team.teamLeaderName}</span>
                          </div>
                          {team.budget && (
                          <div>
                            <span className="text-gray-600">{t.groupLeader.strategyDetail.budget}: </span>
                            <span className="font-semibold">{(team.budget / 1000000).toFixed(0)}M VNĐ</span>
                          </div>
                          )}
                        </div>
                        <div className="space-y-2">
                          {team.timeline && (
                          <div>
                            <span className="text-gray-600">{t.groupLeader.strategyDetail.timeline}: </span>
                            <span className="font-semibold">
                            {team.timeline.startDate} → {team.timeline.endDate}
                            </span>
                          </div>
                          )}
                        {team.resources && team.resources.length > 0 && (
                          <div className="col-span-2">
                          <span className="text-gray-600">{t.groupLeader.strategyDetail.resources}: </span>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {team.resources.map((resource, idx) => (
                            <Tag key={idx} color="blue" className='rounded-lg'>{resource}</Tag>
                            ))}
                          </div>
                          </div>
                        )} </div>
                        </div>
                    </div>

                    {/* Objectives */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-lg">{t.groupLeader.strategyDetail.objectives} ({team.objectives.length})</h4>
                      {team.objectives.map((obj, objIndex) => (
                        <Card key={obj.id} size="small" className="border-l-4 border-l-primary">
                          <div className="space-y-2">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-3 flex-1">
                                <div className="w-8 h-8 bg-primary/10 border border-primary/30 rounded-full flex items-center justify-center flex-shrink-0">
                                  <span className="text-primary font-semibold">{objIndex + 1}</span>
                                </div>
                                <div className="flex-1">
                                  <h5 className="font-semibold text-base">{obj.title}</h5>
                                  <p className="text-sm text-gray-600">{obj.description}</p>
                                </div>
                              </div>
                              <Tag color="blue" className='rounded-lg'>
                                {t.groupLeader.strategyDetail.weight}: {obj.weight}%
                              </Tag>
                            </div>

                            <div className="grid grid-cols-2 gap-1 text-sm">
                              <div className="bg-gray-50 p-2 rounded-lg">
                                <span className="text-gray-600">{t.groupLeader.strategyDetail.target}: </span>
                                <span className="font-semibold">{obj.target} {obj.unit}</span>
                              </div>
                              {obj.category && (
                                <div className="bg-gray-50 p-2 rounded-lg">
                                  <span className="text-gray-600">{t.groupLeader.strategyDetail.category}: </span>
                                  <Tags size="small">{obj.category}</Tags>
                                </div>
                              )}
                              {obj.startDate && obj.endDate && (
                                <div className="bg-gray-50 p-2 rounded-lg col-span-2">
                                  <span className="text-gray-600">{t.groupLeader.strategyDetail.timeline}: </span>
                                  <span className="font-medium">{obj.startDate} → {obj.endDate}</span>
                                </div>
                              )}
                              {obj.measurementMethod && (
                                <div className="bg-gray-50 p-2 rounded-lg col-span-2">
                                  <span className="text-gray-600">{t.groupLeader.strategyDetail.measurementMethod}: </span>
                                  <span className="text-gray-800">{obj.measurementMethod}</span>
                                </div>
                              )}
                              {obj.evaluationCriteria && (
                                <div className="bg-gray-50 p-2 rounded-lg col-span-2">
                                  <span className="text-gray-600">{t.groupLeader.strategyDetail.evaluationCriteria}: </span>
                                  <span className="text-gray-800">{obj.evaluationCriteria}</span>
                                </div>
                              )}
                              {obj.expectedOutcome && (
                                <div className="bg-blue-50 p-2 rounded-lg col-span-2 border-l-2 border-l-blue-500">
                                  <span className="text-gray-600">{t.groupLeader.strategyDetail.expectedOutcome}: </span>
                                  <span className="font-medium text-blue-700">{obj.expectedOutcome}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                ),
              }))}
            />
          </Card>
        </div>

        {/* Right Column - 1/3 */}
        <div className="space-y-4">
          {/* Strategy Info */}
          <Card 
            title={
              <div className="flex items-center gap-2">
                <FileText size={18} className="text-primary" />
                <span>{t.groupLeader.strategyDetail.strategyInfo}</span>
              </div>
            }
            className="shadow-md"
          >
            <div className="space-y-3 text-sm">
              <div className='flex items-center gap-2'>
                <div className="text-gray-600">{t.groupLeader.strategyDetail.strategyCode}: </div>
                <div className="font-mono font-semibold text-primary">{strategy.id}</div>
              </div>
              <Divider className="my-3" />
              <div className='flex items-center justify-between'>
                <div>
                <div className="text-gray-600 mb-1">{t.groupLeader.strategyDetail.department}</div>
                <Tag color="purple">{strategy.departmentName}</Tag>
              </div>
              <div>
                <div className="text-gray-600 mb-1">{t.groupLeader.strategyDetail.groupLeader}</div>
                <div className="font-medium">{strategy.groupLeaderName}</div>
              </div>
              </div>
              <Divider className="my-3" />
             <div className='flex items-center justify-around'>
               <div>
                <div className="text-gray-600 mb-1">{t.groupLeader.strategyDetail.createdDate}</div>
                <div className="font-medium">{new Date(strategy.createdAt).toLocaleDateString('vi-VN')}</div>
              </div>
              {strategy.submittedAt && (
                <div>
                  <div className="text-gray-600 mb-1">{t.groupLeader.strategyDetail.submittedDate}</div>
                  <div className="font-medium">{new Date(strategy.submittedAt).toLocaleDateString('vi-VN')}</div>
                </div>
              )}
              {strategy.approvedAt && (
                <div>
                  <div className="text-gray-600 mb-1">{t.groupLeader.strategyDetail.approvedDate}</div>
                  <div className="font-medium">{new Date(strategy.approvedAt).toLocaleDateString('vi-VN')}</div>
                </div>
              )}
            </div>
             </div>
          </Card>

          {/* Overall Objectives */}
          {strategy.overallObjectives && strategy.overallObjectives.length > 0 && (
            <Card 
              title={
                <div className="flex items-center gap-2">
                  <Target size={18} className="text-primary" />
                  <span>{t.groupLeader.strategyDetail.overallObjectives}</span>
                </div>
              }
              className="shadow-md"
            >
              <ul className="space-y-2">
                {strategy.overallObjectives.map((obj, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <CheckCircle size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{obj}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {/* Expected Impact */}
          {strategy.expectedImpact && (
            <Card 
              title={
                <div className="flex items-center gap-2">
                  <TrendingUp size={18} className="text-green-500" />
                  <span>{t.groupLeader.strategyDetail.expectedImpact}</span>
                </div>
              }
              className="shadow-md border-l-4 border-l-green-500"
            >
              <p className="text-sm text-gray-700">{strategy.expectedImpact}</p>
            </Card>
          )}

          {/* Timeline */}
          <Card 
            title={
              <div className="flex items-center gap-2">
                <Clock size={18} className="text-primary" />
                <span>{t.groupLeader.strategyDetail.timeline}</span>
              </div>
            }
            className="shadow-md"
          >
            <Timeline
              items={[
                {
                  color: 'green',
                  children: (
                    <div>
                      <div className="text-xs text-gray-500">{new Date(strategy.createdAt).toLocaleDateString('vi-VN')}</div>
                      <div className="font-medium">{t.groupLeader.strategyDetail.strategyCreated}</div>
                    </div>
                  ),
                },
                ...(strategy.submittedAt ? [{
                  color: 'blue' as const,
                  children: (
                    <div>
                      <div className="text-xs text-gray-500">{new Date(strategy.submittedAt).toLocaleDateString('vi-VN')}</div>
                      <div className="font-medium">{t.groupLeader.strategyDetail.sentToCEO}</div>
                    </div>
                  ),
                }] : []),
                ...(strategy.approvedAt ? [{
                  color: 'green' as const,
                  children: (
                    <div>
                      <div className="text-xs text-gray-500">{new Date(strategy.approvedAt).toLocaleDateString('vi-VN')}</div>
                      <div className="font-medium">{t.groupLeader.strategyDetail.ceoApproved}</div>
                    </div>
                  ),
                }] : []),
                ...(strategy.status === 'rejected' ? [{
                  color: 'red' as const,
                  children: (
                    <div>
                      <div className="text-xs text-gray-500">{new Date(strategy.updatedAt).toLocaleDateString('vi-VN')}</div>
                      <div className="font-medium">{t.groupLeader.strategyDetail.rejected}</div>
                    </div>
                  ),
                }] : []),
              ]}
            />
          </Card>
        </div>
      </div>
    </div>
  );
};
