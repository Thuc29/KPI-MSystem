import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Steps, Button, Table, Modal, Form, Input, InputNumber, Space, Popconfirm } from 'antd';
import { Plus, Trash2, Save, Send, Check, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { kpiApi } from '../../../infrastructure/api';
import { storage, calculateTotalWeight, isWeightValid, getCurrentStep } from '../../../infrastructure/utils';
import { APPROVAL_STEPS } from '../../../core/constants';
import type { IKPIRecord, IKPITarget, KPITargetFormValues, RejectFormValues, IBackendRes } from '../../../core/models';
import type { ColumnsType } from 'antd/es/table';

const { TextArea } = Input;

export const KPIDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [kpi, setKpi] = useState<IKPIRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [rejectForm] = Form.useForm();
  
  const userRole = storage.getUserRole() || 'employee';

  useEffect(() => {
    if (id) {
      fetchKPIDetail();
    }
  }, [id]);

  const fetchKPIDetail = async () => {
    setLoading(true);
    try {
      const response = await kpiApi.getById(id!);
      const backendRes = response.data as unknown as IBackendRes<IKPIRecord>;
      if (backendRes.data) {
        setKpi(backendRes.data);
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Không thể tải thông tin KPI');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTarget = () => {
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleSaveTarget = async (values: KPITargetFormValues) => {
    if (!kpi) return;

    const newTarget: IKPITarget = {
      id: Date.now().toString(),
      ...values,
    };

    const updatedTargets = [...kpi.targets, newTarget];
    
    try {
      await kpiApi.update(kpi.id, { targets: updatedTargets });
      setKpi({ ...kpi, targets: updatedTargets });
      toast.success('Đã thêm mục tiêu');
      setIsModalOpen(false);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Không thể thêm mục tiêu');
    }
  };

  const handleDeleteTarget = async (targetId: string) => {
    if (!kpi) return;

    const updatedTargets = kpi.targets.filter(t => t.id !== targetId);
    
    try {
      await kpiApi.update(kpi.id, { targets: updatedTargets });
      setKpi({ ...kpi, targets: updatedTargets });
      toast.success('Đã xóa mục tiêu');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Không thể xóa mục tiêu');
    }
  };

  const handleSubmit = async () => {
    if (!kpi) return;

    if (!isWeightValid(kpi.targets)) {
      toast.error('Tổng trọng số phải bằng 100%');
      return;
    }

    try {
      await kpiApi.submit(kpi.id);
      toast.success('Đã gửi hồ sơ KPI');
      fetchKPIDetail();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Không thể gửi hồ sơ');
    }
  };

  const handleApprove = async () => {
    if (!kpi) return;

    try {
      await kpiApi.approve(kpi.id);
      toast.success('Đã phê duyệt hồ sơ KPI');
      fetchKPIDetail();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Không thể phê duyệt');
    }
  };

  const handleReject = async (values: RejectFormValues) => {
    if (!kpi) return;

    try {
      await kpiApi.reject(kpi.id, values.reason);
      toast.success('Đã từ chối hồ sơ KPI');
      setIsRejectModalOpen(false);
      fetchKPIDetail();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Không thể từ chối');
    }
  };

  const canEdit = kpi?.status === 'draft' && userRole === 'employee';
  const canApprove = 
    (kpi?.status === 'pending_manager' && userRole === 'manager') ||
    (kpi?.status === 'pending_hr' && userRole === 'hr') ||
    (kpi?.status === 'pending_ceo' && userRole === 'ceo');

  const totalWeight = kpi ? calculateTotalWeight(kpi.targets) : 0;
  const weightPercent = totalWeight; // for progress bar animation

  const columns: ColumnsType<IKPITarget> = [
    {
      title: 'Mục tiêu',
      dataIndex: 'title',
      key: 'title',
      width: '25%',
    },
    {
      title: 'Chi tiết kế hoạch',
      dataIndex: 'description',
      key: 'description',
      width: '35%',
    },
    {
      title: 'Trọng số (%)',
      dataIndex: 'weight',
      key: 'weight',
      width: '15%',
    },
    {
      title: 'Chỉ tiêu',
      key: 'target',
      width: '15%',
      render: (_, record) => (
        <span>
          {record.target} {record.unit}
        </span>
      ),
    },
    ...(canEdit ? [{
      title: 'Hành động',
      key: 'action',
      width: '10%',
      render: (_: any, record: IKPITarget) => (
        <Popconfirm
          title="Xóa mục tiêu này?"
          onConfirm={() => handleDeleteTarget(record.id)}
          okText="Xóa"
          cancelText="Hủy"
        >
          <Button type="link" danger icon={<Trash2 size={16} />} />
        </Popconfirm>
      ),
    }] : []),
  ];

  if (loading || !kpi) {
    return <div className="p-6">Đang tải...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto">
      <Card className="mb-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-primary mb-2">Hồ sơ KPI: {kpi.id}</h1>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div><span className="font-semibold">Nhân viên:</span> {kpi.employeeName}</div>
            <div><span className="font-semibold">Phòng ban:</span> {kpi.department}</div>
            <div><span className="font-semibold">Năm:</span> {kpi.year}</div>
            <div>
              <span className="font-semibold">Tổng trọng số:</span>{' '}
              <span className={totalWeight === 100 ? 'text-green-600' : 'text-red-600'}>
                {totalWeight}%
              </span>
            </div>
          </div>

          {/* Weight progress bar */}
          <div className="mt-4">
            <div className="text-sm font-medium text-gray-700 mb-2">Phần trăm trọng số</div>
            <div className="relative bg-gray-200 rounded-full h-3 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${weightPercent}%` }}
                transition={{ duration: 0.6 }}
                className="bg-green-500 h-full"
              />
            </div>
            <div className="flex justify-between mt-1 text-xs text-gray-600">
              <div className="flex items-center gap-1"><span className="w-2 h-2 bg-green-500 rounded-full"></span> Phân bổ</div>
              <div className="flex items-center gap-1"><span className="w-2 h-2 bg-gray-300 rounded-full"></span> Còn lại</div>
            </div>
          </div>
        </div>

        <Steps current={getCurrentStep(kpi.status)} items={APPROVAL_STEPS} />
      </Card>

      <Card
        title="Danh sách mục tiêu KPI"
        extra={
          canEdit && (
            <Button
              type="primary"
              icon={<Plus size={18} />}
              onClick={handleAddTarget}
              className="bg-primary"
            >
              Thêm mục tiêu
            </Button>
          )
        }
      >
        <Table
          columns={columns}
          dataSource={kpi.targets}
          rowKey="id"
          pagination={false}
        />

        <div className="mt-6 flex justify-end gap-4">
          {canEdit && (
            <Button
              type="primary"
              icon={<Send size={18} />}
              onClick={handleSubmit}
              disabled={!isWeightValid(kpi.targets)}
              className="bg-primary"
            >
              Gửi hồ sơ
            </Button>
          )}

          {canApprove && (
            <Space>
              <Button
                type="primary"
                icon={<Check size={18} />}
                onClick={handleApprove}
                className="bg-green-600 hover:bg-green-700"
              >
                Phê duyệt
              </Button>
              <Button
                danger
                icon={<X size={18} />}
                onClick={() => setIsRejectModalOpen(true)}
              >
                Từ chối
              </Button>
            </Space>
          )}
        </div>
      </Card>

      <Modal
        title="Thêm mục tiêu KPI"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleSaveTarget}>
          <Form.Item
            name="title"
            label="Tiêu đề mục tiêu"
            rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}
          >
            <Input placeholder="VD: Đạt doanh số cá nhân quý & năm" className="bg-gray-50 rounded-xl" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Chi tiết kế hoạch"
            rules={[{ required: true, message: 'Vui lòng nhập chi tiết' }]}
          >
            <TextArea rows={4} placeholder="Mô tả chi tiết kế hoạch thực hiện" className="bg-gray-50 rounded-xl" />
          </Form.Item>

          <Form.Item
            name="weight"
            label="Trọng số (%)"
            rules={[{ required: true, message: 'Vui lòng nhập trọng số' }]}
          >
            <InputNumber min={0} max={100} className="w-full bg-gray-50 rounded-xl" />
          </Form.Item>

          <Form.Item
            name="target"
            label="Chỉ tiêu"
            rules={[{ required: true, message: 'Vui lòng nhập chỉ tiêu' }]}
          >
            <Input placeholder="VD: 500 triệu" className="bg-gray-50 rounded-xl" />
          </Form.Item>

          <Form.Item
            name="unit"
            label="Đơn vị"
            rules={[{ required: true, message: 'Vui lòng nhập đơn vị' }]}
          >
            <Input placeholder="VD: VNĐ, %, số lượng" className="bg-gray-50 rounded-xl" />
          </Form.Item>

          <Form.Item>
            <Space className="w-full justify-end">
              <Button onClick={() => setIsModalOpen(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit" icon={<Save size={16} />}>
                Lưu
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Từ chối hồ sơ KPI"
        open={isRejectModalOpen}
        onCancel={() => setIsRejectModalOpen(false)}
        footer={null}
      >
        <Form form={rejectForm} layout="vertical" onFinish={handleReject}>
          <Form.Item
            name="reason"
            label="Lý do từ chối"
            rules={[{ required: true, message: 'Vui lòng nhập lý do' }]}
          >
            <TextArea rows={4} placeholder="Nhập lý do từ chối hồ sơ" className="bg-gray-50 rounded-xl" />
          </Form.Item>

          <Form.Item>
            <Space className="w-full justify-end">
              <Button onClick={() => setIsRejectModalOpen(false)}>Hủy</Button>
              <Button type="primary" danger htmlType="submit">
                Xác nhận từ chối
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
