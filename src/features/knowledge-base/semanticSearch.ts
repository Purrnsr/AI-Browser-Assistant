import { knowledgeBaseDB, type KnowledgeBaseChunk } from './database';
import { generateEmbedding } from './embeddings';
import { cosineSimilarity } from './similarity';

export interface SemanticSearchResult {
  chunk: KnowledgeBaseChunk;
  score: number;
}

export async function semanticSearch(
  query: string,
  topK = 5
): Promise<SemanticSearchResult[]> {
  const trimmedQuery = query.trim();

  if (!trimmedQuery) {
    return [];
  }

  const queryEmbedding = await generateEmbedding(trimmedQuery);

  const chunks = await knowledgeBaseDB.chunks.toArray();

  const results = chunks.map((chunk) => ({
    chunk,
    score: cosineSimilarity(queryEmbedding, chunk.embedding),
  }));

  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}