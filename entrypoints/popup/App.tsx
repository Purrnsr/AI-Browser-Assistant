import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { browser } from 'wxt/browser';
import { ContextQA } from './ContextQA';
import './App.css';

async function summarizeTextDirect(text: string): Promise<string> {
  const response = await fetch("http://localhost:11434/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "llama3.2",
      prompt: `Summarize the following webpage content concisely into key takeaways:\n\n${text.slice(0, 8000)}`,
      stream: false,
    }),
  });
  const data = await response.json();
  return data.response;
}

function App() {
  const [activeTab, setActiveTab] = useState<'summarize' | 'qa'>('qa');

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
      setError('Unable to extract this page. Try refreshing the webpage and opening the extension again.');
    } finally {
      setLoading(false);
    }
  };

  const summarizePage = async () => {
    if (!content.trim()) {
      setError('Please extract the webpage before generating a summary.');
      return;
    }

    setSummarizing(true);
    setError('');

    try {
      const result = await summarizeTextDirect(content);
      setSummary(result);
    } catch (err) {
      console.error('Page summarization failed:', err);
      setError('Unable to generate the summary. Make sure Ollama is running and the llama3.2 model is available.');
    } finally {
      setSummarizing(false);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h2 style={{ margin: '0 0 10px 0', fontSize: '16px', textAlign: 'center' }}>AI Browser Assistant</h2>

        <div className="tab-container">
          <button
            className={`tab-btn ${activeTab === 'summarize' ? 'active' : ''}`}
            onClick={() => setActiveTab('summarize')}
          >
            Summarizer
          </button>
          <button
            className={`tab-btn ${activeTab === 'qa' ? 'active' : ''}`}
            onClick={() => setActiveTab('qa')}
          >
            Context Q&A
          </button>
        </div>
      </header>

      {/* Tab 1: Summarizer */}
      {activeTab === 'summarize' && (
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '10px', flexShrink: 0 }}>
            <button
              onClick={extractPage}
              disabled={loading || summarizing}
              style={{
                flex: 1,
                padding: '8px',
                background: '#2563eb',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '12.5px',
              }}
            >
              {loading ? 'Extracting...' : 'Extract Page'}
            </button>

            {content && !loading && (
              <button
                onClick={summarizePage}
                disabled={summarizing}
                style={{
                  flex: 1,
                  padding: '8px',
                  background: '#059669',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '12.5px',
                }}
              >
                {summarizing ? 'Summarizing...' : 'Summarize Page'}
              </button>
            )}
          </div>

          {error && <div style={{ color: '#dc2626', fontSize: '12px', marginBottom: '8px' }}>{error}</div>}

          {!content && !loading && !error && (
            <div style={{ textAlign: 'center', color: '#64748b', padding: '30px 0' }}>
              <div style={{ fontSize: '24px', marginBottom: '6px' }}>📄</div>
              <p style={{ fontSize: '12.5px', margin: 0 }}>Click <strong>Extract Page</strong> to view content.</p>
            </div>
          )}

          {loading && (
            <div style={{ textAlign: 'center', padding: '20px', color: '#64748b', fontSize: '12.5px' }}>
              Extracting webpage content...
            </div>
          )}

          {content && !loading && (
            <div style={{ flex: 1, overflowY: 'auto', fontSize: '12px' }}>
              {summary && (
                <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '6px', marginBottom: '10px' }}>
                  <strong style={{ color: '#0f172a' }}>AI SUMMARY</strong>
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{summary}</ReactMarkdown>
                </div>
              )}

              <div>
                <strong style={{ color: '#0f172a' }}>EXTRACTED CONTENT</strong>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Context Q&A */}
      {activeTab === 'qa' && <ContextQA />}
    </div>
  );
}

export default App;