import type { IKPITarget, ITaskItem } from '../../core/models';

/**
 * Calculate completion rate based on verified tasks
 */
export const calculateTaskCompletionRate = (tasks: ITaskItem[]): number => {
  if (!tasks || tasks.length === 0) return 0;
  
  const verifiedTasks = tasks.filter(task => task.status === 'verified').length;
  return Math.round((verifiedTasks / tasks.length) * 100);
};

/**
 * Calculate overall KPI completion rate based on all targets
 */
export const calculateKPICompletionRate = (targets: IKPITarget[]): number => {
  if (!targets || targets.length === 0) return 0;
  
  let totalWeight = 0;
  let weightedCompletion = 0;
  
  targets.forEach(target => {
    const completionRate = target.tasks 
      ? calculateTaskCompletionRate(target.tasks)
      : target.completionRate || 0;
    
    totalWeight += target.weight;
    weightedCompletion += (completionRate * target.weight);
  });
  
  return totalWeight > 0 ? Math.round(weightedCompletion / totalWeight) : 0;
};

/**
 * Check if task is overdue
 */
export const isTaskOverdue = (task: ITaskItem): boolean => {
  if (task.status === 'verified') return false;
  return new Date(task.deadline) < new Date();
};

/**
 * Get overdue tasks count
 */
export const getOverdueTasksCount = (tasks: ITaskItem[]): number => {
  return tasks.filter(isTaskOverdue).length;
};

/**
 * Get tasks by status
 */
export const getTasksByStatus = (tasks: ITaskItem[], status: string): ITaskItem[] => {
  return tasks.filter(task => task.status === status);
};

/**
 * Get pending verification tasks count
 */
export const getPendingVerificationCount = (tasks: ITaskItem[]): number => {
  return tasks.filter(task => task.status === 'pending_verify').length;
};

/**
 * Update target completion rate based on tasks
 */
export const updateTargetCompletionFromTasks = (target: IKPITarget): IKPITarget => {
  if (!target.tasks || target.tasks.length === 0) {
    return target;
  }
  
  const completionRate = calculateTaskCompletionRate(target.tasks);
  
  return {
    ...target,
    completionRate,
    currentValue: completionRate,
  };
};

/**
 * Check if user can verify task (is direct manager)
 */
export const canVerifyTask = (userId: string, managerId?: string): boolean => {
  return userId === managerId;
};

/**
 * Get task status color
 */
export const getTaskStatusColor = (status: string): string => {
  switch (status) {
    case 'verified':
      return 'green';
    case 'pending_verify':
      return 'yellow';
    case 'overdue':
      return 'red';
    case 'to_do':
    default:
      return 'gray';
  }
};

/**
 * Format task deadline display
 */
export const formatDeadline = (deadline: string): string => {
  const date = new Date(deadline);
  const now = new Date();
  const diffTime = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) {
    return `Quá hạn ${Math.abs(diffDays)} ngày`;
  } else if (diffDays === 0) {
    return 'Hôm nay';
  } else if (diffDays === 1) {
    return 'Ngày mai';
  } else if (diffDays <= 7) {
    return `Còn ${diffDays} ngày`;
  }
  
  return date.toLocaleDateString('vi-VN');
};
