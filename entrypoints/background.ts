import {
  handleExtractEmailActionItemsMessage,
  handleGenerateEmailReplyMessage,
  handleSummarizeEmailMessage,
} from '../src/features/email-assistant/aiHandler';
import type {
  ExtractEmailActionItemsRequest,
  GenerateEmailReplyRequest,
  SummarizeEmailRequest,
} from '../src/features/email-assistant/messages';import { handleGetEmailsMessage } from '../src/features/email-assistant/backgroundHandler';
import type { GetEmailsRequest } from '../src/features/email-assistant/messages';
import { handleSelectedTextMessage } from '../src/features/selected-text/backgroundHandler';
import type { SelectedTextRequest } from '../src/features/selected-text/messages';

import { handleGenerateNotesMessage } from '../src/features/ai-notes/backgroundHandler';
import type { GenerateNotesRequest } from '../src/features/ai-notes/messages';

import { handleGenerateStudyMaterialMessage } from '../src/features/study-material/backgroundHandler';
import type { GenerateStudyMaterialRequest } from '../src/features/study-material/messages';

export default defineBackground(() => {
  console.log('AI Browser Assistant background loaded.');

  browser.runtime.onMessage.addListener((message) => {
    if (message?.type === 'SELECTED_TEXT_PROCESS') {
      return handleSelectedTextMessage(
        message as SelectedTextRequest
      );
    }

    if (message?.type === 'AI_NOTES_GENERATE') {
      return handleGenerateNotesMessage(
        message as GenerateNotesRequest
      );
    }

    if (message?.type === 'STUDY_MATERIAL_GENERATE') {
      return handleGenerateStudyMaterialMessage(
        message as GenerateStudyMaterialRequest
      );
    }
if (message?.type === 'EMAIL_GET_RECENT') {
  return handleGetEmailsMessage(
    message as GetEmailsRequest
  );
}
if (message?.type === 'EMAIL_SUMMARIZE') {
  return handleSummarizeEmailMessage(
    message as SummarizeEmailRequest
  );
}

if (message?.type === 'EMAIL_REPLY_GENERATE') {
  return handleGenerateEmailReplyMessage(
    message as GenerateEmailReplyRequest
  );
}
if (message?.type === 'EMAIL_ACTION_ITEMS_EXTRACT') {
  return handleExtractEmailActionItemsMessage(
    message as ExtractEmailActionItemsRequest
  );
}
  });
});