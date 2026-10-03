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