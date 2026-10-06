import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import type {
  ResearchSourceInput,
  ProcessedResearchSource,
  ResearchResult,
  ResearchAnalysisRequest,
  ResearchAnalysisResult,
} from '../types/research';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

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

/**
 * Extract plain text from uploaded PDF or DOCX file.
 */
export async function extractTextFromFile(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();

  if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let text = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map((item: any) => item.str).join(' ') + '\n';
    }
    return text;
  }

  if (file.name.endsWith('.docx')) {
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  }

  throw new Error('Unsupported file format. Please upload a PDF or DOCX file.');
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

/**
 * Process and analyze single research documents (PDFs, DOCX, or direct text).
 */
export async function analyzeResearchPaper(
  request: ResearchAnalysisRequest,
  ollamaEndpoint = 'http://localhost:11434'
): Promise<ResearchAnalysisResult> {
  let rawText = request.content || '';
  let title = request.file?.name || 'Uploaded Document';

  if (request.file) {
    rawText = await extractTextFromFile(request.file);
  }

  if (!rawText.trim()) {
    throw new Error('No content found in the document to analyze.');
  }

  const chunks = splitTextIntoChunks(rawText, 1000, 200);

  const processedSource: ProcessedResearchSource = {
    id: `doc-${Date.now()}`,
    title,
    url: request.file ? URL.createObjectURL(request.file) : '',
    extractedText: rawText,
    chunks,
  };

  const context = chunks.slice(0, 5).join('\n\n');

  let prompt = '';
  if (request.analysisType === 'summary') {
    prompt = `Analyze the following research paper context and generate a concise summary including objectives, methodology, and key findings:\n\n${context}`;
  } else if (request.analysisType === 'qa' && request.userQuestion) {
    prompt = `Based on the following research paper context, answer this question: "${request.userQuestion}"\n\nContext:\n${context}`;
  } else {
    prompt = `Provide a structured analysis detailing key concepts, methodology, and conclusions:\n\n${context}`;
  }

  const response = await fetch(`${ollamaEndpoint}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'llama3.2',
      prompt,
      stream: false,
    }),
  });

  if (!response.ok) {
    throw new Error(`Ollama connection error: ${response.statusText}`);
  }

  const data = await response.json();

  return {
    summary: data.response,
    extractedSource: processedSource,
    processedAt: Date.now(),
  };
}