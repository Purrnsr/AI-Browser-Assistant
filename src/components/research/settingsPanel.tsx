import React, { useEffect, useState } from 'react';
import type { AppConfig } from '../../types/config';
import { getConfig, saveConfig } from '../../db/schema';
import { fetchAvailableOllamaModels, validateProviderConnection } from '../../services/aiProvider';

export const SettingsPanel: React.FC = () => {
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [status, setStatus] = useState<string>('');

  useEffect(() => {
    getConfig().then((loaded) => {
      setConfig(loaded);
      if (loaded.provider === 'ollama') {
        fetchAvailableOllamaModels(loaded.baseUrl).then(setAvailableModels);
      }
    });
  }, []);

  if (!config) return <div className="p-4 text-center">Loading Configuration...</div>;

  const handleSave = async () => {
    const isConnected = await validateProviderConnection(config);
    if (!isConnected) {
      setStatus('Failed to connect to provider host.');
      return;
    }
    await saveConfig(config);
    setStatus('Configuration saved successfully!');
  };

  return (
    <div className="p-4 space-y-4 max-w-md mx-auto text-sm">
      <h2 className="text-lg font-bold">AI Assistant Settings</h2>

      {/* Provider Selector */}
      <div>
        <label className="block font-medium mb-1">AI Provider</label>
        <select
          className="w-full border p-2 rounded"
          value={config.provider}
          onChange={(e) => setConfig({ ...config, provider: e.target.value as AppConfig['provider'] })}
        >
          <option value="ollama">Ollama (Local)</option>
          <option value="openai-compatible">OpenAI Compatible API</option>
        </select>
      </div>

      {/* Base URL */}
      <div>
        <label className="block font-medium mb-1">Base URL</label>
        <input
          type="text"
          className="w-full border p-2 rounded"
          value={config.baseUrl}
          onChange={(e) => setConfig({ ...config, baseUrl: e.target.value })}
        />
      </div>

      {/* API Key (Optional / OpenAI-compatible) */}
      {config.provider === 'openai-compatible' && (
        <div>
          <label className="block font-medium mb-1">API Key</label>
          <input
            type="password"
            className="w-full border p-2 rounded"
            value={config.apiKey || ''}
            onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
            placeholder="Enter API Key"
          />
        </div>
      )}

      {/* Chat Model Selection */}
      <div>
        <label className="block font-medium mb-1">Language Model (LLM)</label>
        {config.provider === 'ollama' && availableModels.length > 0 ? (
          <select
            className="w-full border p-2 rounded"
            value={config.chatModel}
            onChange={(e) => setConfig({ ...config, chatModel: e.target.value })}
          >
            {availableModels.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        ) : (
          <input
            type="text"
            className="w-full border p-2 rounded"
            value={config.chatModel}
            onChange={(e) => setConfig({ ...config, chatModel: e.target.value })}
            placeholder="e.g. llama3.2"
          />
        )}
      </div>

      {/* Embedding Model */}
      <div>
        <label className="block font-medium mb-1">Embedding Model</label>
        <input
          type="text"
          className="w-full border p-2 rounded"
          value={config.embeddingModel}
          onChange={(e) => setConfig({ ...config, embeddingModel: e.target.value })}
          placeholder="e.g. nomic-embed-text"
        />
      </div>

      {/* RAG Parameters */}
      <fieldset className="border p-3 rounded space-y-2">
        <legend className="font-medium px-1">RAG Parameters</legend>
        <div>
          <label className="block text-xs mb-1">Chunk Size</label>
          <input
            type="number"
            className="w-full border p-1 rounded"
            value={config.ragSettings.chunkSize}
            onChange={(e) => setConfig({
              ...config,
              ragSettings: { ...config.ragSettings, chunkSize: Number(e.target.value) }
            })}
          />
        </div>
        <div>
          <label className="block text-xs mb-1">Chunk Overlap</label>
          <input
            type="number"
            className="w-full border p-1 rounded"
            value={config.ragSettings.chunkOverlap}
            onChange={(e) => setConfig({
              ...config,
              ragSettings: { ...config.ragSettings, chunkOverlap: Number(e.target.value) }
            })}
          />
        </div>
        <div>
          <label className="block text-xs mb-1">Top K (Retrieval Count)</label>
          <input
            type="number"
            className="w-full border p-1 rounded"
            value={config.ragSettings.topK}
            onChange={(e) => setConfig({
              ...config,
              ragSettings: { ...config.ragSettings, topK: Number(e.target.value) }
            })}
          />
        </div>
      </fieldset>

      <button
        onClick={handleSave}
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 font-medium"
      >
        Save Settings
      </button>

      {status && <p className="text-xs text-center font-medium mt-2">{status}</p>}
    </div>
  );
};