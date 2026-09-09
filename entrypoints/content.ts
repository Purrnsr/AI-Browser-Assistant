import { browser } from 'wxt/browser';
import { defaultExtractContent } from '../src/parser/default';
import { extractPageImages } from '../src/features/ai-notes/images';

export default defineContentScript({
  matches: ['<all_urls>'],

  main() {
    console.log('AI Browser Assistant content script loaded.');

    browser.runtime.onMessage.addListener((message, _sender, sendResponse) => {
      if (
        message?.type === 'EXTRACT_PAGE' ||
        message?.action === 'EXTRACT_PAGE'
      ) {
        try {
          const html = document.documentElement.outerHTML;

          const content = defaultExtractContent(
            html,
            window.location.href
          );

          const images = extractPageImages();

          console.log(
            '[Extraction] Structured content length:',
            content.length
          );

          console.log(
            '[Extraction] Images extracted:',
            images.length
          );

          return Promise.resolve({
            success: true,
            content: content.slice(0, 25000),
            images,
            url: window.location.href,
            title: document.title,
          });
        } catch (error) {
          console.error(
            '[Extraction] Structured extraction failed:',
            error
          );

          return Promise.resolve({
            success: false,
            error: 'Failed to extract webpage content.',
          });
        }
      }

      if (
        message?.action === 'EXTRACT_PAGE_CONTENT' ||
        message?.type === 'EXTRACT_PAGE_CONTENT'
      ) {
        try {
          const html = document.documentElement.outerHTML;

          const content = defaultExtractContent(
            html,
            window.location.href
          );

          sendResponse({
            content: content.slice(0, 25000),
          });
        } catch (error) {
          console.error(
            '[Extraction] Content extraction failed:',
            error
          );

          sendResponse({
            content: '',
          });
        }
      }

      return true;
    });
  },
});