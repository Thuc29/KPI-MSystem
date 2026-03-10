export interface ITaskFormValues {
  title: string;
  description?: string;
  deadline: string;
}

export interface ITaskEvidenceFormValues {
  evidenceMessage?: string;
  evidenceFiles?: File[];
}

export interface ITaskExtensionRequest {
  taskId: string;
  newDeadline: string;
  reason: string;
}

export interface ITaskAppeal {
  taskId: string;
  appealMessage: string;
}

export interface ITaskAdjustmentRequest {
  targetId: string;
  action: 'add' | 'edit' | 'delete';
  taskData?: ITaskFormValues;
  taskId?: string;
  reason: string;
}
