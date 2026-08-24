import { browser } from 'wxt/browser';

export default defineContentScript({
  matches: ['<all_urls>'],

  main() {
    console.log('AI Browser Assistant content script loaded.');

    browser.runtime.onMessage.addListener((message, _sender, sendResponse) => {
      // Clean HTML extraction logic directly without external dependencies
      const clone = document.body.cloneNode(true) as HTMLElement;
      const removeSelectors = [
        'script',
        'style',
        'noscript',
        'nav',
        'header',
        'footer',
        'aside',
        '.vector-header-container',
        '.vector-toc',
        '#mw-navigation',
      ];
      clone.querySelectorAll(removeSelectors.join(',')).forEach((el) => el.remove());

      const text = (clone.innerText || clone.textContent || '')
        .replace(/\n\s*\n/g, '\n')
        .trim();

      // Handles Prapti's EXTRACT_PAGE action (Promise based)
      if (message?.type === 'EXTRACT_PAGE' || message?.action === 'EXTRACT_PAGE') {
        return Promise.resolve({
          success: true,
          content: text.slice(0, 25000),
          url: window.location.href,
          title: document.title,
        });
      }

      // Handles Q&A's EXTRACT_PAGE_CONTENT action (Callback based)
      if (message?.action === 'EXTRACT_PAGE_CONTENT' || message?.type === 'EXTRACT_PAGE_CONTENT') {
        sendResponse({ content: text.slice(0, 25000) });
      }

      return true;
    });
  },
});