// src/services/configService.ts
import { db } from './db';
import type { AIConfig } from './db';

const DEFAULT_CONFIG: AIConfig = {
  provider: 'ollama',
  baseUrl: 'http://localhost:11434',
  selectedModel: 'llama3.2',
  embeddingModel: 'nomic-embed-text',
  chunkSize: 500,
  chunkOverlap: 50,
  topK: 4,
};

export const getConfig = async (): Promise<AIConfig> => {
  const configs = await db.config.toArray();
  const config = configs[0];
  if (config) {
    return config;
  }
  // Initialize default configuration in Dexie if none exists
  const id = await db.config.add(DEFAULT_CONFIG);
  return { ...DEFAULT_CONFIG, id };
};

export const saveConfig = async (config: AIConfig): Promise<void> => {
  const existing = await db.config.toArray();
  const firstConfig = existing[0];

  if (firstConfig?.id) {
    await db.config.update(firstConfig.id, config);
  } else {
    await db.config.add(config);
  }
};
export const fetchOllamaModels = async (baseUrl: string): Promise<string[]> => {
  try {
    const res = await fetch(`${baseUrl}/api/tags`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.models?.map((m: { name: string }) => m.name) || [];
  } catch (error) {
    console.error('Failed to fetch Ollama models:', error);
    return [];
  }
};