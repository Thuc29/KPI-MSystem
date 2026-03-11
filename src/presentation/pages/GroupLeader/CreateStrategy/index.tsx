import { useState } from 'react';
import { 
  Card, 
  Form, 
  Input, 
  Button, 
  Select, 
  InputNumber,
  Space,
  Divider,
  Row,
  Col,
  Tag,
  Alert,
  Steps,
  Table,
  Modal,
  Upload
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { 
  Target,
  Plus,
  Trash2,
  Save,
  Send,
  ArrowLeft,
  FileText,
  Users,
  Calendar,
  DollarSign,
  Upload as UploadIcon
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import type { ITeamPlan, ITeamObjective } from '../../../core/models';

const { TextArea } = Input;
const { Option } = Select;

export const CreateStrategyPage = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [teamPlans, setTeamPlans] = useState<ITeamPlan[]>([]);
  const [isTeamModalVisible, setIsTeamModalVisible] = useState(false);
  const [isObjectiveModalVisible, setIsObjectiveModalVisible] = useState(false);
  const [currentTeamIndex, setCurrentTeamIndex] = useState<number | null>(null);
  const [teamForm] = Form.useForm();
  const [objectiveForm] = Form.useForm();

  // Mock team leaders data
  const teamLeaders = [
    { id: '1', name: 'Nguyễn Văn A', team: 'Sales Team' },
    { id: '2', name: 'Trần Thị B', team: 'Marketing Team' },
    { id: '3', name: 'Lê Văn C', team: 'IT Team' },
  ];

  const handleAddTeamPlan = () => {
    setCurrentTeamIndex(null);
    teamForm.resetFields();
    setIsTeamModalVisible(true);
  };

  const handleEditTeamPlan = (index: number) => {
    setCurrentTeamIndex(index);
    const team = teamPlans[index];
    teamForm.setFieldsValue({
      teamLeaderId: team.teamLeaderId,
      budget: team.budget,
      resources: team.resources?.join(', '),
      startDate: team.timeline?.startDate,
      endDate: team.timeline?.endDate,
    });
    setIsTeamModalVisible(true);
  };

  const handleSaveTeamPlan = async () => {
    try {
      const values = await teamForm.validateFields();
      const selectedLeader = teamLeaders.find(tl => tl.id === values.teamLeaderId);
      
      const newTeamPlan: ITeamPlan = {
        id: currentTeamIndex !== null ? teamPlans[currentTeamIndex].id : `team-${Date.now()}`,
        teamName: selectedLeader?.team || '',
        teamLeaderId: values.teamLeaderId,
        teamLeaderName: selectedLeader?.name || '',
        objectives: currentTeamIndex !== null ? teamPlans[currentTeamIndex].objectives : [],
        budget: values.budget,
        resources: values.resources ? values.resources.split(',').map((r: string) => r.trim()) : [],
        timeline: {
          startDate: values.startDate,
          endDate: values.endDate,
        },
      };

      if (currentTeamIndex !== null) {
        const updated = [...teamPlans];
        updated[currentTeamIndex] = newTeamPlan;
        setTeamPlans(updated);
        toast.success('Cập nhật kế hoạch team thành công');
      } else {
        setTeamPlans([...teamPlans, newTeamPlan]);
        toast.success('Thêm kế hoạch team thành công');
      }

      setIsTeamModalVisible(false);
      teamForm.resetFields();
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const handleDeleteTeamPlan = (index: number) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: 'Bạn có chắc chắn muốn xóa kế hoạch team này?',
      okText: 'Xóa',
      cancelText: 'Hủy',
      okButtonProps: { danger: true },
      onOk: () => {
        const updated = teamPlans.filter((_, i) => i !== index);
        setTeamPlans(updated);
        toast.success('Đã xóa kế hoạch team');
      },
    });
  };

  const handleAddObjective = (teamIndex: number) => {
    setCurrentTeamIndex(teamIndex);
    objectiveForm.resetFields();
    setIsObjectiveModalVisible(true);
  };

  const handleSaveObjective = async () => {
    if (currentTeamIndex === null) return;

    try {
      const values = await objectiveForm.validateFields();
      
      const newObjective: ITeamObjective = {
        id: `obj-${Date.now()}`,
        title: values.title,
        description: values.description,
        weight: values.weight,
        target: values.target,
        unit: values.unit,
        category: values.category,
        measurementMethod: values.measurementMethod,
        evaluationCriteria: values.evaluationCriteria,
        startDate: values.startDate,
        endDate: values.endDate,
        expectedOutcome: values.expectedOutcome,
      };

      const updated = [...teamPlans];
      updated[currentTeamIndex].objectives.push(newObjective);
      setTeamPlans(updated);

      toast.success('Thêm mục tiêu thành công');
      setIsObjectiveModalVisible(false);
      objectiveForm.resetFields();
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const handleDeleteObjective = (teamIndex: number, objIndex: number) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: 'Bạn có chắc chắn muốn xóa mục tiêu này?',
      okText: 'Xóa',
      cancelText: 'Hủy',
      okButtonProps: { danger: true },
      onOk: () => {
        const updated = [...teamPlans];
        updated[teamIndex].objectives = updated[teamIndex].objectives.filter((_, i) => i !== objIndex);
        setTeamPlans(updated);
        toast.success('Đã xóa mục tiêu');
      },
    });
  };

  const handleSaveDraft = async () => {
    try {
      const values = await form.validateFields();
      console.log('Save draft:', { ...values, teamPlans, status: 'draft' });
      toast.success('Đã lưu nháp chiến lược');
      navigate('/strategy');
    } catch (error) {
      toast.error('Vui lòng điền đầy đủ thông tin');
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      if (teamPlans.length === 0) {
        toast.error('Vui lòng thêm ít nhất một kế hoạch team');
        return;
      }

      const hasObjectives = teamPlans.every(tp => tp.objectives.length > 0);
      if (!hasObjectives) {
        toast.error('Mỗi team phải có ít nhất một mục tiêu');
        return;
      }

      console.log('Submit strategy:', { ...values, teamPlans, status: 'pending_ceo' });
      toast.success('Đã gửi chiến lược đến CEO để phê duyệt');
      navigate('/strategy');
    } catch (error) {
      toast.error('Vui lòng điền đầy đủ thông tin');
    }
  };

  const teamColumns: ColumnsType<ITeamPlan> = [
    {
      title: 'Team',
      dataIndex: 'teamName',
      key: 'teamName',
      render: (text, record) => (
        <div>
          <div className="font-semibold">{text}</div>
          <div className="text-xs text-gray-500">{record.teamLeaderName}</div>
        </div>
      ),
    },
    {
      title: 'Số mục tiêu',
      key: 'objectives',
      align: 'center',
      width: 120,
      render: (_, record) => (
        <Tag color={record.objectives.length > 0 ? 'blue' : 'default'}>
          {record.objectives.length} mục tiêu
        </Tag>
      ),
    },
    {
      title: 'Ngân sách',
      dataIndex: 'budget',
      key: 'budget',
      width: 150,
      render: (budget) => budget ? `${budget.toLocaleString()} VNĐ` : '-',
    },
    {
      title: 'Thời gian',
      key: 'timeline',
      width: 200,
      render: (_, record) => {
        if (!record.timeline) return '-';
        return (
          <div className="text-xs">
            <div>{record.timeline.startDate}</div>
            <div className="text-gray-500">đến {record.timeline.endDate}</div>
          </div>
        );
      },
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 200,
      align: 'center',
      render: (_, __, index) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<Plus size={14} />}
            onClick={() => handleAddObjective(index)}
          >
            Thêm mục tiêu
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => handleEditTeamPlan(index)}
          >
            Sửa
          </Button>
          <Button
            type="link"
            size="small"
            danger
            icon={<Trash2 size={14} />}
            onClick={() => handleDeleteTeamPlan(index)}
          >
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  const steps = [
    {
      title: 'Thông tin cơ bản',
      icon: <FileText size={20} />,
    },
    {
      title: 'Kế hoạch các Team',
      icon: <Users size={20} />,
    },
    {
      title: 'Xem xét & Gửi',
      icon: <Send size={20} />,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <Target size={32} className="text-primary" />
            Tạo Chiến lược mới
          </h1>
          <p className="text-gray-500">Tạo kế hoạch chiến lược cho bộ phận và gửi CEO phê duyệt</p>
        </div>
        <Button
          icon={<ArrowLeft size={16} />}
          onClick={() => navigate('/strategy')}
        >
          Quay lại
        </Button>
      </div>

      {/* Steps */}
      <Card className="shadow-md">
        <Steps current={currentStep} items={steps} />
      </Card>

      {/* Alert */}
      <Alert
        message="Lưu ý về Chiến lược"
        description="Chiến lược bao gồm các kế hoạch của các team khác nhau trong bộ phận. Mỗi team sẽ có các mục tiêu cụ thể. CEO sẽ xem được chi tiết mục tiêu của team, không xem được KPI cá nhân của nhân viên."
        type="info"
        showIcon
      />

      <Form
        form={form}
        layout="vertical"
        initialValues={{
          period: 'yearly',
          year: new Date().getFullYear(),
        }}
      >
        {/* Step 1: Basic Info */}
        {currentStep === 0 && (
          <Card title="Thông tin cơ bản" className="shadow-md">
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  label="Tiêu đề chiến lược"
                  name="title"
                  rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}
                >
                  <Input 
                    placeholder="VD: Chiến lược tăng trưởng Q4/2024"
                    size="large"
                    prefix={<Target size={16} />}
                  />
                </Form.Item>
              </Col>

              <Col span={24}>
                <Form.Item
                  label="Mô tả"
                  name="description"
                  rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}
                >
                  <TextArea 
                    rows={4}
                    placeholder="Mô tả tổng quan về chiến lược..."
                  />
                </Form.Item>
              </Col>

              <Col span={8}>
                <Form.Item
                  label="Kỳ"
                  name="period"
                  rules={[{ required: true }]}
                >
                  <Select size="large">
                    <Option value="yearly">Cả năm</Option>
                    <Option value="half-yearly">6 tháng</Option>
                    <Option value="quarterly">Quý</Option>
                  </Select>
                </Form.Item>
              </Col>

              <Col span={8}>
                <Form.Item
                  label="Năm"
                  name="year"
                  rules={[{ required: true }]}
                >
                  <InputNumber 
                    size="large"
                    style={{ width: '100%' }}
                    min={2024}
                    max={2030}
                  />
                </Form.Item>
              </Col>

              <Col span={8}>
                <Form.Item
                  label="Quý (nếu có)"
                  name="quarter"
                >
                  <Select size="large" allowClear placeholder="Chọn quý">
                    <Option value={1}>Quý 1</Option>
                    <Option value={2}>Quý 2</Option>
                    <Option value={3}>Quý 3</Option>
                    <Option value={4}>Quý 4</Option>
                  </Select>
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item
                  label="Tổng ngân sách (VNĐ)"
                  name="totalBudget"
                >
                  <InputNumber
                    size="large"
                    style={{ width: '100%' }}
                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={value => value!.replace(/\$\s?|(,*)/g, '')}
                    prefix={<DollarSign size={16} />}
                  />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item
                  label="Tác động dự kiến"
                  name="expectedImpact"
                >
                  <Input 
                    size="large"
                    placeholder="VD: Tăng 20% doanh thu"
                  />
                </Form.Item>
              </Col>

              <Col span={24}>
                <Form.Item
                  label="Mục tiêu tổng thể"
                  name="overallObjectives"
                >
                  <Select
                    mode="tags"
                    size="large"
                    placeholder="Nhập và nhấn Enter để thêm mục tiêu"
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>
            </Row>

            <div className="flex justify-end gap-3 mt-6">
              <Button size="large" onClick={handleSaveDraft} icon={<Save size={16} />}>
                Lưu nháp
              </Button>
              <Button 
                type="primary" 
                size="large"
                onClick={() => setCurrentStep(1)}
              >
                Tiếp theo
              </Button>
            </div>
          </Card>
        )}

        {/* Step 2: Team Plans */}
        {currentStep === 1 && (
          <Card 
            title="Kế hoạch các Team"
            extra={
              <Button
                type="primary"
                icon={<Plus size={16} />}
                onClick={handleAddTeamPlan}
              >
                Thêm Team
              </Button>
            }
            className="shadow-md"
          >
            <Table
              columns={teamColumns}
              dataSource={teamPlans}
              rowKey="id"
              pagination={false}
              expandable={{
                expandedRowRender: (record) => (
                  <div className="p-4 bg-gray-50">
                    <h4 className="font-semibold mb-3">Mục tiêu của {record.teamName}</h4>
                    {record.objectives.length > 0 ? (
                      <div className="space-y-3">
                        {record.objectives.map((obj, index) => (
                          <Card key={obj.id} size="small" className="border-l-4 border-l-blue-500">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <Tag color="blue">Trọng số: {obj.weight}%</Tag>
                                  {obj.category && <Tag>{obj.category}</Tag>}
                                </div>
                                <h5 className="font-semibold text-base mb-1">{obj.title}</h5>
                                <p className="text-gray-600 text-sm mb-2">{obj.description}</p>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                  <div>
                                    <span className="text-gray-500">Mục tiêu: </span>
                                    <span className="font-medium">{obj.target} {obj.unit}</span>
                                  </div>
                                  {obj.expectedOutcome && (
                                    <div>
                                      <span className="text-gray-500">Kết quả mong đợi: </span>
                                      <span className="font-medium">{obj.expectedOutcome}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <Button
                                type="link"
                                danger
                                size="small"
                                icon={<Trash2 size={14} />}
                                onClick={() => handleDeleteObjective(teamPlans.indexOf(record), index)}
                              >
                                Xóa
                              </Button>
                            </div>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <Alert
                        message="Chưa có mục tiêu"
                        description="Vui lòng thêm ít nhất một mục tiêu cho team này"
                        type="warning"
                        showIcon
                      />
                    )}
                  </div>
                ),
              }}
            />

            <div className="flex justify-between mt-6">
              <Button size="large" onClick={() => setCurrentStep(0)}>
                Quay lại
              </Button>
              <div className="flex gap-3">
                <Button size="large" onClick={handleSaveDraft} icon={<Save size={16} />}>
                  Lưu nháp
                </Button>
                <Button 
                  type="primary" 
                  size="large"
                  onClick={() => setCurrentStep(2)}
                  disabled={teamPlans.length === 0}
                >
                  Tiếp theo
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Step 3: Review & Submit */}
        {currentStep === 2 && (
          <Card title="Xem xét & Gửi" className="shadow-md">
            <div className="space-y-4">
              <Alert
                message="Kiểm tra kỹ thông tin trước khi gửi"
                description="Sau khi gửi, chiến lược sẽ được chuyển đến CEO để phê duyệt. Bạn không thể chỉnh sửa trong quá trình chờ duyệt."
                type="info"
                showIcon
              />

              <Divider>Tổng quan</Divider>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{teamPlans.length}</div>
                  <div className="text-sm text-gray-600">Team tham gia</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {teamPlans.reduce((sum, tp) => sum + tp.objectives.length, 0)}
                  </div>
                  <div className="text-sm text-gray-600">Tổng mục tiêu</div>
                </div>
              </div>

              <Divider>Chi tiết các Team</Divider>
              {teamPlans.map((team, index) => (
                <Card key={team.id} size="small" className="mb-3">
                  <h4 className="font-semibold mb-2">{team.teamName}</h4>
                  <div className="text-sm text-gray-600 mb-2">
                    Team Leader: {team.teamLeaderName}
                  </div>
                  <div className="flex gap-2">
                    <Tag color="blue">{team.objectives.length} mục tiêu</Tag>
                    {team.budget && <Tag color="green">{team.budget.toLocaleString()} VNĐ</Tag>}
                  </div>
                </Card>
              ))}
            </div>

            <div className="flex justify-between mt-6">
              <Button size="large" onClick={() => setCurrentStep(1)}>
                Quay lại
              </Button>
              <div className="flex gap-3">
                <Button size="large" onClick={handleSaveDraft} icon={<Save size={16} />}>
                  Lưu nháp
                </Button>
                <Button 
                  type="primary" 
                  size="large"
                  icon={<Send size={16} />}
                  onClick={handleSubmit}
                >
                  Gửi CEO phê duyệt
                </Button>
              </div>
            </div>
          </Card>
        )}
      </Form>

      {/* Team Modal */}
      <Modal
        title={currentTeamIndex !== null ? 'Chỉnh sửa kế hoạch Team' : 'Thêm kế hoạch Team'}
        open={isTeamModalVisible}
        onOk={handleSaveTeamPlan}
        onCancel={() => setIsTeamModalVisible(false)}
        width={600}
        okText="Lưu"
        cancelText="Hủy"
      >
        <Form form={teamForm} layout="vertical">
          <Form.Item
            label="Team Leader"
            name="teamLeaderId"
            rules={[{ required: true, message: 'Vui lòng chọn Team Leader' }]}
          >
            <Select size="large" placeholder="Chọn Team Leader">
              {teamLeaders.map(tl => (
                <Option key={tl.id} value={tl.id}>
                  {tl.name} - {tl.team}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="Ngân sách (VNĐ)" name="budget">
            <InputNumber
              size="large"
              style={{ width: '100%' }}
              formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value!.replace(/\$\s?|(,*)/g, '')}
            />
          </Form.Item>

          <Form.Item label="Tài nguyên" name="resources">
            <TextArea 
              rows={2}
              placeholder="Nhập các tài nguyên, phân cách bằng dấu phẩy"
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Ngày bắt đầu" name="startDate">
                <Input type="date" size="large" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Ngày kết thúc" name="endDate">
                <Input type="date" size="large" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* Objective Modal */}
      <Modal
        title="Thêm mục tiêu cho Team"
        open={isObjectiveModalVisible}
        onOk={handleSaveObjective}
        onCancel={() => setIsObjectiveModalVisible(false)}
        width={700}
        okText="Thêm"
        cancelText="Hủy"
      >
        <Form form={objectiveForm} layout="vertical">
          <Form.Item
            label="Tiêu đề mục tiêu"
            name="title"
            rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}
          >
            <Input size="large" placeholder="VD: Tăng doanh số bán hàng" />
          </Form.Item>

          <Form.Item
            label="Mô tả"
            name="description"
            rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}
          >
            <TextArea rows={3} placeholder="Mô tả chi tiết mục tiêu..." />
          </Form.Item>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label="Trọng số (%)"
                name="weight"
                rules={[{ required: true, message: 'Vui lòng nhập trọng số' }]}
              >
                <InputNumber size="large" min={0} max={100} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Mục tiêu"
                name="target"
                rules={[{ required: true, message: 'Vui lòng nhập mục tiêu' }]}
              >
                <Input size="large" placeholder="VD: 100" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Đơn vị"
                name="unit"
                rules={[{ required: true, message: 'Vui lòng nhập đơn vị' }]}
              >
                <Input size="large" placeholder="VD: triệu VNĐ" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Danh mục" name="category">
            <Select size="large" placeholder="Chọn danh mục">
              <Option value="revenue">Doanh thu</Option>
              <Option value="customer">Khách hàng</Option>
              <Option value="quality">Chất lượng</Option>
              <Option value="efficiency">Hiệu suất</Option>
              <Option value="innovation">Đổi mới</Option>
            </Select>
          </Form.Item>

          <Form.Item label="Phương pháp đo lường" name="measurementMethod">
            <TextArea rows={2} placeholder="Mô tả cách đo lường mục tiêu..." />
          </Form.Item>

          <Form.Item label="Tiêu chí đánh giá" name="evaluationCriteria">
            <TextArea rows={2} placeholder="Tiêu chí để đánh giá hoàn thành..." />
          </Form.Item>

          <Form.Item label="Kết quả mong đợi" name="expectedOutcome">
            <Input size="large" placeholder="VD: Tăng 20% so với quý trước" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Ngày bắt đầu" name="startDate">
                <Input type="date" size="large" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Ngày kết thúc" name="endDate">
                <Input type="date" size="large" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};
