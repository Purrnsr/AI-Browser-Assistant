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
      operation: 'explain' | 'simplify' | 'rephrase' | 'translate'
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
        if (!button.disabled) {
          button.style.background = '#f0f0f0';
        }
      });

      button.addEventListener('mouseleave', () => {
        button.style.background = 'transparent';
      });

      button.addEventListener('click', async () => {
        if (!selectedText) {
          return;
        }

        /*
         * TRANSLATION
         */
        if (operation === 'translate') {
          console.log(
            '[Selected Text UI] Translate button clicked.'
          );

          /*
           * Remove any previous translation UI.
           */
          const oldTranslationBox =
            menu.querySelector(
              '[data-translation-box="true"]'
            );

          oldTranslationBox?.remove();

          /*
           * Create translation UI directly
           * inside the selection menu.
           */
          const translationBox =
            document.createElement('div');

          translationBox.dataset.translationBox = 'true';

          translationBox.style.cssText = `
            margin-top: 8px;
            padding-top: 10px;
            border-top: 1px solid #eee;
            width: 260px;
            box-sizing: border-box;
          `;

          const languageLabel =
            document.createElement('div');

          languageLabel.textContent = 'Translate to:';

          languageLabel.style.cssText = `
            font-size: 13px;
            font-weight: 600;
            margin-bottom: 6px;
            color: #222;
          `;

          const languageSelect =
            document.createElement('select');

          languageSelect.style.cssText = `
            width: 100%;
            padding: 7px;
            border: 1px solid #ccc;
            border-radius: 6px;
            font-size: 13px;
            background: white;
            color: #222;
            box-sizing: border-box;
          `;

          const languages = [
            'Hindi',
            'English',
            'French',
            'Spanish',
            'German',
            'Italian',
            'Portuguese',
            'Japanese',
            'Korean',
            'Chinese',
            'Arabic',
            'Russian',
          ];

          languages.forEach((language) => {
            const option =
              document.createElement('option');

            option.value = language;
            option.textContent = language;

            languageSelect.appendChild(option);
          });

          const translateButton =
            document.createElement('button');

          translateButton.textContent = 'Translate';

          translateButton.style.cssText = `
            width: 100%;
            margin-top: 8px;
            padding: 8px;
            border: none;
            border-radius: 6px;
            background: #f0f0f0;
            color: #222;
            cursor: pointer;
            font-size: 13px;
          `;

          const cancelButton =
            document.createElement('button');

          cancelButton.textContent = 'Cancel';

          cancelButton.style.cssText = `
            width: 100%;
            margin-top: 4px;
            padding: 6px;
            border: none;
            background: transparent;
            color: #666;
            cursor: pointer;
            font-size: 12px;
          `;

          translationBox.appendChild(languageLabel);
          translationBox.appendChild(languageSelect);
          translationBox.appendChild(translateButton);
          translationBox.appendChild(cancelButton);

          menu.appendChild(translationBox);

          console.log(
            '[Selected Text UI] Translation options displayed.'
          );

          /*
           * Translate selected text.
           */
          translateButton.addEventListener(
            'click',
            async () => {
              const targetLanguage =
                languageSelect.value;

              console.log(
                '[Selected Text UI] Translating to:',
                targetLanguage
              );

              translateButton.disabled = true;
              languageSelect.disabled = true;
              cancelButton.disabled = true;

              translateButton.textContent =
                'Translating...';

              translationBox.innerHTML = '';

              const loadingText =
                document.createElement('div');

              loadingText.textContent =
                'Generating translation...';

              loadingText.style.cssText = `
                color: #222;
                font-size: 13px;
              `;

              translationBox.appendChild(
                loadingText
              );

              try {
                const response =
                  await browser.runtime.sendMessage({
                    type: 'SELECTED_TEXT_PROCESS',
                    text: selectedText,
                    operation: 'translate',
                    targetLanguage,
                  });

                console.log(
                  '[Selected Text UI] Translation response:',
                  response
                );

                if (!response?.success) {
                  throw new Error(
                    response?.error ||
                      'Failed to translate selected text.'
                  );
                }

                translationBox.innerHTML = '';

                const resultTitle =
                  document.createElement('div');

                resultTitle.textContent =
                  'Translation:';

                resultTitle.style.cssText = `
                  font-weight: 600;
                  margin-bottom: 6px;
                  color: #222;
                  font-size: 13px;
                `;

                const resultText =
                  document.createElement('div');

                resultText.textContent =
                  response.result || '';

                resultText.style.cssText = `
                  color: #222;
                  white-space: pre-wrap;
                  line-height: 1.5;
                  font-size: 14px;
                `;

                translationBox.appendChild(
                  resultTitle
                );

                translationBox.appendChild(
                  resultText
                );

                console.log(
                  '[Selected Text UI] Translation displayed.'
                );
              } catch (error) {
                console.error(
                  '[Selected Text UI] Translation failed:',
                  error
                );

                translationBox.innerHTML = '';

                const errorText =
                  document.createElement('div');

                errorText.textContent =
                  error instanceof Error
                    ? error.message
                    : 'Failed to translate selected text.';

                errorText.style.cssText = `
                  color: #b00020;
                  white-space: pre-wrap;
                  font-size: 13px;
                `;

                translationBox.appendChild(
                  errorText
                );
              }
            }
          );

          /*
           * Cancel translation.
           */
          cancelButton.addEventListener(
            'click',
            () => {
              translationBox.remove();
            }
          );

          return;
        }

        /*
         * EXISTING EXPLAIN / SIMPLIFY / REPHRASE
         */
        button.disabled = true;

        button.textContent =
          operation === 'explain'
            ? 'Explaining...'
            : operation === 'simplify'
              ? 'Simplifying...'
              : 'Rephrasing...';

        resultPanel.textContent =
          operation === 'explain'
            ? 'Generating explanation...'
            : operation === 'simplify'
              ? 'Generating simplified text...'
              : 'Generating rephrased text...';

        resultPanel.style.display = 'block';

        try {
          const response =
            await browser.runtime.sendMessage({
              type: 'SELECTED_TEXT_PROCESS',
              text: selectedText,
              operation,
            });

          console.log(
            '[Selected Text UI] Background response:',
            response
          );

          if (!response?.success) {
            throw new Error(
              response?.error ||
                `Failed to ${operation} selected text.`
            );
          }

          resultPanel.innerHTML = '';

          const resultText =
            document.createElement('div');

          resultText.textContent =
            response.result || '';

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
            '[Selected Text UI] Processing failed:',
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

    menu.appendChild(
      createButton('Explain', 'explain')
    );

    menu.appendChild(
      createButton('Simplify', 'simplify')
    );

    menu.appendChild(
      createButton('Rephrase', 'rephrase')
    );

    menu.appendChild(
      createButton('Translate', 'translate')
    );

    menu.appendChild(resultPanel);

    document.documentElement.appendChild(menu);

    document.addEventListener('mouseup', (event) => {
  /*
   * Ignore mouse events that happen inside
   * the AI selected-text menu.
   *
   * Otherwise clicking Translate causes the
   * selection handler to run again and hide
   * the translation UI.
   */
      if (menu.contains(event.target as Node)) {
        return;
      }

      setTimeout(() => {
        const selection = window.getSelection();
        const text =
          selection?.toString().trim() || '';

        selectedText = text;

        if (!text) {
          menu.style.display = 'none';
          resultPanel.style.display = 'none';

          const translationBox =
            menu.querySelector(
              '[data-translation-box="true"]'
            );

          translationBox?.remove();

          return;
        }

        const range = selection?.rangeCount
          ? selection.getRangeAt(0)
          : null;

        if (!range) {
          menu.style.display = 'none';
          resultPanel.style.display = 'none';

          const translationBox =
            menu.querySelector(
              '[data-translation-box="true"]'
            );

          translationBox?.remove();

          return;
        }

        const rect =
          range.getBoundingClientRect();

        const menuLeft = Math.min(
          Math.max(10, rect.left),
          window.innerWidth -
            menu.offsetWidth -
            10
        );

        const menuTop = Math.max(
          10,
          rect.bottom + 8
        );

        menu.style.left =
          `${menuLeft}px`;

        menu.style.top =
          `${menuTop}px`;

        menu.style.display = 'block';

        resultPanel.style.display = 'none';
        resultPanel.innerHTML = '';

        const translationBox =
          menu.querySelector(
            '[data-translation-box="true"]'
          );

        translationBox?.remove();

        console.log(
          '[Selected Text UI] Selected text:',
          text
        );
      }, 0);
    });

    document.addEventListener(
      'mousedown',
      (event) => {
        if (
          !menu.contains(
            event.target as Node
          )
        ) {
          menu.style.display = 'none';
          resultPanel.style.display = 'none';

          const translationBox =
            menu.querySelector(
              '[data-translation-box="true"]'
            );

          translationBox?.remove();
        }
      }
    );
  },
});
