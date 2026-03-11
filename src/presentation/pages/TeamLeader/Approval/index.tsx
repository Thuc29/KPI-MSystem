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
  Alert,
  Image,
  Collapse,
  Descriptions
} from 'antd';
import { 
  CheckCircle, 
  XCircle, 
  Eye, 
  Clock,
  FileText,
  AlertCircle,
  File,
  Paperclip,
  ChevronDown
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { kpiApi } from '../../../../infrastructure/api';
import { storage } from '../../../../infrastructure/utils';
import { KPIStatusTag } from '../../../components';
import type { IKPIRecord, IKPITarget } from '../../../../core/models';
import type { ColumnsType } from 'antd/es/table';

const { TextArea } = Input;
const { Panel } = Collapse;

export const ApprovalPage = () => {
  const navigate = useNavigate();
  const [kpiList, setKpiList] = useState<IKPIRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedKPI, setSelectedKPI] = useState<IKPIRecord | null>(null);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [approveModalVisible, setApproveModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
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

  // Handle image preview
  const handlePreview = (imageUrl: string) => {
    setPreviewImage(imageUrl);
    setPreviewOpen(true);
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
    if (days >= 2) return { color: 'red', icon: <AlertCircle size={20} className="text-red-500" />, text: 'Khẩn cấp' };
    if (days >= 1) return { color: 'orange', icon: <Clock size={20} className="text-orange-500" />, text: 'Ưu tiên' };
    return { color: 'green', icon: <CheckCircle size={20} className="text-green-500" />, text: 'Mới' };
  };

  // Columns for pending table
  const pendingColumns: ColumnsType<IKPIRecord> = [
    {
      title: 'Ưu tiên',
      key: 'priority',
      width: 90,
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
      width: 200
    },
    {
      title: 'Năm/Kỳ',
      key: 'period',
      width: 75,
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
      width: 100,
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
      width: 110,
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
      width: 95,
      render: (_, record) => {
        const days = getDaysSinceSubmit(record.submittedAt);
        return (
          <div className="text-gray-600 text-sm">
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
              className='rounded-lg'
            />
          </Tooltip>
          <Button
            type="primary"
            size="small"
            icon={<CheckCircle size={14} />}
            onClick={() => showApproveModal(record)}
            className="bg-primary hover:bg-primary-dark rounded-lg"
          >
            Duyệt
          </Button>
          <Button
            danger
            size="small"
            icon={<XCircle size={14} />}
            onClick={() => showRejectModal(record)}
            className='rounded-lg'
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
                  scroll={{ x: 1150 }}
                  pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showTotal: (total) => `Tổng ${total} hồ sơ`,
                  }}
                  bordered
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
                  bordered
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
            <FileText size={20} className="text-primary" />
            <span>Chi tiết KPI - {selectedKPI?.id}</span>
          </div>
        }
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={
          <Space>
           
            {selectedKPI?.status === 'pending_approval' && (
              <>
                <Button
                  type="primary"
                  icon={<CheckCircle size={16} />}
                  onClick={() => {
                    setDetailModalVisible(false);
                    showApproveModal(selectedKPI);
                  }}
                  className="bg-primary hover:bg-primary-dark rounded-lg"
                >
                  Phê duyệt
                </Button>
                <Button
                  danger
                  icon={<XCircle size={16} />}
                  onClick={() => {
                    setDetailModalVisible(false);
                    showRejectModal(selectedKPI);
                  }}
                  className='rounded-lg'
                >
                  Từ chối
                </Button>
              </>
            )}
          </Space>
        }
        width={900}
        className="kpi-detail-modal"
      >
        {selectedKPI && (
          <div className="space-y-2">
            {/* Basic Info */}
            <Card size="small" className="bg-gray-50">
              <Descriptions column={2} size="small">
                <Descriptions.Item label="Nhân viên">
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
                  <Tag color={selectedKPI.targets.reduce((sum, t) => sum + t.weight, 0) === 100 ? 'success' : 'error'} className="text-base rounded-lg font-bold">
                    {selectedKPI.targets.reduce((sum, t) => sum + t.weight, 0)}%
                  </Tag>
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* Targets List */}
            <div className="border-t pt-2">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-lg">
                  Danh sách mục tiêu ({selectedKPI.targets.length})
                </h4>
                <Tag color="blue" className='flex items-center gap-1 rounded-lg' icon={<FileText size={14} /> }>
                  {selectedKPI.targets.length} mục tiêu
                </Tag>
              </div>

              {selectedKPI.groups && selectedKPI.groups.length > 0 ? (
                // Display grouped structure
                <Collapse
                  expandIcon={({ isActive }) => (
                    <ChevronDown 
                      size={18} 
                      className={`transition-transform ${isActive ? 'rotate-180' : ''}`} 
                    />
                  )}
                  defaultActiveKey={selectedKPI.groups.map(g => g.id)}
                  className="mb-3"
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
                            onPreview={handlePreview}
                          />
                        ))}
                      </Panel>
                    );
                  })}
                </Collapse>
              ) : (
                // Display flat list
                selectedKPI.targets.map((target, index) => (
                  <TargetDetailCard 
                    key={target.id} 
                    target={target} 
                    index={index}
                    onPreview={handlePreview}
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

      {/* Image Preview Modal */}
      <Modal
        open={previewOpen}
        title="Xem trước file"
        footer={null}
        onCancel={() => setPreviewOpen(false)}
        width={800}
      >
        <img alt="preview" style={{ width: '100%' }} src={previewImage} />
      </Modal>
    </div>
  );
};

// Target Detail Card Component
interface TargetDetailCardProps {
  target: IKPITarget;
  index: number;
  onPreview: (url: string) => void;
}

const TargetDetailCard = ({ target, index, onPreview }: TargetDetailCardProps) => {
  return (
    <Card type="inner" className="mb-3 shadow-sm hover:shadow-md transition-shadow">
      <div className="space-y-2">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="border-primary border text-primary rounded-full w-5 h-5 flex items-center justify-center text-sm font-semibold">
                {index + 1}
              </span>
              <h5 className="font-semibold text-base">{target.title}</h5>
              {target.category && (
                <Tag color="blue" className="rounded-lg">{target.category}</Tag>
              )}
            </div>
          </div>
          <Tag color="green" className="text-base font-semibold rounded-lg">
            {target.weight}%
          </Tag>
        </div>

        {/* Description */}
        <div className="bg-gray-100 py-1 px-3 rounded-lg">
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{target.description}</p>
        </div>

        {/* Target & Unit */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-blue-50 px-3 py-2 text-sm gap-2 flex items-center rounded-lg">
            <p className=" text-gray-600">Chỉ tiêu: </p>
            <p className=" font-bold text-blue-600">
              {target.target} {target.unit}
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
                        <Tooltip title={file.fileName}>
                          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white text-xs p-1 truncate rounded-b">
                            {file.fileName}
                          </div>
                        </Tooltip>
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
