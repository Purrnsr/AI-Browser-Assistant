// src/services/aiProvider.ts
import type { AppConfig } from '../types/config';

export async function fetchAvailableOllamaModels(baseUrl: string): Promise<string[]> {
  try {
    const response = await fetch(`${baseUrl}/api/tags`);
    if (!response.ok) throw new Error('Ollama service unreachable');
    const data = await response.json();
    return data.models.map((m: { name: string }) => m.name);
  } catch (error) {
    console.error('Failed to fetch Ollama models:', error);
    return [];
  }
}

export async function validateProviderConnection(config: AppConfig): Promise<boolean> {
  try {
    if (config.provider === 'ollama') {
      const res = await fetch(`${config.baseUrl}/api/version`);
      return res.ok;
    } else {
      const res = await fetch(`${config.baseUrl}/v1/models`, {
        headers: { Authorization: `Bearer ${config.apiKey || ''}` },
      });
      return res.ok;
    }
  } catch {
    return false;
  }
}