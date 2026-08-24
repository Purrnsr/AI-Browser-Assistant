import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { summarizeText } from '../../src/services/ollama';
import './App.css';

function App() {
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [summarizing, setSummarizing] = useState(false);
  const [error, setError] = useState('');

  const extractPage = async () => {
    setLoading(true);
    setError('');
    setSummary('');

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
      console.log('[Extraction] Content preview:', response.content?.slice(0, 5000));
    } catch (err) {
      console.error('Page extraction failed:', err);

      setError(
        'Unable to extract this page. Try refreshing the webpage and opening the extension again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const summarizePage = async () => {
    if (!content.trim()) {
      setError('Please extract the webpage before generating a summary.');
      return;
    }
    // TEMPORARY DEBUGGING
    console.log('===== SUMMARIZATION DEBUG =====');
    console.log('Content length:', content.length);
    console.log('Content preview:', content.slice(0, 1000));
    console.log('Starting summarizeText()...');

    setSummarizing(true);
    setError('');

    try {
      console.log('Summarization content length:', content.length);
      const result = await summarizeText(content);
      // TEMPORARY DEBUGGING
      console.log('summarizeText() completed');
      console.log('Summary length:', result.length);
      console.log('Summary:', result);
      setSummary(result);
    } catch (err) {
      console.error('Page summarization failed:', err);

      setError(
        'Unable to generate the summary. Make sure Ollama is running and the llama3.2:latest model is available.'
      );
    } finally {
      setSummarizing(false);
      console.log('===== SUMMARIZATION FINISHED =====');
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>AI Browser Assistant</h1>

        <p className="subtitle">Webpage Content Extractor</p>

        <div className="action-buttons">
          <button
            className="extract-button"
            onClick={extractPage}
            disabled={loading || summarizing}
          >
            {loading ? 'Extracting...' : 'Extract Page'}
          </button>

          {content && !loading && (
            <button
              className="summarize-button"
              onClick={summarizePage}
              disabled={summarizing}
            >
              {summarizing ? 'Generating Summary...' : 'Summarize Page'}
            </button>
          )}
        </div>
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

          {summary && (
            <section className="summary-container">
              <div className="summary-header">
                <span className="summary-label">AI SUMMARY</span>
              </div>

              <article className="summary-content">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {summary}
                </ReactMarkdown>
              </article>
            </section>
          )}

          <section className="document-container">
            <div className="document-section-header">
              <span className="document-label">EXTRACTED CONTENT</span>
            </div>

            <article className="document-content">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {content}
              </ReactMarkdown>
            </article>
          </section>
        </main>
      )}
    </div>
  );
}

export default App;