import {
  generateEmailReply,
  summarizeEmail,
} from './ollama';

import type {
  GenerateEmailReplyRequest,
  GenerateEmailReplyResponse,
  SummarizeEmailRequest,
  SummarizeEmailResponse,
} from './messages';

export const handleSummarizeEmailMessage = async (
  message: SummarizeEmailRequest
): Promise<SummarizeEmailResponse> => {
  try {
    const summary = await summarizeEmail(
      message.email.subject,
      message.email.sender,
      message.email.body
    );

    return {
      success: true,
      summary,
    };
  } catch (error) {
    console.error(
      '[Email Assistant] Email summarization failed:',
      error
    );

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to summarize email.',
    };
  }
};

export const handleGenerateEmailReplyMessage = async (
  message: GenerateEmailReplyRequest
): Promise<GenerateEmailReplyResponse> => {
  try {
    const reply = await generateEmailReply(
      message.email.subject,
      message.email.sender,
      message.email.body,
      message.userIntent,
      message.responseStyle ?? ''
    );

    return {
      success: true,
      reply,
    };
  } catch (error) {
    console.error(
      '[Email Assistant] Reply generation failed:',
      error
    );

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to generate email reply.',
    };
  }
};