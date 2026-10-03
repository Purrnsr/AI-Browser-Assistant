import {
  extractEmailActionItems,
  generateEmailReply,
  summarizeEmail,
} from './ollama';
import type {
  ExtractEmailActionItemsRequest,
  ExtractEmailActionItemsResponse,
  GenerateEmailReplyRequest,
  GenerateEmailReplyResponse,
  EmailActionItemExtraction,
  SummarizeEmailRequest,
  SummarizeEmailResponse,
} from './messages';export const handleSummarizeEmailMessage = async (
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
export const handleExtractEmailActionItemsMessage = async (
  message: ExtractEmailActionItemsRequest
): Promise<ExtractEmailActionItemsResponse> => {
  try {
    const rawResponse = await extractEmailActionItems(
      message.email.subject,
      message.email.sender,
      message.email.body
    );

    let extraction: EmailActionItemExtraction;

    try {
      extraction = JSON.parse(rawResponse) as EmailActionItemExtraction;
    } catch {
      throw new Error(
        'The AI returned an invalid structured response.'
      );
    }

    if (
      !Array.isArray(extraction.actionItems) ||
      !Array.isArray(extraction.importantDates) ||
      !Array.isArray(extraction.deadlines)
    ) {
      throw new Error(
        'The AI response does not match the expected extraction format.'
      );
    }

    return {
      success: true,
      extraction,
    };
  } catch (error) {
    console.error(
      '[Email Assistant] Action-item extraction failed:',
      error
    );

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to extract email action items.',
    };
  }
};