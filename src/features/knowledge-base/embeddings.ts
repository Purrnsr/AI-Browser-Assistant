const OLLAMA_URL = 'http://127.0.0.1:11434';

const EMBEDDING_MODEL = 'nomic-embed-text:latest';

interface OllamaEmbeddingResponse {
  embedding: number[];
}

export async function generateEmbedding(
  text: string
): Promise<number[]> {
  const response = await fetch(`${OLLAMA_URL}/api/embeddings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: EMBEDDING_MODEL,
      prompt: text,
    }),
  });

  if (!response.ok) {
    throw new Error(
      `Ollama embedding request failed: ${response.status} ${response.statusText}`
    );
  }

  const data =
    (await response.json()) as OllamaEmbeddingResponse;

  return data.embedding;
}