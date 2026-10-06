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