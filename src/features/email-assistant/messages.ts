export interface EmailMessage {
  id: string;
  threadId: string;
  subject: string;
  sender: string;
  body: string;
}

export interface GetEmailsRequest {
  type: 'EMAIL_GET_RECENT';
  maxResults?: number;
}

export interface GetEmailsResponse {
  success: boolean;
  emails?: EmailMessage[];
  error?: string;
}

export interface SummarizeEmailRequest {
  type: 'EMAIL_SUMMARIZE';
  email: EmailMessage;
}

export interface SummarizeEmailResponse {
  success: boolean;
  summary?: string;
  error?: string;
}

export interface GenerateEmailReplyRequest {
  type: 'EMAIL_REPLY_GENERATE';
  email: EmailMessage;
  userIntent: string;
  responseStyle?: string;
}

export interface GenerateEmailReplyResponse {
  success: boolean;
  reply?: string;
  error?: string;
}

// =====================================================
// EMAIL ACTION ITEMS & DEADLINES
// =====================================================

export interface EmailActionItem {
  task: string;
  responsibleParty: string;
  dueDate: string;
}

export interface EmailImportantDate {
  date: string;
  event: string;
  context: string;
}

export interface EmailDeadline {
  deadline: string;
  relatedAction: string;
}

export interface EmailActionItemExtraction {
  actionItems: EmailActionItem[];
  importantDates: EmailImportantDate[];
  deadlines: EmailDeadline[];
}

export interface ExtractEmailActionItemsRequest {
  type: 'EMAIL_ACTION_ITEMS_EXTRACT';
  email: EmailMessage;
}

export interface ExtractEmailActionItemsResponse {
  success: boolean;
  extraction?: EmailActionItemExtraction;
  error?: string;
}