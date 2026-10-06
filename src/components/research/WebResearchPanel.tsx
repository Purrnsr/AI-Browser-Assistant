import React, { useState } from 'react';
import { executeWebResearch } from '../../services/webResearchService';
import type { ResearchResult, ResearchSourceInput } from '../../types/research';
export const WebResearchPanel: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [sources, setSources] = useState<ResearchSourceInput[]>([
    { title: '', url: '', rawHtml: '' },
  ]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ResearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);

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
      // Chrome extension API call to get active tab content
      const chromeApi = (globalThis as any).chrome;
      const [tab] = await chromeApi.tabs.query({ active: true, currentWindow: true });
      if (!tab.id) return;

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

  return (
    <div className="p-4 flex flex-col space-y-4 max-w-2xl mx-auto text-gray-800">
      <h2 className="text-xl font-bold text-gray-900">4.12 Web Research Assistant</h2>

      {/* Research Topic */}
      <div>
        <label className="block text-sm font-medium mb-1">Research Topic / Query</label>
        <input
          type="text"
          className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
          placeholder="e.g. Impact of Quantum Computing on Cybersecurity"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
        />
      </div>

      {/* Multi-source Inputs */}
      <div className="space-y-3">
        <label className="block text-sm font-medium">Sources to Consolidate</label>
        {sources.map((src, idx) => (
          <div key={idx} className="p-3 border rounded-md bg-gray-50 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-gray-600">Source #{idx + 1}</span>
              <div className="space-x-2">
                <button
                  type="button"
                  onClick={() => handleCaptureCurrentPage(idx)}
                  className="text-xs text-blue-600 hover:underline"
                >
                  Capture Active Tab
                </button>
                {sources.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeSourceInput(idx)}
                    className="text-xs text-red-500 hover:underline"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>

            <input
              type="text"
              placeholder="Source Title"
              className="w-full p-1.5 text-sm border rounded"
              value={src.title}
              onChange={(e) => handleSourceChange(idx, 'title', e.target.value)}
            />
            <input
              type="text"
              placeholder="Source URL"
              className="w-full p-1.5 text-sm border rounded"
              value={src.url}
              onChange={(e) => handleSourceChange(idx, 'url', e.target.value)}
            />
            <textarea
              placeholder="Raw Content / Captured HTML Text"
              className="w-full p-1.5 text-xs border rounded h-16"
              value={src.rawHtml}
              onChange={(e) => handleSourceChange(idx, 'rawHtml', e.target.value)}
            />
          </div>
        ))}

        <button
          type="button"
          onClick={addSourceInput}
          className="text-sm text-blue-600 font-medium hover:underline"
        >
          + Add Another Source
        </button>
      </div>

      {/* Execute Button */}
      <button
        onClick={runResearch}
        disabled={loading}
        className="w-full py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Consolidating & Synthesizing...' : 'Synthesize Research'}
      </button>

      {error && <div className="p-3 text-sm bg-red-100 text-red-700 rounded">{error}</div>}

      {/* Research Output Panel */}
      {result && (
        <div className="mt-6 p-4 border rounded-md bg-white shadow-sm space-y-4">
          <h3 className="text-lg font-bold border-b pb-2">Research Report: {result.topic}</h3>
          <div className="prose text-sm whitespace-pre-wrap">{result.synthesis}</div>
          <div className="text-xs text-gray-500 pt-2 border-t">
            Processed {result.sources.length} sources on{' '}
            {new Date(result.createdAt).toLocaleString()}
          </div>
        </div>
      )}
    </div>
  );
};