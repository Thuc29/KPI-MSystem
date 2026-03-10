import { useEffect, useState } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Tabs, 
  Modal, 
  Form, 
  Input,
  Tag,
  Space,
  Badge,
  Tooltip,
  Alert
} from 'antd';
import { 
  CheckCircle, 
  XCircle, 
  Eye, 
  Clock,
  FileText,
  AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { kpiApi } from '../../../infrastructure/api';
import { storage } from '../../../infrastructure/utils';
import { KPIStatusTag } from '../../components';
import type { IKPIRecord } from '../../../core/models';
import type { ColumnsType } from 'antd/es/table';

const { TextArea } = Input;

export const ApprovalPage = () => {
  const navigate = useNavigate();
  const [kpiList, setKpiList] = useState<IKPIRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedKPI, setSelectedKPI] = useState<IKPIRecord | null>(null);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [approveModalVisible, setApproveModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [form] = Form.useForm();

  const userRole = storage.getUserRole() || 'tl';

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

  // Filter KPIs based on role
  const getPendingKPIs = () => {
    switch (userRole) {
      case 'tl':
      case 'gl':
      case 'ceo':
        // Manager sees all pending KPIs for their department
        return kpiList.filter(k => k.status === 'pending_approval');
      default:
        return [];
    }
  };

  const getApprovedKPIs = () => {
    return kpiList.filter(k => k.status === 'in_progress' || k.status === 'completed');
  };

  const getRejectedKPIs = () => {
    return kpiList.filter(k => k.status === 'rejected');
  };

  const pendingKPIs = getPendingKPIs();
  const approvedKPIs = getApprovedKPIs();
  const rejectedKPIs = getRejectedKPIs();

  // Handle approve
  const handleApprove = async () => {
    if (!selectedKPI) return;

    try {
      await kpiApi.approve(selectedKPI.id);
      
      toast.success('Đã phê duyệt KPI');
      setApproveModalVisible(false);
      setSelectedKPI(null);
      fetchKPIList();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Không thể phê duyệt KPI');
    }
  };

  // Handle reject
  const handleReject = async (values: { reason: string }) => {
    if (!selectedKPI) return;

    try {
      await kpiApi.reject(selectedKPI.id, values.reason);
      
      toast.success('Đã từ chối KPI');
      setRejectModalVisible(false);
      setSelectedKPI(null);
      form.resetFields();
      fetchKPIList();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Không thể từ chối KPI');
    }
  };

  // Show detail modal
  const showDetail = (record: IKPIRecord) => {
    setSelectedKPI(record);
    setDetailModalVisible(true);
  };

  // Show approve modal
  const showApproveModal = (record: IKPIRecord) => {
    setSelectedKPI(record);
    setApproveModalVisible(true);
  };

  // Show reject modal
  const showRejectModal = (record: IKPIRecord) => {
    setSelectedKPI(record);
    setRejectModalVisible(true);
  };

  // Calculate days since submission
  const getDaysSinceSubmit = (submittedAt?: string) => {
    if (!submittedAt) return 0;
    const days = Math.floor((Date.now() - new Date(submittedAt).getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  // Get priority indicator
  const getPriorityIndicator = (days: number) => {
    if (days >= 2) return { color: 'red', icon: '🔴', text: 'Khẩn cấp' };
    if (days >= 1) return { color: 'orange', icon: '🟡', text: 'Ưu tiên' };
    return { color: 'green', icon: '🟢', text: 'Mới' };
  };

  // Columns for pending table
  const pendingColumns: ColumnsType<IKPIRecord> = [
    {
      title: 'Ưu tiên',
      key: 'priority',
      width: 95,
      align: 'center',
      render: (_, record) => {
        const days = getDaysSinceSubmit(record.submittedAt);
        const priority = getPriorityIndicator(days);
        return (
          <Tooltip title={`${priority.text} - ${days} ngày trước`}>
            <div className="text-2xl">{priority.icon}</div>
          </Tooltip>
        );
      },
      sorter: (a, b) => 
        getDaysSinceSubmit(b.submittedAt) - getDaysSinceSubmit(a.submittedAt),
    },
    {
      title: 'Mã KPI',
      dataIndex: 'id',
      key: 'id',
      width: 150,
      render: (text) => (
        <span className="font-mono text-sm font-semibold text-primary">{text}</span>
      ),
    },
    {
      title: 'Nhân viên',
      dataIndex: 'employeeName',
      key: 'employeeName',
      render: (text, record) => (
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-blue-600 font-semibold text-xs">
                {text.charAt(0)}
              </span>
            </div>
            <div>
              <div className="font-medium">{text}</div>
              <div className="text-xs text-gray-500">{record.department}</div>
            </div>
          </div>
        </div>
      ),
      width: 250
    },
    {
      title: 'Năm/Kỳ',
      key: 'period',
      width: 80,
      render: (_, record) => (
        <div>
          <div className="font-semibold">{record.year}</div>
          {record.quarter && (
            <Tag color="blue" className="mt-1">Q{record.quarter}</Tag>
          )}
        </div>
      ),
    },
    {
      title: 'Số mục tiêu',
      key: 'targets',
      width: 120,
      align: 'center',
      render: (_, record) => (
        <Badge count={record.targets.length} showZero color="#4C9C2E">
          <FileText size={20} className="text-gray-400" />
        </Badge>
      ),
    },
    {
      title: 'Tổng trọng số',
      key: 'weight',
      width: 120,
      align: 'center',
      render: (_, record) => {
        const totalWeight = record.targets.reduce((sum, t) => sum + t.weight, 0);
        const isValid = totalWeight === 100;
        return (
          <Tag color={isValid ? 'success' : 'error'}>
            {totalWeight}%
          </Tag>
        );
      },
    },
    {
      title: 'Ngày gửi',
      key: 'submittedAt',
      width: 120,
      render: (_, record) => {
        const days = getDaysSinceSubmit(record.submittedAt);
        return (
          <div className="text-gray-600">
            {days === 0 ? 'Hôm nay' : `${days} ngày trước`}
          </div>
        );
      },
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 200,
      align: 'center',
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button
              size="small"
              icon={<Eye size={14} />}
              onClick={() => showDetail(record)}
            />
          </Tooltip>
          <Button
            type="primary"
            size="small"
            icon={<CheckCircle size={14} />}
            onClick={() => showApproveModal(record)}
            className="bg-primary hover:bg-primary-dark"
          >
            Duyệt
          </Button>
          <Button
            danger
            size="small"
            icon={<XCircle size={14} />}
            onClick={() => showRejectModal(record)}
          >
            Từ chối
          </Button>
        </Space>
      ),
    },
  ];

  // Columns for approved/rejected table
  const historyColumns: ColumnsType<IKPIRecord> = [
    {
      title: 'Mã KPI',
      dataIndex: 'id',
      key: 'id',
      width: 150,
      render: (text) => (
        <span className="font-mono text-sm font-semibold text-primary">{text}</span>
      ),
    },
    {
      title: 'Nhân viên',
      dataIndex: 'employeeName',
      key: 'employeeName',
      render: (text, record) => (
        <div>
          <div className="font-medium">{text}</div>
          <div className="text-xs text-gray-500">{record.department}</div>
        </div>
      ),
    },
    {
      title: 'Năm',
      dataIndex: 'year',
      key: 'year',
      width: 100,
    },
    {
      title: 'Số mục tiêu',
      key: 'targets',
      width: 120,
      align: 'center',
      render: (_, record) => (
        <Tag color="blue">{record.targets.length} mục tiêu</Tag>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 150,
      render: (status) => <KPIStatusTag status={status} />,
    },
    {
      title: 'Ngày cập nhật',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 150,
      render: (date) => new Date(date).toLocaleDateString('vi-VN'),
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 120,
      align: 'center',
      render: (_, record) => (
        <Button
          size="small"
          icon={<Eye size={14} />}
          onClick={() => navigate(`/kpi/${record.id}`)}
        >
          Xem
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Duyệt KPI</h1>
          <p className="text-gray-500">Phê duyệt và quản lý KPI của nhân viên</p>
        </div>
        
      </div>

      {/* Tabs */}
      <Card className="shadow-md">
        <Tabs
          defaultActiveKey="pending"
          items={[
            {
              key: 'pending',
              label: (
                <span className="flex items-center gap-2">
                  <Clock size={16} />
                  Chờ duyệt
                  <Badge count={pendingKPIs.length} showZero />
                </span>
              ),
              children: (
                <Table
                  columns={pendingColumns}
                  dataSource={pendingKPIs}
                  loading={loading}
                  rowKey="id"
                  scroll={{ x: 1200 }}
                  pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showTotal: (total) => `Tổng ${total} hồ sơ`,
                  }}
                  className='border'
                />
              ),
            },
            {
              key: 'approved',
              label: (
                <span className="flex items-center gap-2">
                  <CheckCircle size={16} />
                  Đã duyệt
                  <Badge count={approvedKPIs.length} showZero color="green" />
                </span>
              ),
              children: (
                <Table
                  columns={historyColumns}
                  dataSource={approvedKPIs}
                  loading={loading}
                  rowKey="id"
                  pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showTotal: (total) => `Tổng ${total} hồ sơ`,
                  }}
                />
              ),
            },
            {
              key: 'rejected',
              label: (
                <span className="flex items-center gap-2">
                  <XCircle size={16} />
                  Đã từ chối
                  <Badge count={rejectedKPIs.length} showZero color="red" />
                </span>
              ),
              children: (
                <Table
                  columns={historyColumns}
                  dataSource={rejectedKPIs}
                  loading={loading}
                  rowKey="id"
                  pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showTotal: (total) => `Tổng ${total} hồ sơ`,
                  }}
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
            <FileText size={20} className="text-primary" />
            <span>Chi tiết KPI</span>
          </div>
        }
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedKPI && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-gray-500 text-sm">Nhân viên</label>
                <div className="font-semibold">{selectedKPI.employeeName}</div>
              </div>
              <div>
                <label className="text-gray-500 text-sm">Phòng ban</label>
                <div className="font-semibold">{selectedKPI.department}</div>
              </div>
              <div>
                <label className="text-gray-500 text-sm">Năm</label>
                <div className="font-semibold">{selectedKPI.year}</div>
              </div>
              <div>
                <label className="text-gray-500 text-sm">Trạng thái</label>
                <div><KPIStatusTag status={selectedKPI.status} /></div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-semibold mb-3">Danh sách mục tiêu ({selectedKPI.targets.length})</h4>
              {selectedKPI.targets.map((target, index) => (
                <Card key={target.id} type="inner" className="mb-2">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h5 className="font-semibold mb-1">
                        {index + 1}. {target.title}
                      </h5>
                      <p className="text-gray-600 text-sm mb-2">{target.description}</p>
                      <div className="flex gap-4 text-sm">
                        <span>
                          <strong>Chỉ tiêu:</strong> {target.target} {target.unit}
                        </span>
                        {target.category && (
                          <Tag color="blue">{target.category}</Tag>
                        )}
                      </div>
                    </div>
                    <Tag color="green" className="text-lg font-bold">
                      {target.weight}%
                    </Tag>
                  </div>
                </Card>
              ))}
            </div>

            <div className="border-t pt-4 text-center">
              <p className="text-lg">
                <strong>Tổng trọng số:</strong>{' '}
                <span className="text-green-600 text-2xl font-bold">
                  {selectedKPI.targets.reduce((sum, t) => sum + t.weight, 0)}%
                </span>
              </p>
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
        onOk={handleApprove}
        onCancel={() => setApproveModalVisible(false)}
        okText="Phê duyệt"
        cancelText="Hủy"
        okButtonProps={{ className: 'bg-primary hover:bg-primary-dark' }}
      >
        {selectedKPI && (
          <div className="space-y-4">
            <Alert
              message="Bạn có chắc chắn muốn phê duyệt KPI này?"
              description={
                <div className="mt-2">
                  <p><strong>Nhân viên:</strong> {selectedKPI.employeeName}</p>
                  <p><strong>Năm:</strong> {selectedKPI.year}</p>
                  <p><strong>Số mục tiêu:</strong> {selectedKPI.targets.length}</p>
                </div>
              }
              type="info"
              showIcon
              icon={<AlertCircle size={20} />}
            />
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
          <Form form={form} layout="vertical" onFinish={handleReject}>
            <div className="mb-4">
              <p><strong>Nhân viên:</strong> {selectedKPI.employeeName}</p>
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
                placeholder="Nhập lý do từ chối chi tiết để nhân viên có thể chỉnh sửa..."
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
