
const OLLAMA_URL = 'http://127.0.0.1:11434/api/generate';
const MODEL_NAME = 'llama3.2:latest';

export const summarizeText = async (text: string): Promise<string> => {
  if (!text.trim()) {
    throw new Error('No webpage content available for summarization.');
  }
 
  const MAX_SUMMARY_INPUT = 8000;
  const summaryText = text.slice(0, MAX_SUMMARY_INPUT);

  console.log('[Summarization] Starting summarizeText()');
  console.log('[Summarization] Original content length:',       text.length);
console.log(
  '[Summarization] Content sent to Ollama:',
  summaryText.length
);

  const prompt = `You are a webpage summarization assistant.

Summarize the following webpage content clearly and concisely.

Requirements:
- Identify the main topic of the webpage.
- Extract the most important points.
- Remove unnecessary repetition and navigation-related content.
- Use simple, readable language.
- Organize the summary using short headings and bullet points where appropriate.
- Do not add information that is not present in the webpage.

Webpage content:

${summaryText}`;

  console.log('[Summarization] Prompt length:', prompt.length);
  console.log('[Summarization] Sending request to Ollama...');

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
    num_predict: 100,
  },
}),
  });

  const responseTime = performance.now();

  console.log(
    '[Summarization] Ollama response received in:',
    ((responseTime - startTime) / 1000).toFixed(2),
    'seconds'
  );

  if (!response.ok) {
    throw new Error(
      `Ollama request failed: ${response.status} ${response.statusText}`
    );
  }

  console.log('[Summarization] Parsing response...');

  

const data = await response.json();

console.log('[Summarization] Ollama prompt tokens:', data.prompt_eval_count);
console.log('[Summarization] Ollama response tokens:', data.eval_count);
console.log(
  '[Summarization] Ollama prompt evaluation:',
  (data.prompt_eval_duration / 1e9).toFixed(2),
  'seconds'
);
console.log(
  '[Summarization] Ollama response evaluation:',
  (data.eval_duration / 1e9).toFixed(2),
  'seconds'
);

const parseTime = performance.now();
  console.log(
    '[Summarization] Response parsed in:',
    ((parseTime - responseTime) / 1000).toFixed(2),
    'seconds'
  );

  if (!data.response) {
    throw new Error('Ollama returned an empty response.');
  }

  console.log(
    '[Summarization] Total summarizeText() time:',
    ((parseTime - startTime) / 1000).toFixed(2),
    'seconds'
  );

  console.log(
    '[Summarization] Summary length:',
    data.response.trim().length
  );

  return data.response.trim();
};