export interface ResearchSourceInput {
  title: string;
  url: string;
  rawHtml: string;
}

export interface ProcessedResearchSource {
  id: string;
  title: string;
  url: string;
  extractedText: string;
  chunks: string[];
}

export interface ResearchResult {
  id: string;
  topic: string;
  synthesis: string;
  sources: ProcessedResearchSource[];
  createdAt: number;
}

export interface ResearchAnalysisRequest {
  file?: File;
  content?: string;
  analysisType: 'summary' | 'methodology' | 'key_findings' | 'qa';
  userQuestion?: string;
}

export interface ResearchAnalysisResult {
  summary?: string;
  extractedSource?: ProcessedResearchSource;
  processedAt: number;
}