import React, { useState } from 'react';
import { CheckCircle, Clock, AlertCircle, XCircle, Upload, Calendar, MessageSquare } from 'lucide-react';
import type { ITaskItem } from '../../core/models';

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
  const [rejectReason, setRejectReason] = useState('');
  const [extensionDate, setExtensionDate] = useState('');
  const [extensionReason, setExtensionReason] = useState('');
  const [appealMessage, setAppealMessage] = useState('');

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
                    <Upload size={14} className="inline mr-1" />
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
              <h5 className="font-medium mb-2">Báo cáo hoàn thành công việc</h5>
              <textarea
                className="w-full p-2 border rounded mb-2"
                rows={3}
                placeholder="Mô tả kết quả và đính kèm link minh chứng..."
                value={evidenceMessage}
                onChange={(e) => setEvidenceMessage(e.target.value)}
              />
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    onTaskComplete(task.id, { message: evidenceMessage });
                    setEvidenceMessage('');
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
