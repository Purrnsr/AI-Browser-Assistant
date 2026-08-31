import { getSelectedText } from '../src/services/selectedText';

export default defineContentScript({
  matches: ['<all_urls>'],

  main() {
    console.log('[Selected Text] content script loaded.');

    browser.runtime.onMessage.addListener((message) => {
      if (message?.type === 'GET_SELECTED_TEXT') {
        const text = getSelectedText();

        return Promise.resolve({
          success: true,
          text,
        });
      }
    });
  },
});