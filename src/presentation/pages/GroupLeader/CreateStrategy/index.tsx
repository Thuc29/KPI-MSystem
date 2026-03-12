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
  Upload as UploadIcon,
  Edit
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import type { ITeamPlan, ITeamObjective } from '../../../../core/models';
import { useTranslation } from '../../../../infrastructure/i18n';

const { TextArea } = Input;
const { Option } = Select;

export const CreateStrategyPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
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
        toast.success(t.groupLeader.createStrategy.teamUpdated);
      } else {
        setTeamPlans([...teamPlans, newTeamPlan]);
        toast.success(t.groupLeader.createStrategy.teamAdded);
      }

      setIsTeamModalVisible(false);
      teamForm.resetFields();
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const handleDeleteTeamPlan = (index: number) => {
    Modal.confirm({
      title: t.groupLeader.createStrategy.confirmDelete,
      content: t.groupLeader.createStrategy.confirmDeleteMessage,
      okText: t.groupLeader.createStrategy.delete,
      cancelText: t.groupLeader.createStrategy.cancel,
      okButtonProps: { danger: true },
      onOk: () => {
        const updated = teamPlans.filter((_, i) => i !== index);
        setTeamPlans(updated);
        toast.success(t.groupLeader.createStrategy.teamDeleted);
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

      toast.success(t.groupLeader.createStrategy.objectiveAdded);
      setIsObjectiveModalVisible(false);
      objectiveForm.resetFields();
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const handleDeleteObjective = (teamIndex: number, objIndex: number) => {
    Modal.confirm({
      title: t.groupLeader.createStrategy.confirmDelete,
      content: t.groupLeader.createStrategy.confirmDeleteMessage,
      okText: t.groupLeader.createStrategy.delete,
      cancelText: t.groupLeader.createStrategy.cancel,
      okButtonProps: { danger: true },
      onOk: () => {
        const updated = [...teamPlans];
        updated[teamIndex].objectives = updated[teamIndex].objectives.filter((_:any, i:any) => i !== objIndex);
        setTeamPlans(updated);
        toast.success(t.groupLeader.createStrategy.objectiveDeleted);
      },
    });
  };

  const handleSaveDraft = async () => {
    try {
      const values = await form.validateFields();
      console.log('Save draft:', { ...values, teamPlans, status: 'draft' });
      toast.success(t.groupLeader.createStrategy.draftSaved);
      navigate('/strategy');
    } catch (error) {
      toast.error(t.groupLeader.createStrategy.fillAllInfo);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      if (teamPlans.length === 0) {
        toast.error(t.groupLeader.createStrategy.addAtLeastOneTeam);
        return;
      }

      const hasObjectives = teamPlans.every(tp => tp.objectives.length > 0);
      if (!hasObjectives) {
        toast.error(t.groupLeader.createStrategy.eachTeamNeedsObjective);
        return;
      }

      console.log('Submit strategy:', { ...values, teamPlans, status: 'pending_ceo' });
      toast.success(t.groupLeader.createStrategy.strategySent);
      navigate('/strategy');
    } catch (error) {
      toast.error(t.groupLeader.createStrategy.fillAllInfo);
    }
  };

  const teamColumns: ColumnsType<ITeamPlan> = [
    {
      title: t.groupLeader.createStrategy.teamLeader,
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
      title: t.groupLeader.createStrategy.targetCount,
      key: 'objectives',
      align: 'center',
      width: 120,
      render: (_, record) => (
        <Tag color={record.objectives.length > 0 ? 'blue' : 'default'}>
          {record.objectives.length} {t.groupLeader.createStrategy.objectives}
        </Tag>
      ),
    },
    {
      title: t.groupLeader.createStrategy.budget,
      dataIndex: 'budget',
      key: 'budget',
      width: 150,
      render: (budget) => budget ? `${budget.toLocaleString()} VNĐ` : '-',
    },
    {
      title: t.groupLeader.createStrategy.startDate,
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
      title: t.groupLeader.createStrategy.action,
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
            className='border border-blue-500'
            title={t.groupLeader.createStrategy.addObjective}
            />
            <Button
            type="link"
            size="small"
            icon={<Edit size={14} color='#eab308' />}
            onClick={() => handleEditTeamPlan(index)}
            className='border border-yellow-500'
            title={t.common.edit}
            />
            <Button
            type="link"
            size="small"
            danger
            icon={<Trash2 size={14} />}
            onClick={() => handleDeleteTeamPlan(index)}
            className='border border-red-500'
            title={t.groupLeader.createStrategy.delete}
            />
        </Space>
      ),
    },
  ];

  const steps = [
    {
      title: t.groupLeader.createStrategy.step1,
      icon: <FileText size={20} />,
    },
    {
      title: t.groupLeader.createStrategy.step2,
      icon: <Users size={20} />,
    },
    {
      title: t.groupLeader.createStrategy.step3,
      icon: <Send size={20} />,
    },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1 flex items-center gap-2">
            <Target size={30} className="text-primary" />
            {t.groupLeader.createStrategy.title}
          </h1>
          <p className="text-gray-500">{t.groupLeader.createStrategy.subtitle}</p>
        </div>
        <Button
          icon={<ArrowLeft size={16} />}
          onClick={() => navigate('/strategy')}
          className='items-center'
        >
          {t.groupLeader.createStrategy.backToList}
        </Button>
      </div>

      {/* Steps */}
      <Card className="shadow-md">
        <Steps current={currentStep}  items={steps} />
      </Card>

      {/* Alert */}
      <Alert
        message={t.groupLeader.createStrategy.alertTitle}
        description={t.groupLeader.createStrategy.alertMessage}
        type="info"
        showIcon
        className='p-3'
        closeIcon
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
          <Card title={t.groupLeader.createStrategy.step1} className="shadow-md">
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  label={t.groupLeader.createStrategy.strategyTitle}
                  name="title"
                  rules={[{ required: true, message: t.groupLeader.createStrategy.strategyTitleRequired }]}
                >
                  <Input 
                    placeholder={t.groupLeader.createStrategy.strategyTitlePlaceholder}
                    size="middle"
                    prefix={<Target size={16} />}
                  />
                </Form.Item>
              </Col>

              <Col span={24}>
                <Form.Item
                  label={t.groupLeader.createStrategy.description}
                  name="description"
                  rules={[{ required: true, message: t.groupLeader.createStrategy.descriptionRequired }]}
                >
                  <TextArea 
                    rows={4}
                    placeholder={t.groupLeader.createStrategy.descriptionPlaceholder}
                  />
                </Form.Item>
              </Col>

              <Col span={8}>
                <Form.Item
                  label={t.groupLeader.createStrategy.period}
                  name="period"
                  rules={[{ required: true }]}
                >
                  <Select size="middle">
                    <Option value="yearly">{t.groupLeader.strategy.yearly}</Option>
                    <Option value="half-yearly">{t.groupLeader.strategy.halfYearly}</Option>
                    <Option value="quarterly">{t.groupLeader.strategy.quarterly}</Option>
                  </Select>
                </Form.Item>
              </Col>

              <Col span={8}>
                <Form.Item
                  label={t.groupLeader.createStrategy.year}
                  name="year"
                  rules={[{ required: true }]}
                >
                  <InputNumber 
                    size="middle"
                    style={{ width: '100%' }}
                    min={2024}
                    max={2030}
                  />
                </Form.Item>
              </Col>

              <Col span={8}>
                <Form.Item
                  label={t.groupLeader.createStrategy.quarter}
                  name="quarter"
                >
                  <Select size="middle" allowClear placeholder={t.groupLeader.createStrategy.selectQuarter}>
                    <Option value={1}>{t.groupLeader.createStrategy.quarter1}</Option>
                    <Option value={2}>{t.groupLeader.createStrategy.quarter2}</Option>
                    <Option value={3}>{t.groupLeader.createStrategy.quarter3}</Option>
                    <Option value={4}>{t.groupLeader.createStrategy.quarter4}</Option>
                  </Select>
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item
                  label={t.groupLeader.createStrategy.totalBudget}
                  name="totalBudget"
                >
                  <InputNumber
                    size="middle"
                    style={{ width: '100%' }}
                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={value => value!.replace(/\$\s?|(,*)/g, '')}
                    prefix={<DollarSign size={16} />}
                  />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item
                  label={t.groupLeader.createStrategy.expectedImpact}
                  name="expectedImpact"
                >
                  <Input 
                    size="middle"
                    placeholder={t.groupLeader.createStrategy.expectedImpactPlaceholder}
                  />
                </Form.Item>
              </Col>

              <Col span={24}>
                <Form.Item
                  label={t.groupLeader.createStrategy.overallObjectives}
                  name="overallObjectives"
                >
                  <Select
                    mode="tags"
                    size="middle"
                    placeholder={t.groupLeader.createStrategy.overallObjectivesPlaceholder}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>
            </Row>

            <div className="flex justify-end gap-3 mt-6">
              <Button size="middle" onClick={handleSaveDraft} icon={<Save size={16} />}>
                {t.groupLeader.createStrategy.saveDraft}
              </Button>
              <Button 
                type="primary" 
                size="middle"
                onClick={() => setCurrentStep(1)}
              >
                {t.groupLeader.createStrategy.next}
              </Button>
            </div>
          </Card>
        )}

        {/* Step 2: Team Plans */}
        {currentStep === 1 && (
          <Card 
            title={t.groupLeader.createStrategy.teamPlans}
            extra={
              <Button
                type="primary"
                icon={<Plus size={16} />}
                onClick={handleAddTeamPlan}
              >
                {t.groupLeader.createStrategy.addTeam}
              </Button>
            }
            className="shadow-md"
          >
            <Table
              columns={teamColumns}
              dataSource={teamPlans}
              rowKey="id"
              pagination={false}
              
              bordered
              expandable={{
                expandedRowRender: (record) => (
                  <div className="p-1">
                    <h4 className="font-semibold mb-2">{t.groupLeader.createStrategy.objectivesOf.replace('{teamName}', record.teamName)}</h4>
                    {record.objectives.length > 0 ? (
                      <div className="space-y-2">
                        {record.objectives.map((obj:any, index:any) => (
                          <Card key={obj.id} size="small" className="border-l-4 border-l-blue-500">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <Tag color="blue">{t.groupLeader.createStrategy.weight}: {obj.weight}%</Tag>
                                  {obj.category && <Tag>{obj.category}</Tag>}
                                </div>
                                <h5 className="font-semibold text-base mb-1">{obj.title}</h5>
                                <p className="text-gray-600 text-sm mb-2">{obj.description}</p>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                  <div>
                                    <span className="text-gray-500">{t.groupLeader.createStrategy.target}: </span>
                                    <span className="font-medium">{obj.target} {obj.unit}</span>
                                  </div>
                                  {obj.expectedOutcome && (
                                    <div>
                                      <span className="text-gray-500">{t.groupLeader.createStrategy.expectedOutcome}: </span>
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
                                {t.groupLeader.createStrategy.delete}
                              </Button>
                            </div>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <Alert
                        message={t.groupLeader.createStrategy.noObjectives}
                        description={t.groupLeader.createStrategy.noObjectivesMessage}
                        type="warning"
                        showIcon
                        className='p-3'
                      />
                    )}
                  </div>
                ),
              }}
            />

            <div className="flex justify-between mt-6">
              <Button size="middle" onClick={() => setCurrentStep(0)}>
                {t.groupLeader.createStrategy.back}
              </Button>
              <div className="flex gap-3">
                <Button size="middle" onClick={handleSaveDraft} icon={<Save size={16} />}>
                  {t.groupLeader.createStrategy.saveDraft}
                </Button>
                <Button 
                  type="primary" 
                  size="middle"
                  onClick={() => setCurrentStep(2)}
                  disabled={teamPlans.length === 0}
                >
                  {t.groupLeader.createStrategy.next}
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Step 3: Review & Submit */}
        {currentStep === 2 && (
          <Card title={t.groupLeader.createStrategy.reviewTitle} className="shadow-md">
            <div className="space-y-3">
              <Alert
                message={t.groupLeader.createStrategy.reviewAlert}
                description={t.groupLeader.createStrategy.reviewAlertMessage}
                type="info"
                showIcon
                className='p-2'
              />

              <Divider>{t.groupLeader.createStrategy.overview}</Divider>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl">
                  <div className="text-2xl font-bold text-blue-600">{teamPlans.length}</div>
                  <div className="text-sm text-gray-600">{t.groupLeader.createStrategy.teamsParticipating}</div>
                </div>
                <div className="bg-green-50 border border-green-200 p-4 rounded-xl">
                  <div className="text-2xl font-bold text-green-600">
                    {teamPlans.reduce((sum, tp) => sum + tp.objectives.length, 0)}
                  </div>
                  <div className="text-sm text-gray-600">{t.groupLeader.createStrategy.totalObjectives}</div>
                </div>
              </div>

              <Divider>{t.groupLeader.createStrategy.teamDetails}</Divider>
              {teamPlans.map((team, index) => (
                <Card key={team.id} size="small" className="mb-3">
                  <h4 className="font-bold text-lg mb-1">{team.teamName}</h4>
                  <div className="text-sm font-semibold text-gray-600 mb-2">
                    {t.groupLeader.createStrategy.teamLeader}: {team.teamLeaderName}
                  </div>
                  <div className="flex gap-2">
                    <Tag color="blue">{team.objectives.length} {t.groupLeader.createStrategy.objectives}</Tag>
                    {team.budget && <Tag color="green">{team.budget.toLocaleString()} VNĐ</Tag>}
                  </div>
                </Card>
              ))}
            </div>

            <div className="flex justify-between mt-6">
              <Button size="middle" onClick={() => setCurrentStep(1)}>
                {t.groupLeader.createStrategy.back}
              </Button>
              <div className="flex gap-3">
                <Button size="middle" onClick={handleSaveDraft} icon={<Save size={16} />}>
                  {t.groupLeader.createStrategy.saveDraft}
                </Button>
                <Button 
                  type="primary" 
                  size="middle"
                  icon={<Send size={16} />}
                  onClick={handleSubmit}
                >
                  {t.groupLeader.createStrategy.sendToCEO}
                </Button>
              </div>
            </div>
          </Card>
        )}
      </Form>

      {/* Team Modal */}
      <Modal
        title={currentTeamIndex !== null ? t.groupLeader.createStrategy.editTeamPlan : t.groupLeader.createStrategy.addTeamPlan}
        open={isTeamModalVisible}
        onOk={handleSaveTeamPlan}
        onCancel={() => setIsTeamModalVisible(false)}
        width={600}
        okText={t.groupLeader.createStrategy.save}
        cancelText={t.groupLeader.createStrategy.cancel}
      >
        <Form form={teamForm} layout="vertical">
          <Form.Item
            label={t.groupLeader.createStrategy.teamLeader}
            name="teamLeaderId"
            rules={[{ required: true, message: t.groupLeader.createStrategy.teamLeaderRequired }]}
          >
            <Select size="middle" placeholder={t.groupLeader.createStrategy.selectTeamLeader}>
              {teamLeaders.map(tl => (
                <Option key={tl.id} value={tl.id}>
                  {tl.name} - {tl.team}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label={t.groupLeader.createStrategy.budget} name="budget">
            <InputNumber
              size="middle"
              style={{ width: '100%' }}
              formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value!.replace(/\$\s?|(,*)/g, '')}
            />
          </Form.Item>

          <Form.Item label={t.groupLeader.createStrategy.resources} name="resources">
            <TextArea 
              rows={2}
              placeholder={t.groupLeader.createStrategy.resourcesPlaceholder}
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label={t.groupLeader.createStrategy.startDate} name="startDate">
                <Input type="date" size="middle" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label={t.groupLeader.createStrategy.endDate} name="endDate">
                <Input type="date" size="middle" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* Objective Modal */}
      <Modal
        title={t.groupLeader.createStrategy.addObjectiveForTeam}
        open={isObjectiveModalVisible}
        onOk={handleSaveObjective}
        onCancel={() => setIsObjectiveModalVisible(false)}
        width={700}
        okText={t.groupLeader.createStrategy.addObjective}
        cancelText={t.groupLeader.createStrategy.cancel}
      >
        <Form form={objectiveForm} layout="vertical">
          <Form.Item
            label={t.groupLeader.createStrategy.objectiveTitle}
            name="title"
            rules={[{ required: true, message: t.groupLeader.createStrategy.objectiveTitleRequired }]}
          >
            <Input size="middle" placeholder={t.groupLeader.createStrategy.objectiveTitlePlaceholder} />
          </Form.Item>

          <Form.Item
            label={t.groupLeader.createStrategy.objectiveDescription}
            name="description"
            rules={[{ required: true, message: t.groupLeader.createStrategy.objectiveDescriptionRequired }]}
          >
            <TextArea rows={3} placeholder={t.groupLeader.createStrategy.objectiveDescriptionPlaceholder} />
          </Form.Item>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label={t.groupLeader.createStrategy.weight}
                name="weight"
                rules={[{ required: true, message: t.groupLeader.createStrategy.weightRequired }]}
              >
                <InputNumber size="middle" min={0} max={100} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label={t.groupLeader.createStrategy.target}
                name="target"
                rules={[{ required: true, message: t.groupLeader.createStrategy.targetRequired }]}
              >
                <Input size="middle" placeholder={t.groupLeader.createStrategy.targetPlaceholder} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label={t.groupLeader.createStrategy.unit}
                name="unit"
                rules={[{ required: true, message: t.groupLeader.createStrategy.unitRequired }]}
              >
                <Input size="middle" placeholder={t.groupLeader.createStrategy.unitPlaceholder} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label={t.groupLeader.createStrategy.category} name="category">
            <Select size="middle" placeholder={t.groupLeader.createStrategy.categoryPlaceholder}>
              <Option value="revenue">{t.groupLeader.createStrategy.categoryRevenue}</Option>
              <Option value="customer">{t.groupLeader.createStrategy.categoryCustomer}</Option>
              <Option value="quality">{t.groupLeader.createStrategy.categoryQuality}</Option>
              <Option value="efficiency">{t.groupLeader.createStrategy.categoryEfficiency}</Option>
              <Option value="innovation">{t.groupLeader.createStrategy.categoryInnovation}</Option>
            </Select>
          </Form.Item>

          <Form.Item label={t.groupLeader.createStrategy.measurementMethod} name="measurementMethod">
            <TextArea rows={2} placeholder={t.groupLeader.createStrategy.measurementMethodPlaceholder} />
          </Form.Item>

          <Form.Item label={t.groupLeader.createStrategy.evaluationCriteria} name="evaluationCriteria">
            <TextArea rows={2} placeholder={t.groupLeader.createStrategy.evaluationCriteriaPlaceholder} />
          </Form.Item>

          <Form.Item label={t.groupLeader.createStrategy.expectedOutcome} name="expectedOutcome">
            <Input size="middle" placeholder={t.groupLeader.createStrategy.expectedOutcomePlaceholder} />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label={t.groupLeader.createStrategy.startDate} name="startDate">
                <Input type="date" size="middle" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label={t.groupLeader.createStrategy.endDate} name="endDate">
                <Input type="date" size="middle" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};
