export interface GenerateNotesRequest {
  type: 'AI_NOTES_GENERATE';
  content: string;
}

export interface GenerateNotesResponse {
  success: boolean;
  notes?: string;
  error?: string;
}