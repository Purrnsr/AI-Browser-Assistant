import { useState } from 'react';

function SelectedText() {
  const [selectedText, setSelectedText] = useState('');
  const [error, setError] = useState('');

  const captureSelectedText = async () => {
    setError('');

    try {
      const tabs = await browser.tabs.query({
        active: true,
        currentWindow: true,
      });

      const activeTab = tabs[0];

      if (!activeTab?.id) {
        throw new Error('No active tab found.');
      }

      const response = await browser.tabs.sendMessage(activeTab.id, {
        type: 'GET_SELECTED_TEXT',
      });

      if (!response?.success) {
        throw new Error('Failed to capture selected text.');
      }

      if (!response.text?.trim()) {
        setError('Please select some text on the webpage first.');
        return;
      }

      setSelectedText(response.text);
    } catch (err) {
      console.error('Selected text capture failed:', err);
      setError(
        'Unable to capture selected text. Refresh the webpage and try again.'
      );
    }
  };

  return (
    <section>
      <h2>Selected Text</h2>

      <button onClick={captureSelectedText}>
        Capture Selected Text
      </button>

      {error && <p>{error}</p>}

      {selectedText && (
        <div>
          <h3>Selected Text</h3>
          <p>{selectedText}</p>
        </div>
      )}
    </section>
  );
}

export default SelectedText;