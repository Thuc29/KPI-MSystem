import React, { useState } from 'react';
import { CheckCircle, Clock, AlertCircle, XCircle, Upload as UploadIcon, Calendar, MessageSquare, File, Image as ImageIcon } from 'lucide-react';
import { Upload, Image, message as antMessage } from 'antd';
import type { UploadFile, UploadProps } from 'antd';
import type { ITaskItem, IAttachment } from '../../core/models';

const { Dragger } = Upload;

interface TaskListProps {
  tasks: ITaskItem[];
  onTaskComplete: (taskId: string, evidence: any) => void;
  onVerifyTask?: (taskId: string) => void;
  onRejectTask?: (taskId: string, reason: string) => void;
  onRequestExtension?: (taskId: string, newDeadline: string, reason: string) => void;
  onAppeal?: (taskId: string, message: string) => void;
  isManager?: boolean;
}

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  onTaskComplete,
  onVerifyTask,
  onRejectTask,
  onRequestExtension,
  onAppeal,
  isManager = false,
}) => {
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [evidenceMessage, setEvidenceMessage] = useState('');
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [rejectReason, setRejectReason] = useState('');
  const [extensionDate, setExtensionDate] = useState('');
  const [extensionReason, setExtensionReason] = useState('');
  const [appealMessage, setAppealMessage] = useState('');

  const handleUploadChange: UploadProps['onChange'] = ({ fileList: newFileList }) => {
    setFileList(newFileList);
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
      antMessage.error('Chỉ hỗ trợ file ảnh, PDF, Word, Excel!');
      return Upload.LIST_IGNORE;
    }

    const isLt10M = file.size / 1024 / 1024 < 10;
    if (!isLt10M) {
      antMessage.error('File phải nhỏ hơn 10MB!');
      return Upload.LIST_IGNORE;
    }

    return false; // Prevent auto upload
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="text-green-500" size={20} />;
      case 'pending_verify':
        return <Clock className="text-yellow-500" size={20} />;
      case 'overdue':
        return <AlertCircle className="text-red-500" size={20} />;
      default:
        return <Clock className="text-gray-400" size={20} />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'to_do':
        return 'Cần làm';
      case 'pending_verify':
        return 'Chờ xác nhận';
      case 'verified':
        return 'Hoàn tất';
      case 'overdue':
        return 'Quá hạn';
      default:
        return status;
    }
  };

  const isOverdue = (deadline: string, status: string) => {
    return new Date(deadline) < new Date() && status !== 'verified';
  };

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <div
          key={task.id}
          className={`border rounded-lg p-4 ${
            isOverdue(task.deadline, task.status) ? 'border-red-300 bg-red-50' : 'border-gray-200'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                {getStatusIcon(task.status)}
                <h4 className="font-medium">{task.title}</h4>
                <span className="text-xs px-2 py-1 rounded bg-gray-100">
                  {getStatusText(task.status)}
                </span>
              </div>
              
              {task.description && (
                <p className="text-sm text-gray-600 mb-2">{task.description}</p>
              )}
              
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Calendar size={14} />
                  Hạn: {new Date(task.deadline).toLocaleDateString('vi-VN')}
                </span>
                {task.completedAt && (
                  <span>Hoàn thành: {new Date(task.completedAt).toLocaleDateString('vi-VN')}</span>
                )}
              </div>

              {task.evidenceMessage && (
                <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
                  <strong>Minh chứng:</strong> {task.evidenceMessage}
                </div>
              )}

              {task.evidenceFiles && task.evidenceFiles.length > 0 && (
                <div className="mt-2 p-3 bg-blue-50 rounded">
                  <div className="text-sm font-semibold mb-2">
                    📎 File đính kèm ({task.evidenceFiles.length}):
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {task.evidenceFiles.map((file) => {
                      const isImage = file.fileName.match(/\.(jpg|jpeg|png|gif|webp)$/i);
                      
                      return (
                        <div key={file.id} className="relative group">
                          {isImage ? (
                            <Image
                              src={file.fileUrl}
                              alt={file.fileName}
                              width={80}
                              height={80}
                              className="rounded border object-cover"
                            />
                          ) : (
                            <a
                              href={file.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 px-3 py-2 bg-white rounded border hover:bg-gray-50 transition-colors"
                            >
                              <File size={16} />
                              <span className="text-sm max-w-[120px] truncate">
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

              {task.rejectionReason && (
                <div className="mt-2 p-2 bg-red-50 rounded text-sm">
                  <strong>Lý do từ chối:</strong> {task.rejectionReason}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2 ml-4">
              {/* Employee actions */}
              {!isManager && task.status === 'to_do' && (
                <>
                  <button
                    onClick={() => setSelectedTask(task.id)}
                    className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                  >
                    <UploadIcon size={14} className="inline mr-1" />
                    Báo cáo hoàn thành
                  </button>
                  {isOverdue(task.deadline, task.status) && (
                    <button
                      onClick={() => setSelectedTask(`ext-${task.id}`)}
                      className="px-3 py-1 bg-yellow-500 text-white rounded text-sm hover:bg-yellow-600"
                    >
                      Xin gia hạn
                    </button>
                  )}
                </>
              )}

              {!isManager && task.status === 'pending_verify' && task.rejectionReason && (
                <button
                  onClick={() => setSelectedTask(`appeal-${task.id}`)}
                  className="px-3 py-1 bg-orange-500 text-white rounded text-sm hover:bg-orange-600"
                >
                  <MessageSquare size={14} className="inline mr-1" />
                  Khiếu nại
                </button>
              )}

              {/* Manager actions */}
              {isManager && task.status === 'pending_verify' && (
                <>
                  <button
                    onClick={() => onVerifyTask?.(task.id)}
                    className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                  >
                    <CheckCircle size={14} className="inline mr-1" />
                    Xác nhận
                  </button>
                  <button
                    onClick={() => setSelectedTask(`reject-${task.id}`)}
                    className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                  >
                    <XCircle size={14} className="inline mr-1" />
                    Từ chối
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Evidence submission modal */}
          {selectedTask === task.id && (
            <div className="mt-4 p-4 bg-gray-50 rounded">
              <h5 className="font-medium mb-3">Báo cáo hoàn thành công việc</h5>
              <textarea
                className="w-full p-2 border rounded mb-3"
                rows={3}
                placeholder="Mô tả kết quả công việc..."
                value={evidenceMessage}
                onChange={(e) => setEvidenceMessage(e.target.value)}
              />
              
              <div className="mb-3">
                <label className="block text-sm font-medium mb-2">
                  Đính kèm file chứng minh (ảnh, PDF, Word, Excel)
                </label>
                <Upload
                  fileList={fileList}
                  onChange={handleUploadChange}
                  beforeUpload={beforeUpload}
                  multiple
                  maxCount={5}
                  listType="picture-card"
                  accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                >
                  {fileList.length < 5 && (
                    <div className="text-center">
                      <UploadIcon size={24} className="mx-auto mb-1 text-gray-400" />
                      <div className="text-xs text-gray-500">Upload</div>
                    </div>
                  )}
                </Upload>
                <p className="text-xs text-gray-500 mt-1">
                  Tối đa 5 file, mỗi file &lt; 10MB
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={async () => {
                    // Convert files to base64 for demo
                    const evidenceFiles = await Promise.all(
                      fileList.map(async (file) => ({
                        id: `file-${Date.now()}-${Math.random()}`,
                        fileName: file.name,
                        fileUrl: file.url || (await getBase64(file.originFileObj as File)),
                        fileSize: file.size || 0,
                        uploadedAt: new Date().toISOString(),
                      }))
                    );

                    onTaskComplete(task.id, { 
                      message: evidenceMessage,
                      files: evidenceFiles 
                    });
                    setEvidenceMessage('');
                    setFileList([]);
                    setSelectedTask(null);
                  }}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Gửi
                </button>
                <button
                  onClick={() => {
                    setSelectedTask(null);
                    setEvidenceMessage('');
                    setFileList([]);
                  }}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                >
                  Hủy
                </button>
              </div>
            </div>
          )}

          {/* Rejection modal */}
          {selectedTask === `reject-${task.id}` && (
            <div className="mt-4 p-4 bg-gray-50 rounded">
              <h5 className="font-medium mb-2">Lý do từ chối</h5>
              <textarea
                className="w-full p-2 border rounded mb-2"
                rows={3}
                placeholder="Nhập lý do từ chối..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    onRejectTask?.(task.id, rejectReason);
                    setRejectReason('');
                    setSelectedTask(null);
                  }}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Xác nhận từ chối
                </button>
                <button
                  onClick={() => {
                    setSelectedTask(null);
                    setRejectReason('');
                  }}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                >
                  Hủy
                </button>
              </div>
            </div>
          )}

          {/* Extension request modal */}
          {selectedTask === `ext-${task.id}` && (
            <div className="mt-4 p-4 bg-gray-50 rounded">
              <h5 className="font-medium mb-2">Xin gia hạn deadline</h5>
              <input
                type="date"
                className="w-full p-2 border rounded mb-2"
                value={extensionDate}
                onChange={(e) => setExtensionDate(e.target.value)}
              />
              <textarea
                className="w-full p-2 border rounded mb-2"
                rows={2}
                placeholder="Lý do xin gia hạn..."
                value={extensionReason}
                onChange={(e) => setExtensionReason(e.target.value)}
              />
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    onRequestExtension?.(task.id, extensionDate, extensionReason);
                    setExtensionDate('');
                    setExtensionReason('');
                    setSelectedTask(null);
                  }}
                  className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                >
                  Gửi yêu cầu
                </button>
                <button
                  onClick={() => {
                    setSelectedTask(null);
                    setExtensionDate('');
                    setExtensionReason('');
                  }}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                >
                  Hủy
                </button>
              </div>
            </div>
          )}

          {/* Appeal modal */}
          {selectedTask === `appeal-${task.id}` && (
            <div className="mt-4 p-4 bg-gray-50 rounded">
              <h5 className="font-medium mb-2">Khiếu nại kết quả nghiệm thu</h5>
              <textarea
                className="w-full p-2 border rounded mb-2"
                rows={3}
                placeholder="Nội dung khiếu nại..."
                value={appealMessage}
                onChange={(e) => setAppealMessage(e.target.value)}
              />
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    onAppeal?.(task.id, appealMessage);
                    setAppealMessage('');
                    setSelectedTask(null);
                  }}
                  className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
                >
                  Gửi khiếu nại
                </button>
                <button
                  onClick={() => {
                    setSelectedTask(null);
                    setAppealMessage('');
                  }}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                >
                  Hủy
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
