import { useState } from 'react';
import { 
  Form, 
  Input, 
  Button, 
  Card, 
  InputNumber, 
  Select, 
  Radio,
  Space,
  Divider,
  Alert,
  Modal,
  Tag,
  Collapse
} from 'antd';
import { 
  Plus, 
  Trash2, 
  Copy, 
  Save, 
  Send, 
  Eye,
  FolderPlus,
  ChevronDown
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { kpiApi } from '../../../../infrastructure/api';
import { storage } from '../../../../infrastructure/utils';
import type { IKPITarget, IKPIGroup } from '../../../../core/models';
import dayjs from 'dayjs';
import { useTranslation } from '../../../../infrastructure/i18n';

const { TextArea } = Input;
const { Option } = Select;
const { Panel } = Collapse;

interface KPIFormValues {
  year: number;
  quarter?: number;
  period: 'yearly' | 'quarterly' | 'monthly';
  title: string;
  description?: string;
}

export const CreateKPIForm = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [groups, setGroups] = useState<IKPIGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [activeKeys, setActiveKeys] = useState<string[]>([]);

  const userId = storage.getUserId();
  const userName = storage.getUserName();
  const department = storage.getDepartment();

  // Calculate total weight across all groups
  const allTargets = groups.flatMap(g => g.targets);
  const totalWeight = allTargets.reduce((sum, target) => sum + target.weight, 0);
  const isWeightValid = totalWeight === 100;
  const hasMinTargets = allTargets.length >= 1;
  const hasMaxTargets = allTargets.length <= 10;

  // Add new KPI group (parent)
  const addGroup = () => {
    const newGroup: IKPIGroup = {
      id: `group-${Date.now()}`,
      name: '',
      description: '',
      targets: []
    };
    setGroups([...groups, newGroup]);
    setActiveKeys([...activeKeys, newGroup.id]);
  };

  // Remove KPI group
  const removeGroup = (id: string) => {
    setGroups(groups.filter(g => g.id !== id));
    setActiveKeys(activeKeys.filter(k => k !== id));
  };

  // Update group info
  const updateGroup = (id: string, field: keyof IKPIGroup, value: any) => {
    setGroups(groups.map(g => 
      g.id === id ? { ...g, [field]: value } : g
    ));
  };

  // Add new target to a group
  const addTargetToGroup = (groupId: string) => {
    const newTarget: IKPITarget = {
      id: `target-${Date.now()}`,
      title: '',
      description: '',
      weight: 0,
      target: '',
      unit: '',
      category: '',
      measurementMethod: '',
      evaluationCriteria: '',
      startDate: dayjs().format('YYYY-MM-DD'),
      endDate: dayjs().add(1, 'year').format('YYYY-MM-DD'),
    };
    
    setGroups(groups.map(g => 
      g.id === groupId 
        ? { ...g, targets: [...g.targets, newTarget] }
        : g
    ));
  };

  // Remove target from group
  const removeTarget = (groupId: string, targetId: string) => {
    setGroups(groups.map(g => 
      g.id === groupId 
        ? { ...g, targets: g.targets.filter(t => t.id !== targetId) }
        : g
    ));
  };

  // Duplicate target within group
  const duplicateTarget = (groupId: string, target: IKPITarget) => {
    const newTarget = {
      ...target,
      id: `target-${Date.now()}`,
      title: `${target.title} (Copy)`,
    };
    
    setGroups(groups.map(g => 
      g.id === groupId 
        ? { ...g, targets: [...g.targets, newTarget] }
        : g
    ));
  };

  // Update target in group
  const updateTarget = (groupId: string, targetId: string, field: keyof IKPITarget, value: any) => {
    setGroups(groups.map(g => 
      g.id === groupId 
        ? {
            ...g,
            targets: g.targets.map(t => 
              t.id === targetId ? { ...t, [field]: value } : t
            )
          }
        : g
    ));
  };

  // Validate all targets
  const validateTargets = (): boolean => {
    if (groups.length === 0) {
      toast.error(t.createKPI.addAtLeastOneGroup);
      return false;
    }

    // Check group names
    for (const group of groups) {
      if (!group.name.trim()) {
        toast.error(t.createKPI.enterGroupNames);
        return false;
      }
      if (group.targets.length === 0) {
        toast.error(t.createKPI.groupMustHaveTarget.replace('{name}', group.name));
        return false;
      }
    }

    if (!hasMinTargets) {
      toast.error(t.createKPI.minTargetsRequired);
      return false;
    }

    if (!hasMaxTargets) {
      toast.error(t.createKPI.maxTargetsExceeded);
      return false;
    }

    if (!isWeightValid) {
      toast.error(t.createKPI.totalWeightMustBe100);
      return false;
    }

    // Check each target
    for (const group of groups) {
      for (const target of group.targets) {
        if (!target.title.trim()) {
          toast.error(t.createKPI.enterTargetTitle.replace('{name}', group.name));
          return false;
        }
        if (!target.description.trim()) {
          toast.error(t.createKPI.enterTargetDescription.replace('{title}', target.title));
          return false;
        }
        if (target.weight < 5 || target.weight > 50) {
          toast.error(t.createKPI.weightRange);
          return false;
        }
        if (!target.target.trim()) {
          toast.error(t.createKPI.enterTargetValue.replace('{title}', target.title));
          return false;
        }
        if (!target.unit.trim()) {
          toast.error(t.createKPI.enterUnit.replace('{title}', target.title));
          return false;
        }
      }
    }

    return true;
  };

  // Save as draft
  const saveDraft = async (values: KPIFormValues) => {
    if (groups.length === 0) {
      toast.error(t.createKPI.addAtLeastOneGroup);
      return;
    }

    setLoading(true);
    try {
      const response = await kpiApi.create({
        employeeId: userId || '',
        employeeName: userName || '',
        department: department || '',
        year: values.year,
        quarter: values.quarter,
        period: values.period,
        status: 'draft',
        targets: allTargets,
        groups: groups,
      });

      if (response.data.data) {
        toast.success(t.createKPI.savedDraft);
        navigate(`/kpi/${response.data.data.id}`);
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || t.createKPI.cannotSaveDraft);
    } finally {
      setLoading(false);
    }
  };

  // Submit for approval
  const submitForApproval = async (values: KPIFormValues) => {
    if (!validateTargets()) {
      return;
    }

    setLoading(true);
    try {
      const response = await kpiApi.create({
        employeeId: userId || '',
        employeeName: userName || '',
        department: department || '',
        year: values.year,
        quarter: values.quarter,
        period: values.period,
        status: 'pending_approval',
        targets: allTargets,
        groups: groups,
      });

      if (response.data.data) {
        toast.success(t.createKPI.submittedForApproval);
        navigate('/kpi');
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || t.createKPI.cannotSubmit);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t.createKPI.title}</h1>
        <p className="text-gray-500">{t.createKPI.subtitle}</p>
      </div>

      <Form form={form} layout="vertical">
        {/* Basic Information */}
        <Card className="shadow-sm mb-6 border border-primary bg-primary/10">
          <div className="flex flex-wrap items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-gray-500">{t.createKPI.employee}:</span>
              <span className="font-medium">{userName}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-500">{t.createKPI.department}:</span>
              <span className="font-medium">{department}</span>
            </div>
            <Divider type="vertical" className="h-6" />
            <Form.Item
              name="year"
              rules={[{ required: true, message: t.createKPI.selectYear }]}
              initialValue={new Date().getFullYear()}
              className="mb-0"
            >
              <Select size="middle" style={{ width: 100 }}>
                {[2024, 2025, 2026, 2027].map(year => (
                  <Option key={year} value={year}>{year}</Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              name="period"
              rules={[{ required: true, message: t.createKPI.selectPeriod }]}
              initialValue="yearly"
              className="mb-0"
            >
              <Radio.Group size="middle">
                <Radio.Button value="yearly">{t.createKPI.yearly}</Radio.Button>
                <Radio.Button value="quarterly">{t.createKPI.quarterly}</Radio.Button>
                <Radio.Button value="monthly">{t.createKPI.monthly}</Radio.Button>
              </Radio.Group>
            </Form.Item>
            <Form.Item
              noStyle
              shouldUpdate={(prevValues, currentValues) => 
                prevValues.period !== currentValues.period
              }
            >
              {({ getFieldValue }) =>
                getFieldValue('period') === 'quarterly' ? (
                  <Form.Item
                    name="quarter"
                    rules={[{ required: true, message: t.createKPI.selectQuarter }]}
                    className="mb-0"
                  >
                    <Select size="middle" placeholder={t.createKPI.selectQuarter} style={{ width: 100 }}>
                      <Option value={1}>{t.createKPI.quarter} 1</Option>
                      <Option value={2}>{t.createKPI.quarter} 2</Option>
                      <Option value={3}>{t.createKPI.quarter} 3</Option>
                      <Option value={4}>{t.createKPI.quarter} 4</Option>
                    </Select>
                  </Form.Item>
                ) : null
              }
            </Form.Item>
          </div>
        </Card>
        {/* KPI Groups */}
        <Card
          title={
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-lg font-semibold">{t.createKPI.kpiGroups}</span>
                <Tag color="blue" className="rounded-lg">{groups.length} {t.kpiList.groups}</Tag>
                <Tag color="success" className="rounded-lg">{allTargets.length} {t.kpiList.targets}</Tag>
              </div>
              <Tag 
                color={isWeightValid ? 'success' : 'error'}
                className="text-base px-3 py-1 rounded-xl"
              >
                {t.createKPI.totalWeight}: {totalWeight}%
              </Tag>
            </div>
          }
          className="shadow-sm mb-2"
        >
          {/* Validation Alerts */}
          {groups.length > 0 && (!hasMinTargets || !hasMaxTargets || !isWeightValid) && (
            <Alert
              message={
                <div className="flex items-center gap-4 text-sm">
                  {!hasMinTargets && <span>{t.createKPI.validationMinTargets}</span>}
                  {!hasMaxTargets && <span>{t.createKPI.validationMaxTargets}</span>}
                  {!isWeightValid && hasMinTargets && (
                    <span>
                      {totalWeight < 100 
                        ? t.createKPI.validationWeightLess.replace('{amount}', String(100 - totalWeight))
                        : t.createKPI.validationWeightMore.replace('{amount}', String(totalWeight - 100))
                      }
                    </span>
                  )}
                </div>
              }
              type={!hasMaxTargets ? 'error' : 'warning'}
              showIcon
              className="mb-3 rounded-xl h-7"
            />
          )}

          {/* Groups List */}
          <Collapse 
            activeKey={activeKeys}
            onChange={(keys) => setActiveKeys(keys as string[])}
            expandIcon={({ isActive }) => <ChevronDown size={20} className={`transition-transform ${isActive ? 'rotate-180' : ''}`} />}
            className="mb-4"
          >
            {groups.map((group, groupIndex) => {
              const groupWeight = group.targets.reduce((sum, t) => sum + t.weight, 0);
              
              return (
                <Panel
                  key={group.id}
                  header={
                    <div className="flex items-center justify-between w-full pr-4">
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-base">
                          #{groupIndex + 1} {group.name || t.createKPI.unnamed}
                        </span>
                        <Tag color="blue" className='rounded-lg'>{group.targets.length} {t.kpiList.targets}</Tag>
                        {groupWeight > 0 && (
                          <Tag color="green">{groupWeight}%</Tag>
                        )}
                      </div>
                      <Button
                        size="small"
                        danger
                        icon={<Trash2 size={14} />}
                        onClick={(e) => {
                          e.stopPropagation();
                          removeGroup(group.id);
                        }}
                        className='rounded-lg'
                      >
                        {t.createKPI.deleteGroup}
                      </Button>
                    </div>
                  }
                  className="border-l-4 border-l-purple-500"
                >
                  <div className="space-y-4">
                    {/* Group Info */}
                    <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
                      <div className="space-y-2">
                        <div>
                          <label className="block text-sm font-semibold text-purple-900 mb-1">
                            {t.createKPI.groupName}
                          </label>
                          <Input
                            placeholder={t.createKPI.groupNamePlaceholder}
                            value={group.name}
                            onChange={(e) => updateGroup(group.id, 'name', e.target.value)}
                            size="middle"
                            className="font-medium"
                            maxLength={200}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-purple-900 mb-1">
                            {t.createKPI.groupDescription}
                          </label>
                          <TextArea
                            placeholder={t.createKPI.groupDescriptionPlaceholder}
                            value={group.description}
                            onChange={(e) => updateGroup(group.id, 'description', e.target.value)}
                            rows={2}
                            maxLength={500}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Targets in Group */}
                    <div className="space-y-2">
                      {group.targets.map((target, targetIndex) => (
                        <Card
                          key={target.id}
                          type="inner"
                          className="border-l-4 border-l-blue-500 "
                          title={
                            <div className="flex items-center gap-2">
                              <span className="text-base font-semibold">
                                {groupIndex + 1}.{targetIndex + 1}
                              </span>
                              {target.title && (
                                <span className="text-gray-600 font-normal">- {target.title}</span>
                              )}
                              {target.weight > 0 && (
                                <Tag color="blue" className="ml-2">{target.weight}%</Tag>
                              )}
                            </div>
                          }
                          extra={
                            <Space>
                              <Button
                                size="small"
                                icon={<Copy size={14} />}
                                onClick={() => duplicateTarget(group.id, target)}
                              />
                              <Button
                                size="small"
                                danger
                                icon={<Trash2 size={14} />}
                                onClick={() => removeTarget(group.id, target.id)}
                              />
                            </Space>
                          }
                        >
                          <div className="space-y-2 ">
                            {/* Row 1: Title - Full Width */}
                            <div>
                              <Input
                                placeholder={t.createKPI.targetTitlePlaceholder}
                                value={target.title}
                                onChange={(e) => updateTarget(group.id, target.id, 'title', e.target.value)}
                                maxLength={200}
                                size="middle"
                                className="font-medium"
                              />
                            </div>

                            {/* Row 2: Key Metrics with Category */}
                            <div className="grid grid-cols-4 gap-3 bg-blue-50 p-3 rounded-xl border border-blue-200">
                              <div>
                                <label className="block text-xs font-semibold text-blue-900 mb-1">
                                  {t.createKPI.category}
                                </label>
                                <Select
                                  placeholder={t.createKPI.categorySelect}
                                  value={target.category || undefined}
                                  onChange={(value) => updateTarget(group.id, target.id, 'category', value)}
                                  size="middle"
                                  className='w-full'
                                  showSearch>
                                  <Option value="Doanh số">{t.createKPI.categorySales}</Option>
                                  <Option value="Chất lượng">{t.createKPI.categoryQuality}</Option>
                                  <Option value="Hiệu suất">{t.createKPI.categoryPerformance}</Option>
                                  <Option value="Phát triển">{t.createKPI.categoryDevelopment}</Option>
                                  <Option value="Quản lý">{t.createKPI.categoryManagement}</Option>
                                  <Option value="Khác">{t.createKPI.categoryOther}</Option>
                                </Select>
                              </div>
                              <div>
                                <label className="block text-xs font-semibold text-blue-900 mb-1">
                                  {t.createKPI.weight}
                                </label>
                                <Select
                                  value={target.weight || undefined}
                                  onChange={(value) => updateTarget(group.id, target.id, 'weight', value)}
                                  className="w-full"
                                  size="middle"
                                  placeholder={t.createKPI.categorySelect}
                                >
                                  <Option value={5}>5%</Option>
                                  <Option value={10}>10%</Option>
                                  <Option value={15}>15%</Option>
                                  <Option value={20}>20%</Option>
                                  <Option value={25}>25%</Option>
                                  <Option value={30}>30%</Option>
                                  <Option value={35}>35%</Option>
                                  <Option value={40}>40%</Option>
                                  <Option value={45}>45%</Option>
                                  <Option value={50}>50%</Option>
                                </Select>
                              </div>
                              <div>
                                <label className="block text-xs font-semibold text-blue-900 mb-1">
                                  {t.createKPI.target}
                                </label>
                                <Input
                                  value={target.target}
                                  onChange={(e) => updateTarget(group.id, target.id, 'target', e.target.value)}
                                  size="middle"
                                  className="font-medium"
                                  placeholder={t.createKPI.targetPlaceholder}
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-semibold text-blue-900 mb-1">
                                  {t.createKPI.unit}
                                </label>
                                <Select
                                  value={target.unit || undefined}
                                  onChange={(value) => updateTarget(group.id, target.id, 'unit', value)}
                                  size="middle"
                                  placeholder={t.createKPI.categorySelect}
                                  className='w-full'
                                  showSearch
                                >
                                  <Option value="VNĐ">{t.createKPI.unitVND}</Option>
                                  <Option value="USD">{t.createKPI.unitUSD}</Option>
                                  <Option value="%">{t.createKPI.unitPercent}</Option>
                                  <Option value="Triệu VNĐ">{t.createKPI.unitMillionVND}</Option>
                                  <Option value="Tỷ VNĐ">{t.createKPI.unitBillionVND}</Option>
                                  <Option value="Số lượng">{t.createKPI.unitQuantity}</Option>
                                  <Option value="Người">{t.createKPI.unitPerson}</Option>
                                  <Option value="Khách hàng">{t.createKPI.unitCustomer}</Option>
                                  <Option value="Dự án">{t.createKPI.unitProject}</Option>
                                  <Option value="Hợp đồng">{t.createKPI.unitContract}</Option>
                                  <Option value="Giờ">{t.createKPI.unitHour}</Option>
                                  <Option value="Ngày">{t.createKPI.unitDay}</Option>
                                  <Option value="Tháng">{t.createKPI.unitMonth}</Option>
                                  <Option value="Điểm">{t.createKPI.unitPoint}</Option>
                                  <Option value="Lần">{t.createKPI.unitTime}</Option>
                                </Select>
                              </div>
                            </div>

                            {/* Row 3: Description */}
                            <TextArea
                              placeholder={t.createKPI.description}
                              value={target.description}
                              onChange={(e) => updateTarget(group.id, target.id, 'description', e.target.value)}
                              rows={2}
                              maxLength={5000}
                            />

                            {/* Row 4: Optional Fields */}
                            <div className="grid grid-cols-2 gap-3">
                              <Select
                                placeholder={t.createKPI.measurementMethod}
                                value={target.measurementMethod || undefined}
                                onChange={(value) => updateTarget(group.id, target.id, 'measurementMethod', value)}
                                size="middle"
                                allowClear
                              >
                                <Option value="Báo cáo hệ thống">{t.createKPI.measurementSystemReport}</Option>
                                <Option value="Báo cáo thủ công">{t.createKPI.measurementManualReport}</Option>
                                <Option value="Đánh giá 360 độ">{t.createKPI.measurement360}</Option>
                                <Option value="KPI Dashboard">{t.createKPI.measurementDashboard}</Option>
                                <Option value="Khảo sát khách hàng">{t.createKPI.measurementCustomerSurvey}</Option>
                                <Option value="Phản hồi quản lý">{t.createKPI.measurementManagerFeedback}</Option>
                                <Option value="Số liệu thực tế">{t.createKPI.measurementActualData}</Option>
                                <Option value="Đo lường tự động">{t.createKPI.measurementAutomatic}</Option>
                                <Option value="Kiểm tra định kỳ">{t.createKPI.measurementPeriodic}</Option>
                              </Select>
                              <Select
                                placeholder={t.createKPI.evaluationCriteria}
                                value={target.evaluationCriteria || undefined}
                                onChange={(value) => updateTarget(group.id, target.id, 'evaluationCriteria', value)}
                                size="middle"
                                allowClear
                              >
                                <Option value="Đạt 100%">{t.createKPI.criteria100}</Option>
                                <Option value="Đạt trên 90%">{t.createKPI.criteriaAbove90}</Option>
                                <Option value="Đạt trên 80%">{t.createKPI.criteriaAbove80}</Option>
                                <Option value="Đạt trên 70%">{t.createKPI.criteriaAbove70}</Option>
                                <Option value="Tăng trưởng so với kỳ trước">{t.createKPI.criteriaGrowth}</Option>
                                <Option value="Duy trì ổn định">{t.createKPI.criteriaMaintain}</Option>
                                <Option value="Không giảm">{t.createKPI.criteriaNoDecrease}</Option>
                                <Option value="Theo kế hoạch">{t.createKPI.criteriaAsPlanned}</Option>
                                <Option value="Hoàn thành đúng hạn">{t.createKPI.criteriaOnTime}</Option>
                                <Option value="Chất lượng cao">{t.createKPI.criteriaHighQuality}</Option>
                              </Select>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>

                    <Button
                      type="dashed"
                      icon={<Plus size={16} />}
                      onClick={() => addTargetToGroup(group.id)}
                      block
                      size="middle"
                      
                      disabled={!hasMaxTargets}
                      className=" border-primary text-primary-light "
                    >
                      {t.createKPI.addTargetToGroup}
                    </Button>
                  </div>
                </Panel>
              );
            })}
          </Collapse>

          <Button
            type="primary"
            icon={<FolderPlus size={16} />}
            onClick={addGroup}
            block
            size="large"
            className="bg-purple-600 hover:bg-purple-700"
          >
            {t.createKPI.addNewGroup}
          </Button>
        </Card>

        {/* Actions */}
        <Card className="shadow-sm">
          <div className="flex justify-between items-center">
            <Button
              size="middle"
              onClick={() => navigate('/kpi')}
              className='rounded-lg'
            >
              {t.common.cancel}
            </Button>

            <Space>
              <Button
                size="middle"
                icon={<Save size={16} />}
                onClick={() => form.validateFields().then(saveDraft)}
                loading={loading}
                disabled={groups.length === 0}
                className="rounded-lg"
              >
                {t.createKPI.saveDraft}
              </Button>

              <Button
                size="middle"
                icon={<Eye size={16} />}
                onClick={() => setPreviewVisible(true)}
                disabled={groups.length === 0}
                className="rounded-lg"
              >
                {t.createKPI.preview}
              </Button>

              <Button
                type="primary"
                size="middle"
                icon={<Send size={16} />}
                onClick={() => form.validateFields().then(submitForApproval)}
                loading={loading}
                className="bg-primary hover:bg-primary-dark rounded-lg"
                disabled={!isWeightValid || !hasMinTargets}

              >
                {t.createKPI.submitForApproval}
              </Button>
            </Space>
          </div>
        </Card>
      </Form>

      {/* Preview Modal */}
      <Modal
        title={t.createKPI.previewTitle}
        open={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        footer={null}
        width={900}
      >
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">{t.createKPI.basicInfo}</h3>
            <p>{t.createKPI.employee}: {userName}</p>
            <p>{t.createKPI.department}: {department}</p>
            <p>{t.kpiList.year}: {form.getFieldValue('year')}</p>
          </div>

          <Divider />

          <div>
            <h3 className="font-semibold mb-3">
              {t.createKPI.groupList.replace('{groupCount}', String(groups.length)).replace('{targetCount}', String(allTargets.length))}
            </h3>
            {groups.map((group, groupIndex) => (
              <Card key={group.id} className="mb-3 border-l-4 border-l-purple-500">
                <h4 className="font-bold text-lg mb-2">
                  {groupIndex + 1}. {group.name}
                </h4>
                {group.description && (
                  <p className="text-gray-600 mb-3 italic">{group.description}</p>
                )}
                <div className="space-y-2">
                  {group.targets.map((target, targetIndex) => (
                    <Card key={target.id} type="inner" size="small">
                      <h5 className="font-semibold">
                        {groupIndex + 1}.{targetIndex + 1}. {target.title} ({target.weight}%)
                      </h5>
                      <p className="text-gray-600 text-sm">{target.description}</p>
                      <p className="text-sm">
                        <strong>{t.createKPI.target}:</strong> {target.target} {target.unit}
                      </p>
                    </Card>
                  ))}
                </div>
              </Card>
            ))}
          </div>

          <div className="text-center pt-4 border-t">
            <p className="text-lg">
              <strong>{t.createKPI.totalWeightLabel}</strong>{' '}
              <span className={isWeightValid ? 'text-green-600' : 'text-red-600'}>
                {totalWeight}%
              </span>
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
};
