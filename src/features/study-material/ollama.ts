import { buildStudyMaterialPrompt } from './prompts';

const OLLAMA_URL = 'http://127.0.0.1:11434/api/generate';
const MODEL_NAME = 'llama3.2:latest';

export const generateStudyMaterial = async (
  content: string
): Promise<string> => {
  if (!content.trim()) {
    throw new Error(
      'No webpage content available for generating study material.'
    );
  }

  const prompt = buildStudyMaterialPrompt(content);

  console.log('[Study Material] Starting generation');
  console.log('[Study Material] Content length:', content.length);
  console.log('[Study Material] Prompt length:', prompt.length);
  console.log('[Study Material] Sending request to Ollama...');

  const startTime = performance.now();

  const response = await fetch(OLLAMA_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL_NAME,
      prompt,
      stream: false,
      options: {
        temperature: 0.2,
        num_predict: 500,
        num_ctx: 4096,
      },
    }),
  });

  const responseTime = performance.now();

  console.log(
    '[Study Material] Ollama response received in:',
    ((responseTime - startTime) / 1000).toFixed(2),
    'seconds'
  );

  if (!response.ok) {
    throw new Error(
      `Ollama request failed: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();

  if (!data.response) {
    throw new Error(
      'Ollama returned an empty study-material response.'
    );
  }

  console.log('[Study Material] Generation successful.');
  console.log(
    '[Study Material] Output length:',
    data.response.trim().length
  );

  return data.response.trim();
};