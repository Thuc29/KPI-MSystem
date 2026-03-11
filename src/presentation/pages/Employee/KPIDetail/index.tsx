import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Steps, Button, Table, Modal, Form, Input, InputNumber, Space, Popconfirm, Collapse, Tag, Upload, Image, message, Select } from 'antd';
import type { UploadFile, UploadProps } from 'antd';
import { Plus, Trash2, Save, Send, Check, X, Edit, ChevronDown, FolderOpen, Upload as UploadIcon, File } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { kpiApi } from '../../../../infrastructure/api';
import { storage, calculateTotalWeight, isWeightValid, getCurrentStep } from '../../../../infrastructure/utils';
import { APPROVAL_STEPS } from '../../../../core/constants';
import type { IKPIRecord, IKPITarget, KPITargetFormValues, RejectFormValues, IBackendRes } from '../../../../core/models';
import type { ColumnsType } from 'antd/es/table';

const { TextArea } = Input;
const { Panel } = Collapse;
const { Option } = Select;

export const KPIDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [kpi, setKpi] = useState<IKPIRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTarget, setEditingTarget] = useState<IKPITarget | null>(null);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [editFileList, setEditFileList] = useState<UploadFile[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [rejectForm] = Form.useForm();
  
  const userRole = storage.getUserRole() || 'employee';
  const userId = storage.getUserId();

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

  // File upload handlers
  const handleUploadChange: UploadProps['onChange'] = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  const handleEditUploadChange: UploadProps['onChange'] = ({ fileList: newFileList }) => {
    setEditFileList(newFileList);
  };

  const handlePreview = async (file: UploadFile) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj as File);
    }
    setPreviewImage(file.url || (file.preview as string));
    setPreviewOpen(true);
  };

  const getBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });

  const beforeUpload = (file: File) => {
    const isImage = file.type.startsWith('image/');
    const isPDF = file.type === 'application/pdf';
    const isDoc = file.type === 'application/msword' || 
                  file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    const isExcel = file.type === 'application/vnd.ms-excel' || 
                    file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    
    const isValidType = isImage || isPDF || isDoc || isExcel;
    if (!isValidType) {
      message.error('Chỉ hỗ trợ file ảnh, PDF, Word, Excel!');
      return Upload.LIST_IGNORE;
    }

    const isLt10M = file.size / 1024 / 1024 < 10;
    if (!isLt10M) {
      message.error('File phải nhỏ hơn 10MB!');
      return Upload.LIST_IGNORE;
    }

    return false; // Prevent auto upload
  };

  const handleAddTarget = () => {
    form.resetFields();
    setFileList([]);
    setIsModalOpen(true);
  };

  const handleEditTargetModal = (target: IKPITarget) => {
    setEditingTarget(target);
    editForm.setFieldsValue(target);
    
    // Load existing files if any
    if (target.attachments && target.attachments.length > 0) {
      const existingFiles: UploadFile[] = target.attachments.map((file, index) => ({
        uid: file.id || `${index}`,
        name: file.fileName,
        status: 'done',
        url: file.fileUrl,
        size: file.fileSize,
      }));
      setEditFileList(existingFiles);
    } else {
      setEditFileList([]);
    }
    
    setIsEditModalOpen(true);
  };

  const handleSaveTarget = async (values: KPITargetFormValues) => {
    if (!kpi) return;

    // Convert files to attachments
    const attachments = await Promise.all(
      fileList.map(async (file) => ({
        id: `file-${Date.now()}-${Math.random()}`,
        fileName: file.name,
        fileUrl: file.url || (await getBase64(file.originFileObj as File)),
        fileSize: file.size || 0,
        uploadedAt: new Date().toISOString(),
      }))
    );

    const newTarget: IKPITarget = {
      id: Date.now().toString(),
      ...values,
      attachments: attachments.length > 0 ? attachments : undefined,
    };

    const updatedTargets = [...kpi.targets, newTarget];
    
    try {
      await kpiApi.update(kpi.id, { targets: updatedTargets });
      setKpi({ ...kpi, targets: updatedTargets });
      toast.success('Đã thêm mục tiêu');
      setIsModalOpen(false);
      setFileList([]);
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

  const handleEditTarget = async (values: KPITargetFormValues) => {
    if (!kpi || !editingTarget) return;
    
    // Convert files to attachments
    const attachments = await Promise.all(
      editFileList.map(async (file) => {
        // If file already has url, it's an existing file
        if (file.url && file.status === 'done') {
          return {
            id: file.uid,
            fileName: file.name,
            fileUrl: file.url,
            fileSize: file.size || 0,
            uploadedAt: new Date().toISOString(),
          };
        }
        // New file
        return {
          id: `file-${Date.now()}-${Math.random()}`,
          fileName: file.name,
          fileUrl: await getBase64(file.originFileObj as File),
          fileSize: file.size || 0,
          uploadedAt: new Date().toISOString(),
        };
      })
    );

    const updatedTargets = kpi.targets.map(t =>
      t.id === editingTarget.id 
        ? { ...t, ...values, attachments: attachments.length > 0 ? attachments : undefined } 
        : t
    );
    
    try {
      await kpiApi.update(kpi.id, { targets: updatedTargets });
      setKpi({ ...kpi, targets: updatedTargets });
      toast.success('Đã cập nhật mục tiêu');
      setIsEditModalOpen(false);
      setEditingTarget(null);
      setEditFileList([]);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Không thể cập nhật mục tiêu');
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

  const canEdit = kpi?.status === 'draft' && (userRole === 'employee' || userRole === 'tl') && kpi?.employeeId === userId;
  const canApprove = kpi?.status === 'pending_approval' && userRole !== 'employee' && kpi?.employeeId !== userId;

  const totalWeight = kpi ? calculateTotalWeight(kpi.targets) : 0;
  const weightPercent = totalWeight; // for progress bar animation

  const columns: ColumnsType<IKPITarget> = [
    {
      title: 'Mục tiêu',
      dataIndex: 'title',
      key: 'title',
      width: '20%',
    },
    {
      title: 'Chi tiết kế hoạch',
      dataIndex: 'description',
      key: 'description',
      width: '25%',
    },
    {
      title: 'Trọng số (%)',
      dataIndex: 'weight',
      key: 'weight',
      width: '10%',
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
    {
      title: 'File đính kèm',
      key: 'attachments',
      width: '15%',
      render: (_, record) => (
        record.attachments && record.attachments.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {record.attachments.map((file) => {
              const isImage = file.fileName.match(/\.(jpg|jpeg|png|gif|webp)$/i);
              return (
                <div key={file.id}>
                  {isImage ? (
                    <Image
                      src={file.fileUrl}
                      alt={file.fileName}
                      width={40}
                      height={40}
                      className="rounded border object-cover cursor-pointer"
                    />
                  ) : (
                    <a
                      href={file.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded border hover:bg-gray-200 text-xs"
                    >
                      <File size={12} />
                      <span className="max-w-[60px] truncate">{file.fileName}</span>
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <span className="text-gray-400 text-xs">Không có</span>
        )
      ),
    },
    ...(canEdit ? [{
      title: 'Hành động',
      key: 'action',
      width: '15%',
      render: (_: any, record: IKPITarget) => (
        <>
        <Popconfirm
          title="Xóa mục tiêu này?"
          onConfirm={() => handleDeleteTarget(record.id)}
          okText="Xóa"
          cancelText="Hủy"
        >
          <Button type="link" danger icon={<Trash2 size={16} />} />
        </Popconfirm>
        <Button type="link" icon={<Edit size={16} />} onClick={() => handleEditTargetModal(record)} /> 
        </>
      ),
      
    }] : []),
  ];

  if (loading || !kpi) {
    return <div className="p-6">Đang tải...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto">
      <Card className="mb-2">
        <div className="mb-4">
          <h1 className="text-3xl font-bold text-primary mb-2">Hồ sơ KPI: {kpi.id}</h1>
          <div className="grid grid-cols-2 gap-2 mt-2">
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
          <div className="mt-3">
            <div className="text-sm font-medium text-gray-700 mb-2">Phần trăm trọng số</div>
            <div className="relative bg-gray-200 rounded-full h-2 overflow-hidden">
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

        <Steps current={getCurrentStep(kpi.status)} items={APPROVAL_STEPS} className='border'/>
      </Card>

      <Card
        title={
          <div className="flex items-center gap-3">
            <span>Danh sách mục tiêu KPI</span>
            {kpi.groups && kpi.groups.length > 0 && (
              <>
                <Tag color="purple" icon={<FolderOpen size={14} />}>
                  {kpi.groups.length} nhóm
                </Tag>
                <Tag color="blue">
                  {kpi.targets.length} mục tiêu
                </Tag>
              </>
            )}
          </div>
        }
        extra={
          canEdit && (
            <Button
              type="primary"
              icon={<Plus size={18} className='mt-1'/>}
              onClick={handleAddTarget}
              className="bg-primary rounded-xl"
            >
              Thêm mục tiêu
            </Button>
          )
        }
        className='border border-primary '
      >
        {kpi.groups && kpi.groups.length > 0 ? (
          // Display grouped structure
          <Collapse
            expandIcon={({ isActive }) => (
              <ChevronDown 
                size={18} 
                className={`transition-transform ${isActive ? 'rotate-180' : ''}`} 
              />
            )}
            className="mb-4"
          >
            {kpi.groups.map((group, groupIndex) => {
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
                  
                  <Table
                    columns={columns}
                    dataSource={group.targets}
                    rowKey="id"
                    pagination={false}
                    bordered
                    size="small"
                    locale={{ emptyText: 'Chưa có mục tiêu nào' }}
                  />
                </Panel>
              );
            })}
          </Collapse>
        ) : (
          // Display flat list if no groups
          <Table
            columns={columns}
            dataSource={kpi.targets}
            rowKey="id"
            pagination={false}
            bordered
            locale={{ emptyText: 'Chưa có mục tiêu nào' }}
          />
        )}

        <div className="mt-6 flex justify-end gap-4">
          {canEdit && (
            <Button
              type="primary"
              icon={<Send size={18} className='mt-1'/>}
              onClick={handleSubmit}
              disabled={!isWeightValid(kpi.targets)}
              className="bg-primary rounded-xl"
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
        onCancel={() => {
          setIsModalOpen(false);
          setFileList([]);
        }}
        footer={null}
        width={700}
      >
        <Form form={form} layout="vertical" onFinish={handleSaveTarget}>
          <Form.Item
            name="title"
            label="Tiêu đề mục tiêu"
            rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}
          >
            <Input placeholder="VD: Đạt doanh số cá nhân quý & năm" className="bg-gray-50 rounded-xl" />
          </Form.Item>

          <div className="grid grid-cols-2 gap-3">
            <Form.Item
              name="category"
              label="Danh mục"
              rules={[{ required: true, message: 'Vui lòng chọn danh mục' }]}
            >
              <Select placeholder="Chọn danh mục" size="large">
                <Option value="Doanh số">Doanh số</Option>
                <Option value="Chất lượng">Chất lượng</Option>
                <Option value="Hiệu suất">Hiệu suất</Option>
                <Option value="Phát triển">Phát triển</Option>
                <Option value="Quản lý">Quản lý</Option>
                <Option value="Khác">Khác</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="weight"
              label="Trọng số (%)"
              rules={[{ required: true, message: 'Vui lòng chọn trọng số' }]}
            >
              <Select placeholder="Chọn trọng số" size="large">
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
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Form.Item
              name="target"
              label="Chỉ tiêu"
              rules={[{ required: true, message: 'Vui lòng nhập chỉ tiêu' }]}
            >
              <Input placeholder="Nhập số" className="bg-gray-50 rounded-xl" size="large" />
            </Form.Item>

            <Form.Item
              name="unit"
              label="Đơn vị"
              rules={[{ required: true, message: 'Vui lòng chọn đơn vị' }]}
            >
              <Select placeholder="Chọn đơn vị" size="large" showSearch>
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
            </Form.Item>
          </div>

          <Form.Item
            name="description"
            label="Chi tiết kế hoạch"
            rules={[{ required: true, message: 'Vui lòng nhập chi tiết' }]}
          >
            <TextArea autoSize={{ minRows: 4, maxRows: 10 }} placeholder="Mô tả chi tiết kế hoạch thực hiện" className="bg-gray-50 rounded-xl" />
          </Form.Item>

          <div className="grid grid-cols-2 gap-3">
            <Form.Item
              name="measurementMethod"
              label="Phương pháp đo lường"
            >
              <Select placeholder="Chọn phương pháp" allowClear>
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
            </Form.Item>

            <Form.Item
              name="evaluationCriteria"
              label="Tiêu chí đánh giá"
            >
              <Select placeholder="Chọn tiêu chí" allowClear>
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
            </Form.Item>
          </div>

          <Form.Item label="File đính kèm (tài liệu, ảnh minh họa)">
            <Upload
              fileList={fileList}
              onChange={handleUploadChange}
              onPreview={handlePreview}
              beforeUpload={beforeUpload}
              multiple
              maxCount={5}
              listType="picture-card"
              accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
            >
              {fileList.length < 5 && (
                <div className="text-center">
                  <UploadIcon size={24} className="mx-auto mb-1 text-gray-400" />
                  <div className="text-xs">Upload</div>
                </div>
              )}
            </Upload>
            <p className="text-xs text-gray-500 mt-1">
              Hỗ trợ ảnh, PDF, Word, Excel. Tối đa 5 file, mỗi file &lt; 10MB
            </p>
          </Form.Item>

          <Form.Item>
            <Space className="w-full justify-end">
              <Button onClick={() => {
                setIsModalOpen(false);
                setFileList([]);
              }}>Hủy</Button>
              <Button type="primary" htmlType="submit" icon={<Save size={16} />}>
                Lưu
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Chỉnh sửa mục tiêu KPI"
        open={isEditModalOpen}
        onCancel={() => {
          setIsEditModalOpen(false);
          setEditingTarget(null);
          setEditFileList([]);
        }}
        footer={null}
        width={700}
      >
        <Form form={editForm} layout="vertical" onFinish={handleEditTarget}>
          <Form.Item
            name="title"
            label="Tiêu đề mục tiêu"
            rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}
          >
            <Input placeholder="VD: Đạt doanh số cá nhân quý & năm" className="bg-gray-50 rounded-xl" />
          </Form.Item>

          <div className="grid grid-cols-2 gap-3">
            <Form.Item
              name="category"
              label="Danh mục"
              rules={[{ required: true, message: 'Vui lòng chọn danh mục' }]}
            >
              <Select placeholder="Chọn danh mục" size="large">
                <Option value="Doanh số">Doanh số</Option>
                <Option value="Chất lượng">Chất lượng</Option>
                <Option value="Hiệu suất">Hiệu suất</Option>
                <Option value="Phát triển">Phát triển</Option>
                <Option value="Quản lý">Quản lý</Option>
                <Option value="Khác">Khác</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="weight"
              label="Trọng số (%)"
              rules={[{ required: true, message: 'Vui lòng chọn trọng số' }]}
            >
              <Select placeholder="Chọn trọng số" size="large">
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
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Form.Item
              name="target"
              label="Chỉ tiêu"
              rules={[{ required: true, message: 'Vui lòng nhập chỉ tiêu' }]}
            >
              <Input placeholder="Nhập số" className="bg-gray-50 rounded-xl" size="large" />
            </Form.Item>

            <Form.Item
              name="unit"
              label="Đơn vị"
              rules={[{ required: true, message: 'Vui lòng chọn đơn vị' }]}
            >
              <Select placeholder="Chọn đơn vị" size="large" showSearch>
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
            </Form.Item>
          </div>

          <Form.Item
            name="description"
            label="Chi tiết kế hoạch"
            rules={[{ required: true, message: 'Vui lòng nhập chi tiết' }]}
          >
            <TextArea autoSize={{ minRows: 4, maxRows: 10 }} placeholder="Mô tả chi tiết kế hoạch thực hiện" className="bg-gray-50 rounded-xl" />
          </Form.Item>

          <div className="grid grid-cols-2 gap-3">
            <Form.Item
              name="measurementMethod"
              label="Phương pháp đo lường"
            >
              <Select placeholder="Chọn phương pháp" allowClear>
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
            </Form.Item>

            <Form.Item
              name="evaluationCriteria"
              label="Tiêu chí đánh giá"
            >
              <Select placeholder="Chọn tiêu chí" allowClear>
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
            </Form.Item>
          </div>

          <Form.Item label="File đính kèm (tài liệu, ảnh minh họa)">
            <Upload
              fileList={editFileList}
              onChange={handleEditUploadChange}
              onPreview={handlePreview}
              beforeUpload={beforeUpload}
              multiple
              maxCount={5}
              listType="picture-card"
              accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
            >
              {editFileList.length < 5 && (
                <div className="text-center">
                  <UploadIcon size={24} className="mx-auto mb-1 text-gray-400" />
                  <div className="text-xs">Upload</div>
                </div>
              )}
            </Upload>
            <p className="text-xs text-gray-500 mt-1">
              Hỗ trợ ảnh, PDF, Word, Excel. Tối đa 5 file, mỗi file &lt; 10MB
            </p>
          </Form.Item>

          <Form.Item>
            <Space className="w-full justify-end">
              <Button onClick={() => {
                setIsEditModalOpen(false);
                setEditingTarget(null);
                setEditFileList([]);
              }}>Hủy</Button>
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
            <TextArea autoSize={{ minRows: 4, maxRows: 10 }} placeholder="Nhập lý do từ chối hồ sơ" className="bg-gray-50 rounded-xl" />
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

      {/* Image Preview Modal */}
      <Modal
        open={previewOpen}
        title="Xem trước"
        footer={null}
        onCancel={() => setPreviewOpen(false)}
      >
        <img alt="preview" style={{ width: '100%' }} src={previewImage} />
      </Modal>
    </div>
  );
};
