import React, { useState } from 'react';
import { Plus, Edit2, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import type { IKPITarget, ITaskItem } from '../../core/models';
import { TaskList } from './TaskList';
import { ProgressBar } from './ProgressBar';
import { calculateTaskCompletionRate } from '../../infrastructure/utils';

interface KPITargetCardProps {
  target: IKPITarget;
  onAddTask?: (targetId: string, taskData: any) => void;
  onTaskComplete?: (taskId: string, evidence: any) => void;
  onVerifyTask?: (taskId: string) => void;
  onRejectTask?: (taskId: string, reason: string) => void;
  onRequestExtension?: (taskId: string, newDeadline: string, reason: string) => void;
  onAppeal?: (taskId: string, message: string) => void;
  onEditTarget?: (target: IKPITarget) => void;
  onDeleteTarget?: (targetId: string) => void;
  isManager?: boolean;
  canEdit?: boolean;
}

export const KPITargetCard: React.FC<KPITargetCardProps> = ({
  target,
  onAddTask,
  onTaskComplete,
  onVerifyTask,
  onRejectTask,
  onRequestExtension,
  onAppeal,
  onEditTarget,
  onDeleteTarget,
  isManager = false,
  canEdit = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', deadline: '' });

  const completionRate = target.tasks 
    ? calculateTaskCompletionRate(target.tasks)
    : target.completionRate || 0;

  const handleAddTask = () => {
    if (newTask.title && newTask.deadline) {
      onAddTask?.(target.id, newTask);
      setNewTask({ title: '', description: '', deadline: '' });
      setShowAddTask(false);
    }
  };

  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold">{target.title}</h3>
            <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700">
              Trọng số: {target.weight}%
            </span>
            {target.category && (
              <span className="text-xs px-2 py-1 rounded bg-gray-100">
                {target.category}
              </span>
            )}
          </div>
          
          {target.description && (
            <p className="text-sm text-gray-600 mb-3">{target.description}</p>
          )}
          
          <div className="grid grid-cols-2 gap-4 text-sm mb-3">
            <div>
              <span className="text-gray-500">Mục tiêu:</span>
              <span className="ml-2 font-medium">{target.target} {target.unit}</span>
            </div>
            {target.startDate && target.endDate && (
              <div>
                <span className="text-gray-500">Thời gian:</span>
                <span className="ml-2">
                  {new Date(target.startDate).toLocaleDateString('vi-VN')} - {new Date(target.endDate).toLocaleDateString('vi-VN')}
                </span>
              </div>
            )}
          </div>

          <ProgressBar
            current={completionRate}
            total={100}
            label="Tiến độ hoàn thành"
            showPercentage={true}
          />
        </div>

        <div className="flex gap-2 ml-4">
          {canEdit && (
            <>
              <button
                onClick={() => onEditTarget?.(target)}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                title="Chỉnh sửa"
              >
                <Edit2 size={16} />
              </button>
              <button
                onClick={() => onDeleteTarget?.(target.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded"
                title="Xóa"
              >
                <Trash2 size={16} />
              </button>
            </>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 text-gray-600 hover:bg-gray-50 rounded"
          >
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="border-t pt-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium">Danh sách công việc ({target.tasks?.length || 0})</h4>
            {canEdit && (
              <button
                onClick={() => setShowAddTask(!showAddTask)}
                className="flex items-center gap-1 px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
              >
                <Plus size={14} />
                Thêm công việc
              </button>
            )}
          </div>

          {showAddTask && (
            <div className="mb-4 p-4 bg-gray-50 rounded">
              <input
                type="text"
                placeholder="Tên công việc *"
                className="w-full p-2 border rounded mb-2"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              />
              <textarea
                placeholder="Mô tả (tùy chọn)"
                className="w-full p-2 border rounded mb-2"
                rows={2}
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              />
              <input
                type="date"
                className="w-full p-2 border rounded mb-2"
                value={newTask.deadline}
                onChange={(e) => setNewTask({ ...newTask, deadline: e.target.value })}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleAddTask}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Thêm
                </button>
                <button
                  onClick={() => {
                    setShowAddTask(false);
                    setNewTask({ title: '', description: '', deadline: '' });
                  }}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                >
                  Hủy
                </button>
              </div>
            </div>
          )}

          {target.tasks && target.tasks.length > 0 ? (
            <TaskList
              tasks={target.tasks}
              onTaskComplete={onTaskComplete!}
              onVerifyTask={onVerifyTask}
              onRejectTask={onRejectTask}
              onRequestExtension={onRequestExtension}
              onAppeal={onAppeal}
              isManager={isManager}
            />
          ) : (
            <div className="text-center py-8 text-gray-500">
              Chưa có công việc nào. Hãy thêm công việc để bắt đầu theo dõi tiến độ.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
