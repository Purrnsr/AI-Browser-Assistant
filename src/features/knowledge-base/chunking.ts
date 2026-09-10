import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';

const textSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 200,
});

export async function splitContentIntoChunks(
  content: string
): Promise<string[]> {
  return textSplitter.splitText(content);
}