import { KnowledgeBase } from './KnowledgeBase';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { browser } from 'wxt/browser';
import { ContextQA } from './ContextQA';
import { AINotes } from './AINotes';
import { StudyMaterial } from './StudyMaterial';
import { EmailAssistant } from './EmailAssistant';
import { WebResearchPanel } from '../../src/components/research/WebResearchPanel';

import './App.css';

interface ExtractedImage {
  src: string;
  alt: string;
  caption: string;
}

async function summarizeTextDirect(text: string): Promise<string> {
  const response = await fetch(
    'http://localhost:11434/api/generate',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3.2',
        prompt: `Summarize the following webpage content concisely into key takeaways:\n\n${text.slice(
          0,
          8000
        )}`,
        stream: false,
      }),
    }
  );

  const data = await response.json();
  return data.response;
}

function App() {
  const [activeTab, setActiveTab] = useState<
    'summarize' | 'study' | 'knowledge' | 'qa' | 'email' | 'research'
  >('summarize');

  const [summarizerView, setSummarizerView] = useState<
    'extracted' | 'summary'
  >('extracted');
  const [studyView, setStudyView] = useState<
    'notes' | 'studyMaterial'
  >('notes');

  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [images, setImages] = useState<ExtractedImage[]>([]);
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

      if (!activeTab) {
        throw new Error('No active tab found.');
      }

      setSourceUrl(activeTab.url || '');

      if (!activeTab.id) {
        throw new Error('No active tab found.');
      }

      const response = await browser.tabs.sendMessage(
        activeTab.id,
        {
          type: 'EXTRACT_PAGE',
        }
      );

      if (!response?.success) {
        throw new Error(
          'Failed to extract webpage content.'
        );
      }

      setTitle(response.title || '');
      setContent(response.content || '');
      setImages(response.images || []);

      console.log(
        '[Extraction] Images extracted:',
        response.images?.length || 0
      );

      console.log(
        '[Extraction] Content preview:',
        response.content?.slice(0, 5000)
      );
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
      setError(
        'Please extract the webpage before generating a summary.'
      );
      return;
    }

    setSummarizing(true);
    setError('');

    try {
      const result = await summarizeTextDirect(content);
      setSummary(result);
    } catch (err) {
      console.error(
        'Page summarization failed:',
        err
      );

      setError(
        'Unable to generate the summary. Make sure Ollama is running and the llama3.2 model is available.'
      );
    } finally {
      setSummarizing(false);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h2
          style={{
            margin: '0 0 10px 0',
            fontSize: '16px',
            textAlign: 'center',
          }}
        >
          AI Browser Assistant
        </h2>

        {/* Primary Navigation */}
        <div className="tab-container">
          <button
            className={`tab-btn ${
              activeTab === 'summarize' ? 'active' : ''
            }`}
            onClick={() => setActiveTab('summarize')}
          >
            Summarizer
          </button>

          <button
            className={`tab-btn ${
              activeTab === 'study' ? 'active' : ''
            }`}
            onClick={() => setActiveTab('study')}
          >
            Study & Notes
          </button>

          <button
            className={`tab-btn ${
              activeTab === 'knowledge' ? 'active' : ''
            }`}
            onClick={() => setActiveTab('knowledge')}
          >
            Knowledge Base
          </button>

          <button
            className={`tab-btn ${
              activeTab === 'qa' ? 'active' : ''
            }`}
            onClick={() => setActiveTab('qa')}
          >
            Context Q&A
          </button>

          <button
            className={`tab-btn ${
              activeTab === 'email' ? 'active' : ''
            }`}
            onClick={() => setActiveTab('email')}
          >
            Email Assistant
          </button>

          <button
            className={`tab-btn ${
              activeTab === 'research' ? 'active' : ''
            }`}
            onClick={() => setActiveTab('research')}
          >
            Web Research
          </button>
        </div>
      </header>

      {/* =====================================================
          TAB 1: SUMMARIZER
          ===================================================== */}
      {activeTab === 'summarize' && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            overflow: 'hidden',
          }}
        >
          {/* Summarizer Secondary Navigation */}
          <div
            style={{
              display: 'flex',
              borderBottom: '1px solid #e2e8f0',
              marginBottom: '10px',
              flexShrink: 0,
            }}
          >
            <button
              onClick={() =>
                setSummarizerView('extracted')
              }
              style={{
                flex: 1,
                padding: '7px 0',
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                fontSize: '11.5px',
                fontWeight:
                  summarizerView === 'extracted'
                    ? 600
                    : 500,
                color:
                  summarizerView === 'extracted'
                    ? '#2563eb'
                    : '#64748b',
                borderBottom:
                  summarizerView === 'extracted'
                    ? '2px solid #2563eb'
                    : '2px solid transparent',
              }}
            >
              Extracted Page
            </button>

            <button
              onClick={() =>
                setSummarizerView('summary')
              }
              style={{
                flex: 1,
                padding: '7px 0',
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                fontSize: '11.5px',
                fontWeight:
                  summarizerView === 'summary'
                    ? 600
                    : 500,
                color:
                  summarizerView === 'summary'
                    ? '#2563eb'
                    : '#64748b',
                borderBottom:
                  summarizerView === 'summary'
                    ? '2px solid #2563eb'
                    : '2px solid transparent',
              }}
            >
              AI Summary
            </button>
          </div>

          {/* Error */}
          {error && (
            <div
              style={{
                color: '#dc2626',
                fontSize: '12px',
                marginBottom: '8px',
              }}
            >
              {error}
            </div>
          )}

          {/* Current temporary content */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              fontSize: '12px',
            }}
          >
            {/* Extracted Page View */}
            {summarizerView === 'extracted' && (
              <div>
                <button
                  onClick={extractPage}
                  disabled={loading || summarizing}
                  style={{
                    width: '100%',
                    padding: '8px',
                    background: '#2563eb',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    cursor:
                      loading || summarizing
                        ? 'default'
                        : 'pointer',
                    fontSize: '12.5px',
                  }}
                >
                  {loading
                    ? 'Extracting...'
                    : 'Extract Page'}
                </button>

                {loading && (
                  <div
                    style={{
                      textAlign: 'center',
                      padding: '20px',
                      color: '#64748b',
                      fontSize: '12.5px',
                    }}
                  >
                    Extracting webpage content...
                  </div>
                )}

                {!content &&
                  !loading &&
                  !error && (
                    <div
                      style={{
                        textAlign: 'center',
                        color: '#64748b',
                        padding: '30px 0',
                      }}
                    >
                      <div
                        style={{
                          fontSize: '24px',
                          marginBottom: '6px',
                        }}
                      >
                        📄
                      </div>

                      <p
                        style={{
                          fontSize: '12.5px',
                          margin: 0,
                        }}
                      >
                        Click{' '}
                        <strong>
                          Extract Page
                        </strong>{' '}
                        to view content.
                      </p>
                    </div>
                  )}

                {content && !loading && (
                  <div style={{ marginTop: '10px' }}>
                    <strong
                      style={{
                        color: '#0f172a',
                      }}
                    >
                      EXTRACTED CONTENT
                    </strong>

                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                    >
                      {content}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
            )}

            {/* AI Summary View */}
            {summarizerView === 'summary' && (
              <div>
                <button
                  onClick={summarizePage}
                  disabled={
                    summarizing || !content.trim()
                  }
                  style={{
                    width: '100%',
                    padding: '8px',
                    background: '#059669',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    cursor:
                      summarizing || !content.trim()
                        ? 'default'
                        : 'pointer',
                    fontSize: '12.5px',
                  }}
                >
                  {summarizing
                    ? 'Generating Summary...'
                    : 'Generate Summary'}
                </button>

                {!content.trim() && (
                  <div
                    style={{
                      textAlign: 'center',
                      color: '#64748b',
                      padding: '30px 0',
                      fontSize: '12px',
                    }}
                  >
                    Extract the webpage first from the{' '}
                    <strong>Extracted Page</strong> tab.
                  </div>
                )}

                {summary && !summarizing && (
                  <div
                    style={{
                      marginTop: '10px',
                      background: '#f8fafc',
                      padding: '10px',
                      borderRadius: '6px',
                      border:
                        '1px solid #e2e8f0',
                    }}
                  >
                    <strong
                      style={{
                        color: '#0f172a',
                      }}
                    >
                      AI SUMMARY
                    </strong>

                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                    >
                      {summary}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* =====================================================
          TAB 2: STUDY & NOTES
          ===================================================== */}
      {activeTab === 'study' && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            overflow: 'hidden',
          }}
        >
          {/* Study & Notes Secondary Navigation */}
          <div
            style={{
              display: 'flex',
              borderBottom: '1px solid #e2e8f0',
              marginBottom: '10px',
              flexShrink: 0,
            }}
          >
            <button
              onClick={() => setStudyView('notes')}
              style={{
                flex: 1,
                padding: '7px 0',
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                fontSize: '11.5px',
                fontWeight:
                  studyView === 'notes' ? 600 : 500,
                color:
                  studyView === 'notes'
                    ? '#2563eb'
                    : '#64748b',
                borderBottom:
                  studyView === 'notes'
                    ? '2px solid #2563eb'
                    : '2px solid transparent',
              }}
            >
              AI Notes
            </button>

            <button
              onClick={() =>
                setStudyView('studyMaterial')
              }
              style={{
                flex: 1,
                padding: '7px 0',
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                fontSize: '11.5px',
                fontWeight:
                  studyView === 'studyMaterial'
                    ? 600
                    : 500,
                color:
                  studyView === 'studyMaterial'
                    ? '#2563eb'
                    : '#64748b',
                borderBottom:
                  studyView === 'studyMaterial'
                    ? '2px solid #2563eb'
                    : '2px solid transparent',
              }}
            >
              Study Material
            </button>
          </div>

          {/* Active Study View */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
            }}
          >
            {studyView === 'notes' && (
              <AINotes
                content={content}
                images={images}
              />
            )}

            {studyView === 'studyMaterial' && (
              <StudyMaterial
                content={content}
              />
            )}
          </div>
        </div>
      )}

      {/* =====================================================
          TAB 3: KNOWLEDGE BASE
          ===================================================== */}
      {activeTab === 'knowledge' && (
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            minHeight: 0,
          }}
        >
          <KnowledgeBase
            title={title}
            sourceUrl={sourceUrl}
            content={content}
          />
        </div>
      )}

      {/* =====================================================
          TAB 4: CONTEXT Q&A
          ===================================================== */}
      {activeTab === 'qa' && (
        <ContextQA />
      )}

      {/* =====================================================
          TAB 5: EMAIL ASSISTANT
          ===================================================== */}
      {activeTab === 'email' && (
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            minHeight: 0,
          }}
        >
          <EmailAssistant />
        </div>
      )}

      {/* =====================================================
          TAB 6: WEB RESEARCH (FEATURE 4.12)
          ===================================================== */}
      {activeTab === 'research' && (
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            minHeight: 0,
          }}
        >
          <WebResearchPanel />
        </div>
      )}
    </div>
  );
}

export default App;