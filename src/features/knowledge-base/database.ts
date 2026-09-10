import Dexie, { type Table } from 'dexie';

export interface KnowledgeBaseItem {
  id?: number;

  title: string;
  sourceUrl: string;
  sourceIdentifier: string;
  contentType: 'webpage' | 'document' | 'note' | 'summary';

  content: string;

  createdAt: number;
  updatedAt: number;
}

export interface KnowledgeBaseChunk {
  id?: number;

  itemId: number;

  chunkIndex: number;
  text: string;

  embedding: number[];

  createdAt: number;
}

class KnowledgeBaseDatabase extends Dexie {
  items!: Table<KnowledgeBaseItem, number>;
  chunks!: Table<KnowledgeBaseChunk, number>;

  constructor() {
    super('SynapseAIKnowledgeBase');

    this.version(1).stores({
      items: '++id, title, sourceUrl, contentType, createdAt, updatedAt',
      chunks: '++id, itemId, chunkIndex, createdAt',
    });
  }
}

export const knowledgeBaseDB =
  new KnowledgeBaseDatabase();