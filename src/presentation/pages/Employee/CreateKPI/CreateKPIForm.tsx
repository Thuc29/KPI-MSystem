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
      toast.error('Vui lòng thêm ít nhất 1 nhóm KPI');
      return false;
    }

    // Check group names
    for (const group of groups) {
      if (!group.name.trim()) {
        toast.error('Vui lòng nhập tên cho tất cả các nhóm KPI');
        return false;
      }
      if (group.targets.length === 0) {
        toast.error(`Nhóm "${group.name}" phải có ít nhất 1 mục tiêu`);
        return false;
      }
    }

    if (!hasMinTargets) {
      toast.error('Tổng số mục tiêu phải có ít nhất 1');
      return false;
    }

    if (!hasMaxTargets) {
      toast.error('Tổng số mục tiêu tối đa 10');
      return false;
    }

    if (!isWeightValid) {
      toast.error('Tổng trọng số phải bằng 100%');
      return false;
    }

    // Check each target
    for (const group of groups) {
      for (const target of group.targets) {
        if (!target.title.trim()) {
          toast.error(`Vui lòng nhập tên mục tiêu trong nhóm "${group.name}"`);
          return false;
        }
        if (!target.description.trim()) {
          toast.error(`Vui lòng nhập mô tả cho mục tiêu "${target.title}"`);
          return false;
        }
        if (target.weight < 5 || target.weight > 50) {
          toast.error('Trọng số mỗi mục tiêu từ 5% đến 50%');
          return false;
        }
        if (!target.target.trim()) {
          toast.error(`Vui lòng nhập chỉ tiêu cho "${target.title}"`);
          return false;
        }
        if (!target.unit.trim()) {
          toast.error(`Vui lòng nhập đơn vị cho "${target.title}"`);
          return false;
        }
      }
    }

    return true;
  };

  // Save as draft
  const saveDraft = async (values: KPIFormValues) => {
    if (groups.length === 0) {
      toast.error('Vui lòng thêm ít nhất 1 nhóm KPI');
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
        toast.success('Đã lưu bản nháp');
        navigate(`/kpi/${response.data.data.id}`);
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Không thể lưu bản nháp');
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
        toast.success('Đã gửi KPI để phê duyệt');
        navigate('/kpi');
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Không thể gửi KPI');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Tạo KPI mới</h1>
        <p className="text-gray-500">Thiết lập mục tiêu và chỉ tiêu đánh giá hiệu suất theo nhóm</p>
      </div>

      <Form form={form} layout="vertical">
        {/* Basic Information */}
        <Card className="shadow-sm mb-6 border border-primary bg-primary/10">
          <div className="flex flex-wrap items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-gray-500">Nhân viên:</span>
              <span className="font-medium">{userName}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-500">Phòng ban:</span>
              <span className="font-medium">{department}</span>
            </div>
            <Divider type="vertical" className="h-6" />
            <Form.Item
              name="year"
              rules={[{ required: true, message: 'Vui lòng chọn năm' }]}
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
              rules={[{ required: true, message: 'Vui lòng chọn chu kỳ' }]}
              initialValue="yearly"
              className="mb-0"
            >
              <Radio.Group size="middle">
                <Radio.Button value="yearly">Năm</Radio.Button>
                <Radio.Button value="quarterly">Quý</Radio.Button>
                <Radio.Button value="monthly">Tháng</Radio.Button>
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
                    rules={[{ required: true, message: 'Vui lòng chọn quý' }]}
                    className="mb-0"
                  >
                    <Select size="middle" placeholder="Chọn quý" style={{ width: 100 }}>
                      <Option value={1}>Quý 1</Option>
                      <Option value={2}>Quý 2</Option>
                      <Option value={3}>Quý 3</Option>
                      <Option value={4}>Quý 4</Option>
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
                <span className="text-lg font-semibold">Nhóm KPI</span>
                <Tag color="blue" className="rounded-lg">{groups.length} nhóm</Tag>
                <Tag color="success" className="rounded-lg">{allTargets.length} mục tiêu</Tag>
              </div>
              <Tag 
                color={isWeightValid ? 'success' : 'error'}
                className="text-base px-3 py-1 rounded-xl"
              >
                Tổng: {totalWeight}%
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
                  {!hasMinTargets && <span>• Cần ít nhất 1 mục tiêu tổng</span>}
                  {!hasMaxTargets && <span>• Tối đa 10 mục tiêu tổng</span>}
                  {!isWeightValid && hasMinTargets && (
                    <span>
                      • Trọng số {totalWeight < 100 ? `thiếu ${100 - totalWeight}%` : `thừa ${totalWeight - 100}%`}
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
                          #{groupIndex + 1} {group.name || '(Chưa đặt tên)'}
                        </span>
                        <Tag color="blue" className='rounded-lg'>{group.targets.length} mục tiêu</Tag>
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
                        Xóa nhóm
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
                            TÊN NHÓM KPI *
                          </label>
                          <Input
                            placeholder="Ví dụ: Mục tiêu doanh số, Phát triển kỹ năng..."
                            value={group.name}
                            onChange={(e) => updateGroup(group.id, 'name', e.target.value)}
                            size="middle"
                            className="font-medium"
                            maxLength={200}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-purple-900 mb-1">
                            MÔ TẢ NHÓM
                          </label>
                          <TextArea
                            placeholder="Mô tả ngắn gọn về nhóm KPI này..."
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
                                placeholder="Tên mục tiêu *"
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
                                  DANH MỤC *
                                </label>
                                <Select
                                  placeholder="Chọn"
                                  value={target.category || undefined}
                                  onChange={(value) => updateTarget(group.id, target.id, 'category', value)}
                                  size="middle"
                                  className='w-full'
                                  showSearch>
                                  <Option value="Doanh số">Doanh số</Option>
                                  <Option value="Chất lượng">Chất lượng</Option>
                                  <Option value="Hiệu suất">Hiệu suất</Option>
                                  <Option value="Phát triển">Phát triển</Option>
                                  <Option value="Quản lý">Quản lý</Option>
                                  <Option value="Khác">Khác</Option>
                                </Select>
                              </div>
                              <div>
                                <label className="block text-xs font-semibold text-blue-900 mb-1">
                                  TRỌNG SỐ (%) *
                                </label>
                                <Select
                                  value={target.weight || undefined}
                                  onChange={(value) => updateTarget(group.id, target.id, 'weight', value)}
                                  className="w-full"
                                  size="middle"
                                  placeholder="Chọn"
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
                                  CHỈ TIÊU *
                                </label>
                                <Input
                                  value={target.target}
                                  onChange={(e) => updateTarget(group.id, target.id, 'target', e.target.value)}
                                  size="middle"
                                  className="font-medium"
                                  placeholder="Nhập số"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-semibold text-blue-900 mb-1">
                                  ĐƠN VỊ *
                                </label>
                                <Select
                                  value={target.unit || undefined}
                                  onChange={(value) => updateTarget(group.id, target.id, 'unit', value)}
                                  size="middle"
                                  placeholder="Chọn"
                                  className='w-full'
                                  showSearch
                                >
                                  <Option value="VNĐ">VNĐ</Option>
                                  <Option value="USD">USD</Option>
                                  <Option value="%">%</Option>
                                  <Option value="Triệu VNĐ">Triệu VNĐ</Option>
                                  <Option value="Tỷ VNĐ">Tỷ VNĐ</Option>
                                  <Option value="Số lượng">Số lượng</Option>
                                  <Option value="Người">Người</Option>
                                  <Option value="Khách hàng">Khách hàng</Option>
                                  <Option value="Dự án">Dự án</Option>
                                  <Option value="Hợp đồng">Hợp đồng</Option>
                                  <Option value="Giờ">Giờ</Option>
                                  <Option value="Ngày">Ngày</Option>
                                  <Option value="Tháng">Tháng</Option>
                                  <Option value="Điểm">Điểm</Option>
                                  <Option value="Lần">Lần</Option>
                                </Select>
                              </div>
                            </div>

                            {/* Row 3: Description */}
                            <TextArea
                              placeholder="Mô tả chi tiết mục tiêu *"
                              value={target.description}
                              onChange={(e) => updateTarget(group.id, target.id, 'description', e.target.value)}
                              rows={2}
                              maxLength={5000}
                            />

                            {/* Row 4: Optional Fields */}
                            <div className="grid grid-cols-2 gap-3">
                              <Select
                                placeholder="Phương pháp đo lường"
                                value={target.measurementMethod || undefined}
                                onChange={(value) => updateTarget(group.id, target.id, 'measurementMethod', value)}
                                size="middle"
                                allowClear
                              >
                                <Option value="Báo cáo hệ thống">Báo cáo hệ thống</Option>
                                <Option value="Báo cáo thủ công">Báo cáo thủ công</Option>
                                <Option value="Đánh giá 360 độ">Đánh giá 360 độ</Option>
                                <Option value="KPI Dashboard">KPI Dashboard</Option>
                                <Option value="Khảo sát khách hàng">Khảo sát khách hàng</Option>
                                <Option value="Phản hồi quản lý">Phản hồi quản lý</Option>
                                <Option value="Số liệu thực tế">Số liệu thực tế</Option>
                                <Option value="Đo lường tự động">Đo lường tự động</Option>
                                <Option value="Kiểm tra định kỳ">Kiểm tra định kỳ</Option>
                              </Select>
                              <Select
                                placeholder="Tiêu chí đánh giá"
                                value={target.evaluationCriteria || undefined}
                                onChange={(value) => updateTarget(group.id, target.id, 'evaluationCriteria', value)}
                                size="middle"
                                allowClear
                              >
                                <Option value="Đạt 100%">Đạt 100%</Option>
                                <Option value="Đạt trên 90%">Đạt trên 90%</Option>
                                <Option value="Đạt trên 80%">Đạt trên 80%</Option>
                                <Option value="Đạt trên 70%">Đạt trên 70%</Option>
                                <Option value="Tăng trưởng so với kỳ trước">Tăng trưởng so với kỳ trước</Option>
                                <Option value="Duy trì ổn định">Duy trì ổn định</Option>
                                <Option value="Không giảm">Không giảm</Option>
                                <Option value="Theo kế hoạch">Theo kế hoạch</Option>
                                <Option value="Hoàn thành đúng hạn">Hoàn thành đúng hạn</Option>
                                <Option value="Chất lượng cao">Chất lượng cao</Option>
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
                      Thêm mục tiêu vào nhóm này
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
            Thêm KPI mới
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
              Hủy
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
                Lưu nháp
              </Button>

              <Button
                size="middle"
                icon={<Eye size={16} />}
                onClick={() => setPreviewVisible(true)}
                disabled={groups.length === 0}
                className="rounded-lg"
              >
                Xem trước
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
                Gửi duyệt
              </Button>
            </Space>
          </div>
        </Card>
      </Form>

      {/* Preview Modal */}
      <Modal
        title="Xem trước KPI"
        open={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        footer={null}
        width={900}
      >
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Thông tin cơ bản</h3>
            <p>Nhân viên: {userName}</p>
            <p>Phòng ban: {department}</p>
            <p>Năm: {form.getFieldValue('year')}</p>
          </div>

          <Divider />

          <div>
            <h3 className="font-semibold mb-3">
              Danh sách nhóm KPI ({groups.length} nhóm, {allTargets.length} mục tiêu)
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
                        <strong>Chỉ tiêu:</strong> {target.target} {target.unit}
                      </p>
                    </Card>
                  ))}
                </div>
              </Card>
            ))}
          </div>

          <div className="text-center pt-4 border-t">
            <p className="text-lg">
              <strong>Tổng trọng số:</strong>{' '}
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
