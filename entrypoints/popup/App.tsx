import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './App.css';

function App() {
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const extractPage = async () => {
    setLoading(true);
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
        type: 'EXTRACT_PAGE',
      });

      if (!response?.success) {
        throw new Error('Failed to extract webpage content.');
      }

      setTitle(response.title || '');
      setContent(response.content || '');
    } catch (err) {
      console.error('Page extraction failed:', err);

      setError(
        'Unable to extract this page. Try refreshing the webpage and opening the extension again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>AI Browser Assistant</h1>

        <p className="subtitle">Webpage Content Extractor</p>

        <button
          className="extract-button"
          onClick={extractPage}
          disabled={loading}
        >
          {loading ? 'Extracting...' : 'Extract Page'}
        </button>
      </header>

      {error && <div className="error-message">{error}</div>}

      {!content && !loading && !error && (
        <div className="empty-state">
          <div className="empty-icon">📄</div>
          <h2>Ready to extract</h2>
          <p>
            Open a webpage and click <strong>Extract Page</strong> to view its
            readable content here.
          </p>
        </div>
      )}

      {loading && (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Extracting webpage content...</p>
        </div>
      )}

      {content && !loading && (
        <main className="content-container">
          <div className="document-header">
            <span className="document-label">EXTRACTED PAGE</span>
            <h2>{title || 'Untitled Page'}</h2>
          </div>

          <article className="document-content">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {content}
            </ReactMarkdown>
          </article>
        </main>
      )}
    </div>
  );
}

export default App;