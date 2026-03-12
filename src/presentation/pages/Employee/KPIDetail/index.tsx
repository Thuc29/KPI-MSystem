import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Steps, Button, Table, Modal, Form, Input, InputNumber, Space, Popconfirm, Collapse, Tag, Upload, Image, message, Select } from 'antd';
import type { UploadFile, UploadProps } from 'antd';
import { Plus, Trash2, Save, Send, Check, X, Edit, ChevronDown, FolderOpen, Upload as UploadIcon, File } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { kpiApi } from '../../../../infrastructure/api';
import { storage, calculateTotalWeight, isWeightValid, getCurrentStep } from '../../../../infrastructure/utils';
import { getApprovalSteps } from '../../../../core/constants';
import type { IKPIRecord, IKPITarget, KPITargetFormValues, RejectFormValues, IBackendRes } from '../../../../core/models';
import type { ColumnsType } from 'antd/es/table';
import { useTranslation } from '../../../../infrastructure/i18n';

const { TextArea } = Input;
const { Panel } = Collapse;
const { Option } = Select;

export const KPIDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
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
      toast.error(error?.response?.data?.message || t.kpiDetail.cannotLoadKPI);
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
      message.error(t.progress.onlySupportsFiles);
      return Upload.LIST_IGNORE;
    }

    const isLt10M = file.size / 1024 / 1024 < 10;
    if (!isLt10M) {
      message.error(t.progress.fileTooLarge);
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
      toast.success(t.kpiDetail.targetAdded);
      setIsModalOpen(false);
      setFileList([]);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || t.kpiDetail.cannotAddTarget);
    }
  };

  const handleDeleteTarget = async (targetId: string) => {
    if (!kpi) return;

    const updatedTargets = kpi.targets.filter(t => t.id !== targetId);
    
    try {
      await kpiApi.update(kpi.id, { targets: updatedTargets });
      setKpi({ ...kpi, targets: updatedTargets });
      toast.success(t.kpiDetail.targetDeleted);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || t.kpiDetail.cannotDeleteTarget);
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
      toast.success(t.kpiDetail.targetUpdated);
      setIsEditModalOpen(false);
      setEditingTarget(null);
      setEditFileList([]);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || t.kpiDetail.cannotUpdateTarget);
    }
  };

  const handleSubmit = async () => {
    if (!kpi) return;

    if (!isWeightValid(kpi.targets)) {
      toast.error(t.kpiDetail.totalWeightMustBe100);
      return;
    }

    try {
      await kpiApi.submit(kpi.id);
      toast.success(t.kpiDetail.recordSubmitted);
      fetchKPIDetail();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || t.kpiDetail.cannotSubmitRecord);
    }
  };

  const handleApprove = async () => {
    if (!kpi) return;

    try {
      await kpiApi.approve(kpi.id);
      toast.success(t.kpiDetail.recordApproved);
      fetchKPIDetail();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || t.kpiDetail.cannotApprove);
    }
  };

  const handleReject = async (values: RejectFormValues) => {
    if (!kpi) return;

    try {
      await kpiApi.reject(kpi.id, values.reason);
      toast.success(t.kpiDetail.recordRejected);
      setIsRejectModalOpen(false);
      fetchKPIDetail();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || t.kpiDetail.cannotReject);
    }
  };

  const canEdit = kpi?.status === 'draft' && (userRole === 'employee' || userRole === 'tl') && kpi?.employeeId === userId;
  const canApprove = kpi?.status === 'pending_approval' && userRole !== 'employee' && kpi?.employeeId !== userId;

  const totalWeight = kpi ? calculateTotalWeight(kpi.targets) : 0;
  const weightPercent = totalWeight; // for progress bar animation

  const columns: ColumnsType<IKPITarget> = [
    {
      title: t.kpiDetail.targetTitle,
      dataIndex: 'title',
      key: 'title',
      width: '20%',
    },
    {
      title: t.kpiDetail.planDetail,
      dataIndex: 'description',
      key: 'description',
      width: '25%',
    },
    {
      title: t.kpiDetail.weight,
      dataIndex: 'weight',
      key: 'weight',
      width: '10%',
    },
    {
      title: t.kpiDetail.targetValue,
      key: 'target',
      width: '15%',
      render: (_, record) => (
        <span>
          {record.target} {record.unit}
        </span>
      ),
    },
    {
      title: t.kpiDetail.attachments,
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
          <span className="text-gray-400 text-xs">{t.kpiDetail.noAttachments}</span>
        )
      ),
    },
    ...(canEdit ? [{
      title: t.kpiDetail.actions,
      key: 'action',
      width: '15%',
      render: (_: any, record: IKPITarget) => (
        <>
        <Popconfirm
          title={t.kpiDetail.deleteConfirm}
          onConfirm={() => handleDeleteTarget(record.id)}
          okText={t.common.delete}
          cancelText={t.common.cancel}
        >
          <Button type="link" danger icon={<Trash2 size={16} />} />
        </Popconfirm>
        <Button type="link" icon={<Edit size={16} />} onClick={() => handleEditTargetModal(record)} /> 
        </>
      ),
      
    }] : []),
  ];

  if (loading || !kpi) {
    return <div className="p-6">{t.common.loading}</div>;
  }

  return (
    <div className="max-w-7xl mx-auto">
      <Card className="mb-2">
        <div className="mb-4">
          <h1 className="text-3xl font-bold text-primary mb-2">{t.kpiDetail.title} {kpi.id}</h1>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div><span className="font-semibold">{t.kpiDetail.employee}</span> {kpi.employeeName}</div>
            <div><span className="font-semibold">{t.kpiDetail.department}</span> {kpi.department}</div>
            <div><span className="font-semibold">{t.kpiDetail.year}</span> {kpi.year}</div>
            <div>
              <span className="font-semibold">{t.kpiDetail.totalWeight}</span>{' '}
              <span className={totalWeight === 100 ? 'text-green-600' : 'text-red-600'}>
                {totalWeight}%
              </span>
            </div>
          </div>

          {/* Weight progress bar */}
          <div className="mt-3">
            <div className="text-sm font-medium text-gray-700 mb-2">{t.kpiDetail.weightPercentage}</div>
            <div className="relative bg-gray-200 rounded-full h-2 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${weightPercent}%` }}
                transition={{ duration: 0.6 }}
                className="bg-green-500 h-full"
              />
            </div>
            <div className="flex justify-between mt-1 text-xs text-gray-600">
              <div className="flex items-center gap-1"><span className="w-2 h-2 bg-green-500 rounded-full"></span> {t.kpiDetail.allocated}</div>
              <div className="flex items-center gap-1"><span className="w-2 h-2 bg-gray-300 rounded-full"></span> {t.kpiDetail.remaining}</div>
            </div>
          </div>
        </div>

        <Steps current={getCurrentStep(kpi.status)} items={getApprovalSteps(t)} className='border'/>
      </Card>

      <Card
        title={
          <div className="flex items-center gap-3">
            <span>{t.kpiDetail.targetListTitle}</span>
            {kpi.groups && kpi.groups.length > 0 && (
              <>
                <Tag color="purple" icon={<FolderOpen size={14} />}>
                  {t.kpiDetail.groupCount.replace('{count}', String(kpi.groups.length))}
                </Tag>
                <Tag color="blue" >
                  {t.kpiDetail.targetCount.replace('{count}', String(kpi.targets.length))}
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
              {t.kpiDetail.addTarget}
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
                        <Tag color="purple">{t.kpiDetail.targetCount.replace('{count}', String(group.targets.length))}</Tag>
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
                    locale={{ emptyText: t.kpiDetail.noTargets }}
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
            locale={{ emptyText: t.kpiDetail.noTargets }}
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
              {t.kpiDetail.submitRecord}
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
                {t.kpiDetail.approve}
              </Button>
              <Button
                danger
                icon={<X size={18} />}
                onClick={() => setIsRejectModalOpen(true)}
              >
                {t.kpiDetail.reject}
              </Button>
            </Space>
          )}
        </div>
      </Card>

      <Modal
        title={t.kpiDetail.addTargetModal}
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
            label={t.kpiDetail.targetTitleLabel}
            rules={[{ required: true, message: t.kpiDetail.targetTitleRequired }]}
          >
            <Input placeholder={t.kpiDetail.targetTitlePlaceholder} className="bg-gray-50 rounded-xl" />
          </Form.Item>

          <div className="grid grid-cols-2 gap-3">
            <Form.Item
              name="category"
              label={t.kpiDetail.categoryLabel}
              rules={[{ required: true, message: t.kpiDetail.categoryRequired }]}
            >
              <Select placeholder={t.kpiDetail.categoryPlaceholder} size="large">
                <Option value="Doanh số">{t.createKPI.categorySales}</Option>
                <Option value="Chất lượng">{t.createKPI.categoryQuality}</Option>
                <Option value="Hiệu suất">{t.createKPI.categoryPerformance}</Option>
                <Option value="Phát triển">{t.createKPI.categoryDevelopment}</Option>
                <Option value="Quản lý">{t.createKPI.categoryManagement}</Option>
                <Option value="Khác">{t.createKPI.categoryOther}</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="weight"
              label={t.kpiDetail.weightLabel}
              rules={[{ required: true, message: t.kpiDetail.weightRequired }]}
            >
              <Select placeholder={t.kpiDetail.weightPlaceholder} size="large">
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
              label={t.kpiDetail.targetLabel}
              rules={[{ required: true, message: t.kpiDetail.targetRequired }]}
            >
              <Input placeholder={t.kpiDetail.targetPlaceholder} className="bg-gray-50 rounded-xl" size="large" />
            </Form.Item>

            <Form.Item
              name="unit"
              label={t.kpiDetail.unitLabel}
              rules={[{ required: true, message: t.kpiDetail.unitRequired }]}
            >
              <Select placeholder={t.kpiDetail.unitPlaceholder} size="large" showSearch>
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
            </Form.Item>
          </div>

          <Form.Item
            name="description"
            label={t.kpiDetail.planDetailLabel}
            rules={[{ required: true, message: t.kpiDetail.planDetailRequired }]}
          >
            <TextArea autoSize={{ minRows: 4, maxRows: 10 }} placeholder={t.kpiDetail.planDetailPlaceholder} className="bg-gray-50 rounded-xl" />
          </Form.Item>

          <div className="grid grid-cols-2 gap-3">
            <Form.Item
              name="measurementMethod"
              label={t.kpiDetail.measurementMethodLabel}
            >
              <Select placeholder={t.kpiDetail.measurementMethodPlaceholder} allowClear>
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
            </Form.Item>

            <Form.Item
              name="evaluationCriteria"
              label={t.kpiDetail.evaluationCriteriaLabel}
            >
              <Select placeholder={t.kpiDetail.evaluationCriteriaPlaceholder} allowClear>
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
            </Form.Item>
          </div>

          <Form.Item label={t.kpiDetail.attachmentLabel}>
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
                  <div className="text-xs">{t.kpiDetail.uploadText}</div>
                </div>
              )}
            </Upload>
            <p className="text-xs text-gray-500 mt-1">
              {t.kpiDetail.attachmentHint}
            </p>
          </Form.Item>

          <Form.Item>
            <Space className="w-full justify-end">
              <Button onClick={() => {
                setIsModalOpen(false);
                setFileList([]);
              }}>{t.common.cancel}</Button>
              <Button type="primary" htmlType="submit" icon={<Save size={16} />}>
                {t.common.save}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={t.kpiDetail.editTargetModal}
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
            label={t.kpiDetail.targetTitleLabel}
            rules={[{ required: true, message: t.kpiDetail.targetTitleRequired }]}
          >
            <Input placeholder={t.kpiDetail.targetTitlePlaceholder} className="bg-gray-50 rounded-xl" />
          </Form.Item>

          <div className="grid grid-cols-2 gap-3">
            <Form.Item
              name="category"
              label={t.kpiDetail.categoryLabel}
              rules={[{ required: true, message: t.kpiDetail.categoryRequired }]}
            >
              <Select placeholder={t.kpiDetail.categoryPlaceholder} size="large">
                <Option value="Doanh số">{t.createKPI.categorySales}</Option>
                <Option value="Chất lượng">{t.createKPI.categoryQuality}</Option>
                <Option value="Hiệu suất">{t.createKPI.categoryPerformance}</Option>
                <Option value="Phát triển">{t.createKPI.categoryDevelopment}</Option>
                <Option value="Quản lý">{t.createKPI.categoryManagement}</Option>
                <Option value="Khác">{t.createKPI.categoryOther}</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="weight"
              label={t.kpiDetail.weightLabel}
              rules={[{ required: true, message: t.kpiDetail.weightRequired }]}
            >
              <Select placeholder={t.kpiDetail.weightPlaceholder} size="large">
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
              label={t.kpiDetail.targetLabel}
              rules={[{ required: true, message: t.kpiDetail.targetRequired }]}
            >
              <Input placeholder={t.kpiDetail.targetPlaceholder} className="bg-gray-50 rounded-xl" size="large" />
            </Form.Item>

            <Form.Item
              name="unit"
              label={t.kpiDetail.unitLabel}
              rules={[{ required: true, message: t.kpiDetail.unitRequired }]}
            >
              <Select placeholder={t.kpiDetail.unitPlaceholder} size="large" showSearch>
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
            </Form.Item>
          </div>

          <Form.Item
            name="description"
            label={t.kpiDetail.planDetailLabel}
            rules={[{ required: true, message: t.kpiDetail.planDetailRequired }]}
          >
            <TextArea autoSize={{ minRows: 4, maxRows: 10 }} placeholder={t.kpiDetail.planDetailPlaceholder} className="bg-gray-50 rounded-xl" />
          </Form.Item>

          <div className="grid grid-cols-2 gap-3">
            <Form.Item
              name="measurementMethod"
              label={t.kpiDetail.measurementMethodLabel}
            >
              <Select placeholder={t.kpiDetail.measurementMethodPlaceholder} allowClear>
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
            </Form.Item>

            <Form.Item
              name="evaluationCriteria"
              label={t.kpiDetail.evaluationCriteriaLabel}
            >
              <Select placeholder={t.kpiDetail.evaluationCriteriaPlaceholder} allowClear>
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
            </Form.Item>
          </div>

          <Form.Item label={t.kpiDetail.attachmentLabel}>
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
                  <div className="text-xs">{t.kpiDetail.uploadText}</div>
                </div>
              )}
            </Upload>
            <p className="text-xs text-gray-500 mt-1">
              {t.kpiDetail.attachmentHint}
            </p>
          </Form.Item>

          <Form.Item>
            <Space className="w-full justify-end">
              <Button onClick={() => {
                setIsEditModalOpen(false);
                setEditingTarget(null);
                setEditFileList([]);
              }}>{t.common.cancel}</Button>
              <Button type="primary" htmlType="submit" icon={<Save size={16} />}>
                {t.common.save}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={t.kpiDetail.rejectModal}
        open={isRejectModalOpen}
        onCancel={() => setIsRejectModalOpen(false)}
        footer={null}
      >
        <Form form={rejectForm} layout="vertical" onFinish={handleReject}>
          <Form.Item
            name="reason"
            label={t.kpiDetail.rejectReasonLabel}
            rules={[{ required: true, message: t.kpiDetail.rejectReasonRequired }]}
          >
            <TextArea autoSize={{ minRows: 4, maxRows: 10 }} placeholder={t.kpiDetail.rejectReasonPlaceholder} className="bg-gray-50 rounded-xl" />
          </Form.Item>

          <Form.Item>
            <Space className="w-full justify-end">
              <Button onClick={() => setIsRejectModalOpen(false)}>{t.common.cancel}</Button>
              <Button type="primary" danger htmlType="submit">
                {t.kpiDetail.confirmReject}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Image Preview Modal */}
      <Modal
        open={previewOpen}
        title={t.kpiDetail.previewTitle}
        footer={null}
        onCancel={() => setPreviewOpen(false)}
      >
        <img alt="preview" style={{ width: '100%' }} src={previewImage} />
      </Modal>
    </div>
  );
};
