import React, { useState } from 'react';
import { executeWebResearch, analyzeResearchPaper } from '../../services/webResearchService';
import type { ResearchResult, ResearchSourceInput, ResearchAnalysisResult } from '../../types/research';

export const WebResearchPanel: React.FC = () => {
  const [subTab, setSubTab] = useState<'web' | 'paper'>('web');

  // --- Web Research State ---
  const [topic, setTopic] = useState('');
  const [sources, setSources] = useState<ResearchSourceInput[]>([
    { title: '', url: '', rawHtml: '' },
  ]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ResearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // --- Document Analysis State ---
  const [docFile, setDocFile] = useState<File | null>(null);
  const [docQuestion, setDocQuestion] = useState('');
  const [docLoading, setDocLoading] = useState(false);
  const [docResult, setDocResult] = useState<ResearchAnalysisResult | null>(null);
  const [docError, setDocError] = useState<string | null>(null);

  // --- Web Research Handlers ---
  const handleSourceChange = (index: number, field: keyof ResearchSourceInput, value: string) => {
    const updated = [...sources];
    const source = updated[index];
    if (!source) return;
    source[field] = value;
    setSources(updated);
  };

  const addSourceInput = () => {
    setSources([...sources, { title: '', url: '', rawHtml: '' }]);
  };

  const removeSourceInput = (index: number) => {
    if (sources.length === 1) return;
    setSources(sources.filter((_, i) => i !== index));
  };

  const handleCaptureCurrentPage = async (index: number) => {
    try {
      const chromeApi = (globalThis as any).chrome;
      const [tab] = await chromeApi.tabs.query({ active: true, currentWindow: true });
      if (!tab?.id) return;

      const [{ result: pageContent }] = await chromeApi.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => ({
          title: document.title,
          url: window.location.href,
          rawHtml: document.body.innerHTML,
        }),
      });

      if (pageContent) {
        const updated = [...sources];
        updated[index] = pageContent;
        setSources(updated);
      }
    } catch (err) {
      console.error('Failed to capture active tab:', err);
    }
  };

  const runResearch = async () => {
    if (!topic.trim()) {
      setError('Please enter a research topic.');
      return;
    }

    const validSources = sources.filter((s) => s.rawHtml.trim() || s.url.trim());
    if (validSources.length === 0) {
      setError('Please add or capture at least one web source.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const researchOutput = await executeWebResearch(topic, validSources);
      setResult(researchOutput);
    } catch (err: any) {
      setError(err.message || 'Failed to generate web research report.');
    } finally {
      setLoading(false);
    }
  };

  // --- Document Analysis Handlers ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setDocFile(e.target.files[0]);
    }
  };

  const runDocAnalysis = async (analysisType: 'summary' | 'qa') => {
    if (!docFile) {
      setDocError('Please select a PDF or DOCX file to analyze.');
      return;
    }

    setDocLoading(true);
    setDocError(null);

    try {
      const res = await analyzeResearchPaper({
        file: docFile,
        analysisType,
        userQuestion: docQuestion,
      });
      setDocResult(res);
    } catch (err: any) {
      setDocError(err.message || 'Failed to analyze research paper.');
    } finally {
      setDocLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* Sub-Tab Switcher */}
      <div style={styles.subTabHeader}>
        <button
          style={{
            ...styles.subTabButton,
            ...(subTab === 'web' ? styles.subTabActive : {}),
          }}
          onClick={() => setSubTab('web')}
        >
          Web Research
        </button>
        <button
          style={{
            ...styles.subTabButton,
            ...(subTab === 'paper' ? styles.subTabActive : {}),
          }}
          onClick={() => setSubTab('paper')}
        >
          Paper Analysis
        </button>
      </div>

      {/* WEB RESEARCH SECTION */}
      {subTab === 'web' && (
        <div style={styles.section}>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Research Topic / Query</label>
            <input
              type="text"
              style={styles.input}
              placeholder="e.g. Impact of Quantum Computing on Cybersecurity"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
          </div>

          <div style={styles.fieldGroup}>
            <div style={styles.flexRowBetween}>
              <label style={styles.label}>Sources ({sources.length})</label>
              <button type="button" onClick={addSourceInput} style={styles.linkBtn}>
                + Add Source
              </button>
            </div>

            <div style={styles.sourcesList}>
              {sources.map((src, idx) => (
                <div key={idx} style={styles.sourceCard}>
                  <div style={styles.flexRowBetween}>
                    <span style={styles.badge}>Source #{idx + 1}</span>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={() => handleCaptureCurrentPage(idx)}
                        style={styles.actionBtn}
                      >
                        Capture Active Tab
                      </button>
                      {sources.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeSourceInput(idx)}
                          style={styles.dangerBtn}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>

                  <input
                    type="text"
                    placeholder="Source Title"
                    style={styles.smallInput}
                    value={src.title}
                    onChange={(e) => handleSourceChange(idx, 'title', e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Source URL"
                    style={styles.smallInput}
                    value={src.url}
                    onChange={(e) => handleSourceChange(idx, 'url', e.target.value)}
                  />
                  <textarea
                    placeholder="Raw Content / Captured HTML Text"
                    style={styles.textarea}
                    value={src.rawHtml}
                    onChange={(e) => handleSourceChange(idx, 'rawHtml', e.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={runResearch}
            disabled={loading}
            style={{
              ...styles.primaryBtn,
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? 'Synthesizing...' : 'Synthesize Research'}
          </button>

          {error && <div style={styles.errorMessage}>{error}</div>}

          {result && (
            <div style={styles.resultCard}>
              <h3 style={styles.resultTitle}>{result.topic}</h3>
              <div style={styles.resultBody}>{result.synthesis}</div>
              <div style={styles.resultFooter}>
                Processed {result.sources.length} source(s)
              </div>
            </div>
          )}
        </div>
      )}

      {/* PAPER ANALYSIS SECTION */}
      {subTab === 'paper' && (
        <div style={styles.section}>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Upload Document (PDF / DOCX)</label>
            <input
              type="file"
              accept=".pdf,.docx"
              onChange={handleFileChange}
              style={styles.fileInput}
            />
          </div>

          <button
            onClick={() => runDocAnalysis('summary')}
            disabled={docLoading || !docFile}
            style={{
              ...styles.primaryBtn,
              opacity: docLoading || !docFile ? 0.5 : 1,
            }}
          >
            {docLoading ? 'Analyzing...' : 'Summarize Paper'}
          </button>

          <hr style={styles.divider} />

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Ask a Question About Document</label>
            <input
              type="text"
              placeholder="e.g. What methodology was used in section 3?"
              value={docQuestion}
              onChange={(e) => setDocQuestion(e.target.value)}
              style={styles.input}
            />
            <button
              onClick={() => runDocAnalysis('qa')}
              disabled={docLoading || !docFile || !docQuestion.trim()}
              style={{
                ...styles.secondaryBtn,
                marginTop: '8px',
                opacity: docLoading || !docFile || !docQuestion.trim() ? 0.5 : 1,
              }}
            >
              Ask Question
            </button>
          </div>

          {docError && <div style={styles.errorMessage}>{docError}</div>}

          {docResult && (
            <div style={styles.resultCard}>
              <h3 style={styles.resultTitle}>
                {docResult.extractedSource?.title || 'Analysis Results'}
              </h3>
              <div style={styles.resultBody}>{docResult.summary}</div>
              {docResult.extractedSource && (
                <div style={styles.resultFooter}>
                  Processed {docResult.extractedSource.chunks.length} chunk(s)
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// --- Embedded Extension Styles ---
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    padding: '12px 16px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    color: '#1f2937',
    maxWidth: '100%',
    boxSizing: 'border-box',
  },
  subTabHeader: {
    display: 'flex',
    borderBottom: '2px solid #e5e7eb',
    marginBottom: '16px',
    gap: '4px',
  },
  subTabButton: {
    flex: 1,
    padding: '8px 12px',
    fontSize: '13px',
    fontWeight: 600,
    background: 'none',
    border: 'none',
    borderBottom: '2px solid transparent',
    color: '#6b7280',
    cursor: 'pointer',
    marginBottom: '-2px',
    transition: 'all 0.2s',
  },
  subTabActive: {
    color: '#2563eb',
    borderBottom: '2px solid #2563eb',
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '12px',
    fontWeight: 600,
    color: '#374151',
  },
  input: {
    padding: '8px 10px',
    fontSize: '13px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
  },
  smallInput: {
    padding: '6px 8px',
    fontSize: '12px',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    width: '100%',
    boxSizing: 'border-box',
  },
  textarea: {
    padding: '6px 8px',
    fontSize: '11px',
    fontFamily: 'monospace',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    height: '52px',
    resize: 'vertical',
    width: '100%',
    boxSizing: 'border-box',
  },
  flexRowBetween: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  linkBtn: {
    background: 'none',
    border: 'none',
    color: '#2563eb',
    fontSize: '12px',
    fontWeight: 600,
    cursor: 'pointer',
    padding: 0,
  },
  actionBtn: {
    background: 'none',
    border: 'none',
    color: '#2563eb',
    fontSize: '11px',
    cursor: 'pointer',
    textDecoration: 'underline',
  },
  dangerBtn: {
    background: 'none',
    border: 'none',
    color: '#ef4444',
    fontSize: '11px',
    cursor: 'pointer',
    textDecoration: 'underline',
  },
  sourcesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  sourceCard: {
    padding: '10px',
    backgroundColor: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: '6px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  badge: {
    fontSize: '11px',
    fontWeight: 700,
    color: '#4b5563',
  },
  primaryBtn: {
    padding: '9px 14px',
    backgroundColor: '#2563eb',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
    width: '100%',
  },
  secondaryBtn: {
    padding: '8px 12px',
    backgroundColor: '#059669',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: 600,
    cursor: 'pointer',
    width: '100%',
  },
  fileInput: {
    fontSize: '12px',
    padding: '6px 0',
  },
  divider: {
    border: 'none',
    borderTop: '1px solid #e5e7eb',
    margin: '4px 0',
  },
  errorMessage: {
    padding: '8px 12px',
    backgroundColor: '#fef2f2',
    color: '#991b1b',
    border: '1px solid #fecaca',
    borderRadius: '6px',
    fontSize: '12px',
  },
  resultCard: {
    marginTop: '10px',
    padding: '12px',
    backgroundColor: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
  },
  resultTitle: {
    margin: '0 0 8px 0',
    fontSize: '14px',
    fontWeight: 700,
    color: '#111827',
  },
  resultBody: {
    fontSize: '12px',
    lineHeight: '1.5',
    color: '#374151',
    whiteSpace: 'pre-wrap',
  },
  resultFooter: {
    marginTop: '10px',
    paddingTop: '6px',
    borderTop: '1px solid #f3f4f6',
    fontSize: '10px',
    color: '#9ca3af',
  },
};