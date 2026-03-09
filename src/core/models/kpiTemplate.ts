export interface IKPITemplate {
  id: string;
  category: string;
  department: string;
  position: string;
  title: string;
  description: string;
  suggestedWeight: number;
  target: string;
  unit: string;
  measurementMethod: string;
  evaluationCriteria: string;
  usageCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface IKPITemplateFormValues {
  category: string;
  department: string;
  position: string;
  title: string;
  description: string;
  suggestedWeight: number;
  target: string;
  unit: string;
  measurementMethod: string;
  evaluationCriteria: string;
}
