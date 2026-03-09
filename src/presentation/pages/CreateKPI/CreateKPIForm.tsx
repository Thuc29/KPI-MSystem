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
  Tag
} from 'antd';
import { 
  Plus, 
  Trash2, 
  Copy, 
  Save, 
  Send, 
  Eye,
  AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { kpiApi } from '../../../infrastructure/api';
import { storage } from '../../../infrastructure/utils';
import type { IKPITarget } from '../../../core/models';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Option } = Select;

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
  const [targets, setTargets] = useState<IKPITarget[]>([]);
  const [loading, setLoading] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);

  const userId = storage.getUserId();
  const userName = storage.getUserName();
  const department = storage.getDepartment();

  // Calculate total weight
  const totalWeight = targets.reduce((sum, target) => sum + target.weight, 0);
  const isWeightValid = totalWeight === 100;
  const hasMinTargets = targets.length >= 3;
  const hasMaxTargets = targets.length <= 10;

  // Add new target
  const addTarget = () => {
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
    setTargets([...targets, newTarget]);
  };

  // Remove target
  const removeTarget = (id: string) => {
    setTargets(targets.filter(t => t.id !== id));
  };

  // Duplicate target
  const duplicateTarget = (target: IKPITarget) => {
    const newTarget = {
      ...target,
      id: `target-${Date.now()}`,
      title: `${target.title} (Copy)`,
    };
    setTargets([...targets, newTarget]);
  };

  // Update target
  const updateTarget = (id: string, field: keyof IKPITarget, value: any) => {
    setTargets(targets.map(t => 
      t.id === id ? { ...t, [field]: value } : t
    ));
  };

  // Validate targets
  const validateTargets = (): boolean => {
    if (!hasMinTargets) {
      toast.error('Phải có ít nhất 3 mục tiêu KPI');
      return false;
    }

    if (!hasMaxTargets) {
      toast.error('Tối đa 10 mục tiêu KPI');
      return false;
    }

    if (!isWeightValid) {
      toast.error('Tổng trọng số phải bằng 100%');
      return false;
    }

    // Check each target
    for (const target of targets) {
      if (!target.title.trim()) {
        toast.error('Vui lòng nhập tên mục tiêu');
        return false;
      }
      if (!target.description.trim()) {
        toast.error('Vui lòng nhập mô tả chi tiết');
        return false;
      }
      if (target.weight < 5 || target.weight > 50) {
        toast.error('Trọng số mỗi mục tiêu từ 5% đến 50%');
        return false;
      }
      if (!target.target.trim()) {
        toast.error('Vui lòng nhập chỉ tiêu');
        return false;
      }
      if (!target.unit.trim()) {
        toast.error('Vui lòng nhập đơn vị');
        return false;
      }
    }

    return true;
  };

  // Save as draft
  const saveDraft = async (values: KPIFormValues) => {
    if (targets.length === 0) {
      toast.error('Vui lòng thêm ít nhất 1 mục tiêu');
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
        targets: targets,
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
        status: 'pending_manager',
        targets: targets,
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
        <p className="text-gray-500">Thiết lập mục tiêu và chỉ tiêu đánh giá hiệu suất</p>
      </div>

      <Form form={form} layout="vertical">
        {/* Basic Information - Compact */}
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

        {/* KPI Targets */}
        <Card 
          title={
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-lg font-semibold">Mục tiêu KPI</span>
                <Tag color="success">{targets.length} mục tiêu</Tag>
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
          {/* Validation Alerts - Compact */}
          {targets.length > 0 && (!hasMinTargets || !hasMaxTargets || !isWeightValid) && (
            <Alert
              message={
                <div className="flex items-center gap-4 text-sm">
                  {!hasMinTargets && <span>• Cần ít nhất 3 mục tiêu</span>}
                  {!hasMaxTargets && <span>• Tối đa 10 mục tiêu</span>}
                  {!isWeightValid && hasMinTargets && (
                    <span>
                      • Trọng số {totalWeight < 100 ? `thiếu ${100 - totalWeight}%` : `thừa ${totalWeight - 100}%`}
                    </span>
                  )}
                </div>
              }
              type={!hasMaxTargets ? 'error' : 'warning'}
              showIcon
              className="mb-4 rounded-xl"
            />
          )}

          {/* Target List */}
          <div className="space-y-3">
            {targets.map((target, index) => (
              <Card
                key={target.id}
                type="inner"
                className="border-l-4  border-l-blue-500"
                title={
                  <div className="flex items-center gap-2">
                    <span className="text-base font-semibold">#{index + 1}</span>
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
                      onClick={() => duplicateTarget(target)}
                    />
                    <Button
                      size="small"
                      danger
                      icon={<Trash2 size={14} />}
                      onClick={() => removeTarget(target.id)}
                    />
                  </Space>
                }
              >
                <div className="space-y-3">
                  {/* Row 1: Title & Category */}
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      placeholder="Tên mục tiêu *"
                      value={target.title}
                      onChange={(e) => updateTarget(target.id, 'title', e.target.value)}
                      maxLength={200}
                      size="large"
                      className="font-medium"
                    />
                    <Select
                      placeholder="Danh mục *"
                      value={target.category}
                      onChange={(value) => updateTarget(target.id, 'category', value)}
                      size="large"
                    >
                      <Option value="Doanh số">Doanh số</Option>
                      <Option value="Chất lượng">Chất lượng</Option>
                      <Option value="Hiệu suất">Hiệu suất</Option>
                      <Option value="Phát triển">Phát triển</Option>
                      <Option value="Quản lý">Quản lý</Option>
                      <Option value="Khác">Khác</Option>
                    </Select>
                  </div>

                  {/* Row 2: Key Metrics - Highlighted */}
                  <div className="grid grid-cols-3 gap-3 bg-blue-50 p-3 rounded-lg border border-blue-200">
                    <div>
                      <label className="block text-xs font-semibold text-blue-900 mb-1">
                        TRỌNG SỐ (%) *
                      </label>
                      <InputNumber
                        min={5}
                        max={50}
                        value={target.weight}
                        onChange={(value) => updateTarget(target.id, 'weight', value || 0)}
                        className="w-full"
                        size="large"
                        suffix="%"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-blue-900 mb-1">
                        CHỈ TIÊU *
                      </label>
                      <Input
                        value={target.target}
                        onChange={(e) => updateTarget(target.id, 'target', e.target.value)}
                        size="large"
                        className="font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-blue-900 mb-1">
                        ĐƠN VỊ *
                      </label>
                      <Input
                        value={target.unit}
                        onChange={(e) => updateTarget(target.id, 'unit', e.target.value)}
                        placeholder="VNĐ, %, số..."
                        size="large"
                      />
                    </div>
                  </div>

                  {/* Row 3: Description */}
                  <TextArea
                    placeholder="Mô tả chi tiết mục tiêu *"
                    value={target.description}
                    onChange={(e) => updateTarget(target.id, 'description', e.target.value)}
                    rows={2}
                          maxLength={5000}
                  />

                  {/* Row 4: Optional Fields - Collapsed */}
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      placeholder="Phương pháp đo lường "
                      value={target.measurementMethod}
                      onChange={(e) => updateTarget(target.id, 'measurementMethod', e.target.value)}
                      size="middle"
                    />
                    <Input
                      placeholder="Tiêu chí đánh giá "
                      value={target.evaluationCriteria}
                      onChange={(e) => updateTarget(target.id, 'evaluationCriteria', e.target.value)}
                      size="middle"
                    />
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <Divider />

          <Button
            type="dashed"
            icon={<Plus size={16} />}
            onClick={addTarget}
            block
            size="large"
            disabled={!hasMaxTargets}
          >
            Thêm mục tiêu mới
          </Button>
        </Card>

        {/* Actions */}
        <Card className="shadow-sm">
          <div className="flex justify-between items-center">
            <Button
              size="middle"
              onClick={() => navigate('/kpi')}
            >
              Hủy
            </Button>

            <Space>
              <Button
                size="middle"
                icon={<Save size={16} />}
                onClick={() => form.validateFields().then(saveDraft)}
                loading={loading}
                disabled={targets.length === 0}
              >
                Lưu 
              </Button>

              <Button
                size="middle"
                icon={<Eye size={16} />}
                onClick={() => setPreviewVisible(true)}
                disabled={targets.length === 0}
              >
                Xem trước
              </Button>

              <Button
                type="primary"
                size="middle"
                icon={<Send size={16} />}
                onClick={() => form.validateFields().then(submitForApproval)}
                loading={loading}
                className="bg-primary hover:bg-primary-dark"
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
        width={800}
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
            <h3 className="font-semibold mb-2">Danh sách mục tiêu ({targets.length})</h3>
            {targets.map((target, index) => (
              <Card key={target.id} type="inner" className="mb-2">
                <h4 className="font-semibold">
                  {index + 1}. {target.title} ({target.weight}%)
                </h4>
                <p className="text-gray-600">{target.description}</p>
                <p>
                  <strong>Chỉ tiêu:</strong> {target.target} {target.unit}
                </p>
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
