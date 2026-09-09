export interface GenerateStudyMaterialRequest {
  type: 'STUDY_MATERIAL_GENERATE';
  content: string;
}

export interface GenerateStudyMaterialResponse {
  success: boolean;
  studyMaterial?: string;
  error?: string;
}