export default defineContentScript({
  matches: ['<all_urls>'],

  main() {
    console.log('[Selected Text UI] content script loaded.');

    let selectedText = '';

    const menu = document.createElement('div');

    menu.id = 'ai-browser-selected-text-menu';

    menu.style.cssText = `
      position: fixed;
      z-index: 2147483647;
      display: none;
      padding: 6px;
      background: white;
      border: 1px solid #ddd;
      border-radius: 8px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
      font-family: Arial, sans-serif;
    `;

    const resultPanel = document.createElement('div');

    resultPanel.id = 'ai-browser-selected-text-result';

    resultPanel.style.cssText = `
      position: fixed;
      z-index: 2147483647;
      display: none;
      width: 420px;
      max-width: calc(100vw - 20px);
      max-height: 300px;
      overflow-y: auto;
      padding: 12px 14px;
      background: white;
      color: #222;
      border: 1px solid #ddd;
      border-radius: 8px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
      font-family: Arial, sans-serif;
      font-size: 14px;
      line-height: 1.5;
      white-space: pre-wrap;
      box-sizing: border-box;
    `;

    const createButton = (
      label: string,
      operation: 'explain' | 'simplify' | 'rephrase'
    ): HTMLButtonElement => {
      const button = document.createElement('button');

      button.textContent = label;
      button.dataset.operation = operation;

      button.style.cssText = `
        border: none;
        background: transparent;
        padding: 7px 10px;
        cursor: pointer;
        font-size: 13px;
        border-radius: 5px;
      `;

      button.addEventListener('mouseenter', () => {
        button.style.background = '#f0f0f0';
      });

      button.addEventListener('mouseleave', () => {
        button.style.background = 'transparent';
      });

      button.addEventListener('click', async () => {
        if (!selectedText) {
          return;
        }

     if (
  operation !== 'explain' &&
  operation !== 'simplify' &&
  operation !== 'rephrase'
) {
  return;
}

        button.disabled = true;
button.textContent =
  operation === 'explain'
    ? 'Explaining...'
    : operation === 'simplify'
      ? 'Simplifying...'
      : 'Rephrasing...';

        resultPanel.textContent = 'Generating explanation...';

        resultPanel.style.position = 'static';
resultPanel.style.display = 'block';
resultPanel.style.marginTop = '8px';

        try {
          const response = await browser.runtime.sendMessage({
            type: 'SELECTED_TEXT_PROCESS',
            text: selectedText,
            operation,
          });
console.log('[Selected Text UI] Background response:', response);
          if (!response?.success) {
            throw new Error(
              response?.error || `Failed to ${operation} selected text.`
            );
          }

         resultPanel.innerHTML = '';

const resultText = document.createElement('div');

resultText.textContent = response.result || '';

resultPanel.appendChild(resultText);

resultPanel.style.display = 'block';
console.log(
  '[Selected Text UI] Result panel:',
  resultPanel,
  'display:',
  resultPanel.style.display,
  'text:',
  resultPanel.textContent
);
        } catch (error) {
          console.error(
            '[Selected Text UI] Explanation failed:',
            error
          );

          resultPanel.textContent =
            error instanceof Error
              ? error.message
              : `Failed to ${operation} selected text.`;
        } finally {
          button.disabled = false;
          button.textContent = label;
        }
      });

      return button;
    };

    menu.appendChild(createButton('Explain', 'explain'));
    menu.appendChild(createButton('Simplify', 'simplify'));
    menu.appendChild(createButton('Rephrase', 'rephrase'));

   menu.appendChild(resultPanel);
document.documentElement.appendChild(menu);

    document.addEventListener('mouseup', () => {
      setTimeout(() => {
        const selection = window.getSelection();
        const text = selection?.toString().trim() || '';

        selectedText = text;

        if (!text) {
          menu.style.display = 'none';
          resultPanel.style.display = 'none';
          return;
        }

        const range = selection?.rangeCount
          ? selection.getRangeAt(0)
          : null;

        if (!range) {
          menu.style.display = 'none';
          resultPanel.style.display = 'none';
          return;
        }

        const rect = range.getBoundingClientRect();

        const menuLeft = Math.min(
          Math.max(10, rect.left),
          window.innerWidth - menu.offsetWidth - 10
        );

        const menuTop = Math.max(
          10,
          rect.bottom + 8
        );

        menu.style.left = `${menuLeft}px`;
        menu.style.top = `${menuTop}px`;
        menu.style.display = 'block';

        resultPanel.style.display = 'none';

        console.log(
          '[Selected Text UI] Selected text:',
          text
        );
      }, 0);
    });

    document.addEventListener('mousedown', (event) => {
      if (!menu.contains(event.target as Node) &&
          !resultPanel.contains(event.target as Node)) {
        menu.style.display = 'none';
        resultPanel.style.display = 'none';
      }
    });
  },
});