// src/types/config.ts

export type AIProvider = 'ollama' | 'openai-compatible';

export interface AppConfig {
  provider: AIProvider;
  baseUrl: string;             // e.g., 'http://localhost:11434' for Ollama
  apiKey?: string;             // Required for external/OpenAI-compatible endpoints
  chatModel: string;           // Baseline: 'llama3.2'
  embeddingModel: string;      // Baseline: 'nomic-embed-text'
  ragSettings: {
    chunkSize: number;        // Default: 1000
    chunkOverlap: number;     // Default: 200
    topK: number;             // Number of retrieved context chunks
  };
}

export const DEFAULT_CONFIG: AppConfig = {
  provider: 'ollama',
  baseUrl: 'http://localhost:11434',
  chatModel: 'llama3.2',
  embeddingModel: 'nomic-embed-text',
  ragSettings: {
    chunkSize: 1000,
    chunkOverlap: 200,
    topK: 4,
  },
};