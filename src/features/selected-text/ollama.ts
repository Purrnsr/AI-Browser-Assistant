import {
  buildSelectedTextPrompt,
  type SelectedTextOperation,
} from './prompts';

const OLLAMA_URL = 'http://127.0.0.1:11434/api/generate';
const MODEL_NAME = 'llama3.2:latest';

export const processSelectedText = async (
  text: string,
  operation: SelectedTextOperation,
  targetLanguage?: string
): Promise<string> => {
  if (!text.trim()) {
    throw new Error('No selected text was provided.');
  }

  const prompt = buildSelectedTextPrompt(
  text,
  operation,
  targetLanguage
);

  const response = await fetch(OLLAMA_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL_NAME,
      prompt,
      stream: false,
    }),
  });

  if (!response.ok) {
    throw new Error(
      `Ollama request failed: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();

  if (!data.response?.trim()) {
    throw new Error('Ollama returned an empty response.');
  }

  return data.response.trim();
};