import { defaultExtractContent } from '../src/parser/default';

export default defineContentScript({
  matches: ['<all_urls>'],

  main() {
    console.log('AI Browser Assistant content script loaded.');

    browser.runtime.onMessage.addListener((message) => {
      if (message?.type === 'EXTRACT_PAGE') {
        const html = document.documentElement.outerHTML;
        const url = window.location.href;

        const extractedContent = defaultExtractContent(html, url);

        console.log('Extracted webpage content:', extractedContent);

        return Promise.resolve({
          success: true,
          content: extractedContent,
          url,
          title: document.title,
        });
      }
    });
  },
});