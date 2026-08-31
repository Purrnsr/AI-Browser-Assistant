import { handleSelectedTextMessage } from '../src/features/selected-text/backgroundHandler';
import type { SelectedTextRequest } from '../src/features/selected-text/messages';

export default defineBackground(() => {
  console.log('AI Browser Assistant background loaded.');

  browser.runtime.onMessage.addListener((message) => {
    if (message?.type === 'SELECTED_TEXT_PROCESS') {
      return handleSelectedTextMessage(
        message as SelectedTextRequest
      );
    }
  });
});