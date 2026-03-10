import type { 
  ITaskItem, 
  ITaskFormValues, 
  ITaskEvidenceFormValues,
  ITaskExtensionRequest,
  ITaskAppeal,
  ITaskAdjustmentRequest,
  IBackendRes 
} from '../../core/models';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock task operations
export const mockTaskApi = {
  // Get tasks by target
  getTasksByTarget: async (targetId: string): Promise<IBackendRes<ITaskItem[]>> => {
    await delay(300);
    // This would be populated from KPI targets
    return {
      message: 'Tasks retrieved successfully',
      statusCode: 200,
      data: [],
    };
  },

  // Create new task
  createTask: async (targetId: string, taskData: ITaskFormValues): Promise<IBackendRes<ITaskItem>> => {
    await delay(500);
    const newTask: ITaskItem = {
      id: `task-${Date.now()}`,
      ...taskData,
      status: 'to_do',
    };
    return {
      message: 'Task created successfully',
      statusCode: 201,
      data: newTask,
    };
  },

  // Update task
  updateTask: async (taskId: string, taskData: Partial<ITaskItem>): Promise<IBackendRes<ITaskItem>> => {
    await delay(500);
    return {
      message: 'Task updated successfully',
      statusCode: 200,
      data: { id: taskId, ...taskData } as ITaskItem,
    };
  },

  // Submit task completion with evidence
  submitTaskCompletion: async (
    taskId: string, 
    evidence: ITaskEvidenceFormValues
  ): Promise<IBackendRes<ITaskItem>> => {
    await delay(500);
    return {
      message: 'Task submitted for verification',
      statusCode: 200,
      data: {
        id: taskId,
        status: 'pending_verify',
        completedAt: new Date().toISOString(),
        evidenceMessage: evidence.evidenceMessage,
        evidenceFiles: evidence.evidenceFiles?.map((file, idx) => ({
          id: `file-${idx}`,
          fileName: file.name,
          fileUrl: URL.createObjectURL(file),
          fileSize: file.size,
          uploadedAt: new Date().toISOString(),
        })),
      } as ITaskItem,
    };
  },

  // Verify task (Manager)
  verifyTask: async (taskId: string, verifierId: string): Promise<IBackendRes<ITaskItem>> => {
    await delay(500);
    return {
      message: 'Task verified successfully',
      statusCode: 200,
      data: {
        id: taskId,
        status: 'verified',
        verifiedAt: new Date().toISOString(),
        verifiedBy: verifierId,
      } as ITaskItem,
    };
  },

  // Reject task (Manager)
  rejectTask: async (
    taskId: string, 
    rejectorId: string, 
    reason: string
  ): Promise<IBackendRes<ITaskItem>> => {
    await delay(500);
    return {
      message: 'Task rejected',
      statusCode: 200,
      data: {
        id: taskId,
        status: 'to_do',
        rejectedAt: new Date().toISOString(),
        rejectedBy: rejectorId,
        rejectionReason: reason,
        completedAt: undefined,
        evidenceMessage: undefined,
        evidenceFiles: undefined,
      } as ITaskItem,
    };
  },

  // Request deadline extension
  requestExtension: async (request: ITaskExtensionRequest): Promise<IBackendRes<ITaskItem>> => {
    await delay(500);
    return {
      message: 'Extension request submitted',
      statusCode: 200,
      data: {
        id: request.taskId,
        extensionRequested: true,
        extensionReason: request.reason,
        newDeadline: request.newDeadline,
      } as ITaskItem,
    };
  },

  // Approve extension (Manager)
  approveExtension: async (taskId: string): Promise<IBackendRes<ITaskItem>> => {
    await delay(500);
    return {
      message: 'Extension approved',
      statusCode: 200,
      data: {
        id: taskId,
        extensionRequested: false,
      } as ITaskItem,
    };
  },

  // Appeal task rejection
  appealTask: async (appeal: ITaskAppeal): Promise<IBackendRes<ITaskItem>> => {
    await delay(500);
    return {
      message: 'Appeal submitted to higher management',
      statusCode: 200,
      data: {
        id: appeal.taskId,
        appealMessage: appeal.appealMessage,
        appealedAt: new Date().toISOString(),
      } as ITaskItem,
    };
  },

  // Request task adjustment (add/edit/delete)
  requestAdjustment: async (request: ITaskAdjustmentRequest): Promise<IBackendRes<any>> => {
    await delay(500);
    return {
      message: 'Adjustment request submitted',
      statusCode: 200,
      data: request,
    };
  },

  // Delete task
  deleteTask: async (taskId: string): Promise<IBackendRes<null>> => {
    await delay(500);
    return {
      message: 'Task deleted successfully',
      statusCode: 200,
      data: null,
    };
  },
};
