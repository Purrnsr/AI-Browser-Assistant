import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import type { ResearchSourceInput, ProcessedResearchSource, ResearchResult } from '../types/research';
/**
 * Helper function to extract plain text from raw HTML using DOMParser.
 */
export function extractCleanTextFromHtml(html: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  // Remove scripts, styles, and non-content elements
  const elementsToRemove = doc.querySelectorAll('script, style, noscript, nav, footer, header, iframe');
  elementsToRemove.forEach((el) => el.remove());

  const bodyText = doc.body?.textContent || '';
  // Collapse whitespace
  return bodyText.replace(/\s+/g, ' ').trim();
}

/**
 * Processes multiple web pages: cleans HTML and splits into vector-ready chunks.
 */
export async function processMultipleSources(
  sources: ResearchSourceInput[]
): Promise<ProcessedResearchSource[]> {
  const processed: ProcessedResearchSource[] = [];

  let index = 1;
  for (const src of sources) {
    if (!src) continue;

    const cleanText = extractCleanTextFromHtml(src.rawHtml);
    if (!cleanText) continue;

    const chunks = splitTextIntoChunks(cleanText, 1000, 200);

    processed.push({
      id: `source-${index}`,
      title: src.title || `Source ${index}`,
      url: src.url,
      extractedText: cleanText,
      chunks: chunks,
    });

    index++;
  }
  /**
 * Character text splitter with chunk overlap for vector-ready RAG processing.
 */
function splitTextIntoChunks(text: string, chunkSize = 1000, overlap = 200): string[] {
  const chunks: string[] = [];
  let startIndex = 0;

  while (startIndex < text.length) {
    const endIndex = Math.min(startIndex + chunkSize, text.length);
    const chunk = text.slice(startIndex, endIndex);
    chunks.push(chunk);

    if (endIndex === text.length) break;
    startIndex += chunkSize - overlap;
  }

  return chunks;
}

  return processed;
}

/**
 * Builds context from multiple sources and prompts local Llama 3.2 via Ollama API.
 */
export async function synthesizeResearch(
  topic: string,
  sources: ProcessedResearchSource[],
  ollamaEndpoint = 'http://localhost:11434'
): Promise<string> {
  if (sources.length === 0) {
    throw new Error('No valid source content found to research.');
  }

  // Combine top content chunks into a consolidated context block
  const consolidatedContext = sources
    .map((src, index) => {
      // Use up to the first 4 chunks per source to stay within context limits
      const sampleText = src.chunks.slice(0, 4).join('\n');
      return `[Source ${index + 1}]: "${src.title}" (${src.url})\nCONTENT:\n${sampleText}`;
    })
    .join('\n\n====================\n\n');

  const prompt = `You are an AI Web Research Assistant. Analyze and synthesize the information provided below across multiple web sources into a comprehensive research report.

RESEARCH TOPIC:
"${topic}"

CONSOLIDATED SOURCES:
${consolidatedContext}

INSTRUCTIONS:
1. Provide a concise executive summary answering the research topic.
2. Structure the findings into key thematic sections using Markdown bullet points.
3. Explicitly cite sources using [Source 1], [Source 2], etc., whenever presenting factual claims.
4. Highlight key conclusions or actionable insights at the end.

STRUCTURED RESEARCH REPORT:`;

  const response = await fetch(`${ollamaEndpoint}/api/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama3.2',
      prompt: prompt,
      stream: false,
    }),
  });

  if (!response.ok) {
    throw new Error(`Ollama connection error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.response;
}

/**
 * Main handler to process sources and run the full web research pipeline.
 */
export async function executeWebResearch(
  topic: string,
  rawSources: ResearchSourceInput[]
): Promise<ResearchResult> {
  const processedSources = await processMultipleSources(rawSources);
  const synthesis = await synthesizeResearch(topic, processedSources);

  return {
    id: `research-${Date.now()}`,
    topic,
    synthesis,
    sources: processedSources,
    createdAt: Date.now(),
  };
}