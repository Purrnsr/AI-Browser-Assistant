import { browser } from 'wxt/browser';

export default defineContentScript({
  matches: ['<all_urls>'],
  main() {
    browser.runtime.onMessage.addListener((request, _sender, sendResponse) => {
      if (request && (request as { action?: string }).action === 'EXTRACT_PAGE_CONTENT') {
        const clone = document.body.cloneNode(true) as HTMLElement;

        // Strip non-content and navigation elements
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

        // Send up to 25,000 characters
        sendResponse({ content: text.slice(0, 25000) });
      }
      return true;
    });
  },
});