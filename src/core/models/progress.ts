export interface IProgressCheckin {
  id: string;
  kpiId: string;
  targetId: string;
  currentValue: number;
  targetValue: number;
  completionRate: number;
  note?: string;
  challenges?: string;
  nextSteps?: string;
  attachments?: IAttachment[];
  evidenceFiles?: IAttachment[];
  checkinDate: string;
  checkinBy: string;
  isOnTrack: boolean;
}

export interface IAttachment {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  uploadedAt: string;
}

export interface ICheckinFormValues {
  currentValue: number;
  note?: string;
  challenges?: string;
  nextSteps?: string;
}
