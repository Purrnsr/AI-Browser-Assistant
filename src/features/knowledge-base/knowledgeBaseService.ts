import { knowledgeBaseDB, type KnowledgeBaseItem } from './database';
import { splitContentIntoChunks } from './chunking';
import { generateEmbedding } from './embeddings';

export interface SaveKnowledgeBaseInput {
  title: string;
  sourceUrl: string;
  sourceIdentifier: string;
  contentType: KnowledgeBaseItem['contentType'];
  content: string;
}

export async function saveToKnowledgeBase(
  input: SaveKnowledgeBaseInput
): Promise<number> {
  const now = Date.now();

  const itemId = await knowledgeBaseDB.items.add({
    title: input.title,
    sourceUrl: input.sourceUrl,
    sourceIdentifier: input.sourceIdentifier,
    contentType: input.contentType,
    content: input.content,
    createdAt: now,
    updatedAt: now,
  });

  try {
    const chunks = await splitContentIntoChunks(input.content);

    for (let index = 0; index < chunks.length; index++) {
      const embedding = await generateEmbedding(chunks[index]);

      await knowledgeBaseDB.chunks.add({
        itemId,
        chunkIndex: index,
        text: chunks[index],
        embedding,
        createdAt: now,
      });
    }

    return itemId;
  } catch (error) {
    await knowledgeBaseDB.items.delete(itemId);
    throw error;
  }
}

export async function getKnowledgeBaseItems(): Promise<
  KnowledgeBaseItem[]
> {
  return knowledgeBaseDB.items
    .orderBy('createdAt')
    .reverse()
    .toArray();
}

export async function deleteFromKnowledgeBase(
  itemId: number
): Promise<void> {
  await knowledgeBaseDB.transaction(
    'rw',
    knowledgeBaseDB.items,
    knowledgeBaseDB.chunks,
    async () => {
      await knowledgeBaseDB.chunks
        .where('itemId')
        .equals(itemId)
        .delete();

      await knowledgeBaseDB.items.delete(itemId);
    }
  );
}