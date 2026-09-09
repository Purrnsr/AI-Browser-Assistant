import { handleSelectedTextMessage } from '../src/features/selected-text/backgroundHandler';
import type { SelectedTextRequest } from '../src/features/selected-text/messages';

import { handleGenerateNotesMessage } from '../src/features/ai-notes/backgroundHandler';
import type { GenerateNotesRequest } from '../src/features/ai-notes/messages';

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
  });
});