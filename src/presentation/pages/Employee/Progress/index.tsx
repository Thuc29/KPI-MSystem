import { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Progress, 
  Tag, 
  Timeline,
  Modal,
  Form,
  InputNumber,
  Input,
  Select,
  Empty,
  Upload,
  Image,
  message
} from 'antd';
import type { UploadFile, UploadProps } from 'antd';
import { 
  TrendingUp, 
  Plus, 
  CheckCircle, 
  AlertTriangle,
  Clock,
  FileText,
  Activity,
  Upload as UploadIcon,
  File,
  X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { storage } from '../../../../infrastructure/utils';
import { kpiApi } from '../../../../infrastructure/api';
import { mockProgressCheckins, getCheckinsByKPI } from '../../../../infrastructure/api/mockProgress';
import type { IKPIRecord, IProgressCheckin } from '../../../../core/models';
import type { ColumnsType } from 'antd/es/table';

const { TextArea } = Input;
const { Dragger } = Upload;

export const ProgressPage = () => {
  const navigate = useNavigate();
  const [kpiList, setKpiList] = useState<IKPIRecord[]>([]);
  const [selectedKPI, setSelectedKPI] = useState<IKPIRecord | null>(null);
  const [checkins, setCheckins] = useState<IProgressCheckin[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTargetId, setSelectedTargetId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [form] = Form.useForm();

  const userId = storage.getUserId();

  useEffect(() => {
    fetchKPIList();
  }, []);

  const fetchKPIList = async () => {
    setLoading(true);
    try {
      const response = await kpiApi.getList();
      if (response.data.data) {
        const myKPIs = response.data.data.filter(
          (k: IKPIRecord) => k.employeeId === userId && (k.status === 'in_progress' || k.status === 'completed')
        );
        setKpiList(myKPIs);
        if (myKPIs.length > 0) {
          handleSelectKPI(myKPIs[0]);
        }
      }
    } catch (error: any) {
      toast.error('Không thể tải danh sách KPI');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectKPI = (kpi: IKPIRecord) => {
    setSelectedKPI(kpi);
    const kpiCheckins = getCheckinsByKPI(kpi.id);
    setCheckins(kpiCheckins);
  };

  const handleCheckin = (targetId: string) => {
    const target = selectedKPI?.targets.find(t => t.id === targetId);
    if (!target) return;

    setSelectedTargetId(targetId);
    setFileList([]);
    form.setFieldsValue({
      currentValue: target.currentValue || 0,
    });
    setModalVisible(true);
  };

  // Handle file upload
  const handleUploadChange: UploadProps['onChange'] = ({ fileList: newFileList }) => {
    setFileList(newFileList);
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

  const handleSubmitCheckin = async (values: any) => {
    const target = selectedKPI?.targets.find(t => t.id === selectedTargetId);
    if (!target || !selectedKPI) return;

    const completionRate = Math.round((values.currentValue / parseFloat(target.target)) * 100);
    
    // Convert files to base64 for demo (in production, upload to server)
    const evidenceFiles = await Promise.all(
      fileList.map(async (file) => ({
        id: `file-${Date.now()}-${Math.random()}`,
        fileName: file.name,
        fileUrl: file.url || (await getBase64(file.originFileObj as File)),
        fileSize: file.size || 0,
        uploadedAt: new Date().toISOString(),
      }))
    );
    
    const newCheckin: IProgressCheckin = {
      id: `checkin-${Date.now()}`,
      kpiId: selectedKPI.id,
      targetId: selectedTargetId,
      currentValue: values.currentValue,
      targetValue: parseFloat(target.target),
      completionRate,
      note: values.note,
      challenges: values.challenges,
      nextSteps: values.nextSteps,
      evidenceFiles: evidenceFiles.length > 0 ? evidenceFiles : undefined,
      checkinDate: new Date().toISOString(),
      checkinBy: userId || '',
      isOnTrack: completionRate >= 80,
    };

    mockProgressCheckins.unshift(newCheckin);
    setCheckins([newCheckin, ...checkins]);
    
    toast.success('Đã check-in tiến độ thành công');
    setModalVisible(false);
    setFileList([]);
    form.resetFields();
  };

  const getProgressStatus = (completionRate: number) => {
    if (completionRate >= 90) return { status: 'success', color: 'green', icon: <CheckCircle size={16} /> };
    if (completionRate >= 70) return { status: 'normal', color: 'blue', icon: <Activity size={16} /> };
    if (completionRate >= 50) return { status: 'active', color: 'orange', icon: <Clock size={16} /> };
    return { status: 'exception', color: 'red', icon: <AlertTriangle size={16} /> };
  };

  const columns: ColumnsType<any> = [
    {
      title: 'Mục tiêu',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <div>
          <div className="font-semibold">{text}</div>
          <div className="text-xs text-gray-500">
            Trọng số: {record.weight}%
          </div>
        </div>
      ),
    },
    {
      title: 'Chỉ tiêu',
      key: 'target',
      render: (_, record) => (
        <span className="font-medium">
          {record.target} {record.unit}
        </span>
      ),
    },
    {
      title: 'Hiện tại',
      key: 'current',
      render: (_, record) => (
        <span className="text-primary font-semibold">
          {record.currentValue || 0} {record.unit}
        </span>
      ),
    },
    {
      title: 'Tiến độ',
      key: 'progress',
      render: (_, record) => {
        const rate = record.completionRate || 0;
        const status = getProgressStatus(rate);
        return (
          <div className="space-y-1">
            <Progress 
              percent={rate} 
              status={status.status as any}
              strokeColor={status.color}
            />
            <div className="flex items-center gap-1 text-xs">
              {status.icon}
              <span className={`text-${status.color}-600`}>
                {rate >= 90 ? 'Xuất sắc' : rate >= 70 ? 'Tốt' : rate >= 50 ? 'Trung bình' : 'Cần cải thiện'}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      title: 'Hành động',
      key: 'action',
      align: 'center',
      render: (_, record) => (
        <Button
          type="primary"
          icon={<Plus size={14} />}
          onClick={() => handleCheckin(record.id)}
          className="bg-primary"
        >
          Check-in
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
          <TrendingUp size={32} className="text-primary" />
          Tiến độ & Check-in
        </h1>
        <p className="text-gray-500">Theo dõi và cập nhật tiến độ thực hiện KPI</p>
      </div>

      {/* KPI Selector */}
      {kpiList.length > 0 ? (
        <>
          <Card className="shadow-sm">
            <div className="flex items-center gap-4">
              <span className="font-semibold">Chọn KPI:</span>
              <Select
                value={selectedKPI?.id}
                onChange={(value) => {
                  const kpi = kpiList.find(k => k.id === value);
                  if (kpi) handleSelectKPI(kpi);
                }}
                style={{ width: 300 }}
              >
                {kpiList.map(kpi => (
                  <Select.Option key={kpi.id} value={kpi.id}>
                    {kpi.id} - {kpi.year}
                  </Select.Option>
                ))}
              </Select>
              {selectedKPI && (
                <Tag color="green">
                  {selectedKPI.targets.length} mục tiêu
                </Tag>
              )}
            </div>
          </Card>

          {/* Progress Table */}
          {selectedKPI && (
            <Card 
              title={
                <div className="flex items-center gap-2">
                  <FileText size={20} className="text-primary" />
                  <span>Danh sách mục tiêu</span>
                </div>
              }
              className="shadow-sm"
            >
              <Table
                columns={columns}
                dataSource={selectedKPI.targets}
                rowKey="id"
                pagination={false}
              />
            </Card>
          )}

          {/* Check-in History */}
          {checkins.length > 0 && (
            <Card 
              title={
                <div className="flex items-center gap-2">
                  <Clock size={20} className="text-primary" />
                  <span>Lịch sử Check-in</span>
                </div>
              }
              className="shadow-sm"
            >
              <Timeline
                items={checkins.map(checkin => {
                  const target = selectedKPI?.targets.find(t => t.id === checkin.targetId);
                  const status = getProgressStatus(checkin.completionRate);
                  
                  return {
                    color: status.color,
                    children: (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500 text-sm">
                            {new Date(checkin.checkinDate).toLocaleDateString('vi-VN')}
                          </span>
                          <Tag color={status.color}>{checkin.completionRate}%</Tag>
                        </div>
                        <div className="font-semibold">{target?.title}</div>
                        <div className="text-sm">
                          <strong>Giá trị:</strong> {checkin.currentValue} / {checkin.targetValue} {target?.unit}
                        </div>
                        {checkin.note && (
                          <div className="text-sm text-gray-600">
                            <strong>Ghi chú:</strong> {checkin.note}
                          </div>
                        )}
                        {checkin.challenges && (
                          <div className="text-sm text-orange-600">
                            <strong>Khó khăn:</strong> {checkin.challenges}
                          </div>
                        )}
                        {checkin.nextSteps && (
                          <div className="text-sm text-blue-600">
                            <strong>Bước tiếp theo:</strong> {checkin.nextSteps}
                          </div>
                        )}
                        {checkin.evidenceFiles && checkin.evidenceFiles.length > 0 && (
                          <div className="mt-3">
                            <div className="text-sm font-semibold mb-2">
                              📎 File đính kèm ({checkin.evidenceFiles.length}):
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {checkin.evidenceFiles.map((file) => {
                                const isImage = file.fileName.match(/\.(jpg|jpeg|png|gif|webp)$/i);
                                
                                return (
                                  <div key={file.id} className="relative group">
                                    {isImage ? (
                                      <Image
                                        src={file.fileUrl}
                                        alt={file.fileName}
                                        width={100}
                                        height={100}
                                        className="rounded border object-cover"
                                      />
                                    ) : (
                                      <a
                                        href={file.fileUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded border hover:bg-gray-200 transition-colors"
                                      >
                                        <File size={16} />
                                        <span className="text-sm max-w-[150px] truncate">
                                          {file.fileName}
                                        </span>
                                      </a>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    ),
                  };
                })}
              />
            </Card>
          )}
        </>
      ) : (
        <Card>
          <Empty
            description="Bạn chưa có KPI nào được phê duyệt"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <Button type="primary" onClick={() => navigate('/kpi/create')}>
              Tạo KPI mới
            </Button>
          </Empty>
        </Card>
      )}

      {/* Check-in Modal */}
      <Modal
        title="Check-in tiến độ"
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setFileList([]);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        okText="Lưu check-in"
        cancelText="Hủy"
        width={700}
      >
        {selectedKPI && selectedTargetId && (
          <Form form={form} layout="vertical" onFinish={handleSubmitCheckin}>
            {(() => {
              const target = selectedKPI.targets.find(t => t.id === selectedTargetId);
              if (!target) return null;

              return (
                <>
                  <div className="mb-4 p-4 bg-gray-50 rounded">
                    <h4 className="font-semibold mb-2">{target.title}</h4>
                    <p className="text-sm text-gray-600">
                      Chỉ tiêu: {target.target} {target.unit}
                    </p>
                  </div>

                  <Form.Item
                    name="currentValue"
                    label="Giá trị hiện tại"
                    rules={[{ required: true, message: 'Vui lòng nhập giá trị' }]}
                  >
                    <InputNumber
                      min={0}
                      className="w-full"
                      addonAfter={target.unit}
                    />
                  </Form.Item>

                  <Form.Item name="note" label="Ghi chú">
                    <TextArea rows={3} placeholder="Mô tả tiến độ hiện tại..." />
                  </Form.Item>

                  <Form.Item name="challenges" label="Khó khăn gặp phải">
                    <TextArea rows={2} placeholder="Những thách thức cần giải quyết..." />
                  </Form.Item>

                  <Form.Item name="nextSteps" label="Bước tiếp theo">
                    <TextArea rows={2} placeholder="Kế hoạch cho giai đoạn tiếp theo..." />
                  </Form.Item>

                  <Form.Item label="File chứng minh (ảnh, PDF, Word, Excel)">
                    <Dragger
                      fileList={fileList}
                      onChange={handleUploadChange}
                      onPreview={handlePreview}
                      beforeUpload={beforeUpload}
                      multiple
                      maxCount={5}
                      listType="picture-card"
                      accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                    >
                      <p className="ant-upload-drag-icon">
                        <UploadIcon size={48} className="mx-auto text-primary" />
                      </p>
                      <p className="ant-upload-text">Click hoặc kéo thả file vào đây</p>
                      <p className="ant-upload-hint">
                        Hỗ trợ ảnh, PDF, Word, Excel. Tối đa 5 file, mỗi file &lt; 10MB
                      </p>
                    </Dragger>
                  </Form.Item>
                </>
              );
            })()}
          </Form>
        )}
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
