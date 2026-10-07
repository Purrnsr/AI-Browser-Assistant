import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { browser } from 'wxt/browser';

import { KnowledgeBase } from './KnowledgeBase';
import { ContextQA } from './ContextQA';
import { AINotes } from './AINotes';
import { StudyMaterial } from './StudyMaterial';
import { EmailAssistant } from './EmailAssistant';
import { WebResearchPanel } from '../../src/components/research/WebResearchPanel';
import { StudyPanel } from '../../src/components/research/studyPanel';

import { generateQuizFromContent, generateFlashcardsFromContent } from '../../src/services/studyService';
import type { QuizSet, FlashcardSet } from '../../src/services/db';

import './App.css';

interface ExtractedImage {
  src: string;
  alt: string;
  caption: string;
}

async function summarizeTextDirect(text: string): Promise<string> {
  const response = await fetch('http://localhost:11434/api/generate', {
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
  });

  const data = await response.json();
  return data.response;
}

export function App() {
  const [activeTab, setActiveTab] = useState<
    'summarize' | 'study' | 'knowledge' | 'qa' | 'email' | 'research'
  >('summarize');

  const [summarizerView, setSummarizerView] = useState<'extracted' | 'summary'>('extracted');
  const [studyView, setStudyView] = useState<'notes' | 'studyMaterial' | 'quizFlashcards'>('notes');

  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [images, setImages] = useState<ExtractedImage[]>([]);
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [summarizing, setSummarizing] = useState(false);
  const [error, setError] = useState('');

  // Feature 4.14 State Management
  const [quizSet, setQuizSet] = useState<QuizSet | null>(null);
  const [flashcardSet, setFlashcardSet] = useState<FlashcardSet | null>(null);
  const [generatingStudy, setGeneratingStudy] = useState(false);

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

      const response = await browser.tabs.sendMessage(activeTab.id, {
        type: 'EXTRACT_PAGE',
      });

      if (!response?.success) {
        throw new Error('Failed to extract webpage content.');
      }

      setTitle(response.title || '');
      setContent(response.content || '');
      setImages(response.images || []);

      console.log('[Extraction] Images extracted:', response.images?.length || 0);
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

    setSummarizing(true);
    setError('');

    try {
      const result = await summarizeTextDirect(content);
      setSummary(result);
    } catch (err) {
      console.error('Page summarization failed:', err);
      setError(
        'Unable to generate the summary. Make sure Ollama is running and the llama3.2 model is available.'
      );
    } finally {
      setSummarizing(false);
    }
  };

  // Feature 4.14 Handlers
  const handleGenerateQuiz = async () => {
    if (!content.trim()) {
      setError('Please extract webpage content first.');
      return;
    }
    setGeneratingStudy(true);
    setError('');
    try {
      const generated = await generateQuizFromContent(content, title || 'Webpage Quiz');
      setFlashcardSet(null);
      setQuizSet(generated);
    } catch (err) {
      console.error('Quiz generation failed:', err);
      setError('Failed to generate quiz. Ensure local AI service is active.');
    } finally {
      setGeneratingStudy(false);
    }
  };

  const handleGenerateFlashcards = async () => {
    if (!content.trim()) {
      setError('Please extract webpage content first.');
      return;
    }
    setGeneratingStudy(true);
    setError('');
    try {
      const generated = await generateFlashcardsFromContent(content, title || 'Webpage Flashcards');
      setQuizSet(null);
      setFlashcardSet(generated);
    } catch (err) {
      console.error('Flashcard generation failed:', err);
      setError('Failed to generate flashcards. Ensure local AI service is active.');
    } finally {
      setGeneratingStudy(false);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h2 className="app-title">AI Browser Assistant</h2>

        {/* Primary Navigation Grid */}
        <div className="tab-container">
          <button
            className={`tab-btn ${activeTab === 'summarize' ? 'active' : ''}`}
            onClick={() => setActiveTab('summarize')}
            title="Summarizer"
          >
            Summarizer
          </button>

          <button
            className={`tab-btn ${activeTab === 'study' ? 'active' : ''}`}
            onClick={() => setActiveTab('study')}
            title="Study & Notes"
          >
            Study
          </button>

          <button
            className={`tab-btn ${activeTab === 'knowledge' ? 'active' : ''}`}
            onClick={() => setActiveTab('knowledge')}
            title="Knowledge Base"
          >
            Knowledge
          </button>

          <button
            className={`tab-btn ${activeTab === 'qa' ? 'active' : ''}`}
            onClick={() => setActiveTab('qa')}
            title="Context Q&A"
          >
            Q&A
          </button>

          <button
            className={`tab-btn ${activeTab === 'email' ? 'active' : ''}`}
            onClick={() => setActiveTab('email')}
            title="Email Assistant"
          >
            Email
          </button>

          <button
            className={`tab-btn ${activeTab === 'research' ? 'active' : ''}`}
            onClick={() => setActiveTab('research')}
            title="Web & Paper Research"
          >
            Research
          </button>
        </div>
      </header>

      {/* =====================================================
          TAB 1: SUMMARIZER
          ===================================================== */}
      {activeTab === 'summarize' && (
        <div className="tab-body">
          <div className="subtab-container">
            <button
              onClick={() => setSummarizerView('extracted')}
              className={`subtab-btn ${summarizerView === 'extracted' ? 'active' : ''}`}
            >
              Extracted Page
            </button>

            <button
              onClick={() => setSummarizerView('summary')}
              className={`subtab-btn ${summarizerView === 'summary' ? 'active' : ''}`}
            >
              AI Summary
            </button>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="scrollable-content">
            {summarizerView === 'extracted' && (
              <div>
                <button
                  onClick={extractPage}
                  disabled={loading || summarizing}
                  className="primary-btn"
                >
                  {loading ? 'Extracting...' : 'Extract Page'}
                </button>

                {loading && (
                  <div className="placeholder-text">Extracting webpage content...</div>
                )}

                {!content && !loading && !error && (
                  <div className="placeholder-box">
                    <div className="placeholder-icon">📄</div>
                    <p style={{ margin: 0 }}>
                      Click <strong>Extract Page</strong> to view content.
                    </p>
                  </div>
                )}

                {content && !loading && (
                  <div style={{ marginTop: '10px' }}>
                    <div className="section-header-label">EXTRACTED CONTENT</div>
                    <div className="extracted-content">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
                    </div>
                  </div>
                )}
              </div>
            )}

            {summarizerView === 'summary' && (
              <div>
                <button
                  onClick={summarizePage}
                  disabled={summarizing || !content.trim()}
                  className="secondary-btn"
                >
                  {summarizing ? 'Generating Summary...' : 'Generate Summary'}
                </button>

                {!content.trim() && (
                  <div className="placeholder-box">
                    Extract the webpage first from the <strong>Extracted Page</strong> tab.
                  </div>
                )}

                {summary && !summarizing && (
                  <div className="card-box">
                    <div className="section-header-label">AI SUMMARY</div>
                    <div className="extracted-content">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{summary}</ReactMarkdown>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* =====================================================
          TAB 2: STUDY & NOTES (Feature 4.14 Wired)
          ===================================================== */}
      {activeTab === 'study' && (
        <div className="tab-body">
          <div className="subtab-container">
            <button
              onClick={() => setStudyView('notes')}
              className={`subtab-btn ${studyView === 'notes' ? 'active' : ''}`}
            >
              AI Notes
            </button>

            <button
              onClick={() => setStudyView('studyMaterial')}
              className={`subtab-btn ${studyView === 'studyMaterial' ? 'active' : ''}`}
            >
              Study Material
            </button>

            <button
              onClick={() => setStudyView('quizFlashcards')}
              className={`subtab-btn ${studyView === 'quizFlashcards' ? 'active' : ''}`}
            >
              Quiz & Cards
            </button>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="scrollable-content">
            {studyView === 'notes' && <AINotes content={content} images={images} />}
            {studyView === 'studyMaterial' && <StudyMaterial content={content} />}

            {studyView === 'quizFlashcards' && (
              <div>
                {!content.trim() ? (
                  <div className="placeholder-box">
                    <div className="placeholder-icon">💡</div>
                    <p style={{ margin: 0 }}>
                      Please extract a webpage first in the <strong>Summarizer</strong> tab to generate study tools.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="study-actions-grid">
                      <button
                        className="primary-btn"
                        onClick={handleGenerateQuiz}
                        disabled={generatingStudy}
                      >
                        {generatingStudy ? 'Generating...' : '🎯 Generate Quiz'}
                      </button>
                      <button
                        className="secondary-btn"
                        onClick={handleGenerateFlashcards}
                        disabled={generatingStudy}
                      >
                        {generatingStudy ? 'Generating...' : '🎴 Generate Cards'}
                      </button>
                    </div>

                    {!quizSet && !flashcardSet && !generatingStudy && (
                      <div className="placeholder-box" style={{ marginTop: '10px' }}>
                        Choose <strong>Generate Quiz</strong> or <strong>Generate Cards</strong> to start practicing.
                      </div>
                    )}

                    {(quizSet || flashcardSet) && (
                      <div style={{ marginTop: '10px' }}>
                        <StudyPanel
                          quizSet={quizSet || undefined}
                          flashcardSet={flashcardSet || undefined}
                          onClose={() => {
                            setQuizSet(null);
                            setFlashcardSet(null);
                          }}
                        />
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* =====================================================
          TAB 3: KNOWLEDGE BASE
          ===================================================== */}
      {activeTab === 'knowledge' && (
        <div className="scrollable-content">
          <KnowledgeBase title={title} sourceUrl={sourceUrl} content={content} />
        </div>
      )}

      {/* =====================================================
          TAB 4: CONTEXT Q&A
          ===================================================== */}
      {activeTab === 'qa' && (
        <div className="scrollable-content">
          <ContextQA />
        </div>
      )}

      {/* =====================================================
          TAB 5: EMAIL ASSISTANT
          ===================================================== */}
      {activeTab === 'email' && (
        <div className="scrollable-content">
          <EmailAssistant />
        </div>
      )}

      {/* =====================================================
          TAB 6: RESEARCH PANEL
          ===================================================== */}
      {activeTab === 'research' && (
        <div className="scrollable-content">
          <WebResearchPanel />
        </div>
      )}
    </div>
  );
}

export default App;