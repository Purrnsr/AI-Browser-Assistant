import { browser } from 'wxt/browser';
export interface SavedNote {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
}

const STORAGE_KEY = 'ai-browser-assistant-notes';

export const getSavedNotes = async (): Promise<SavedNote[]> => {
  const result = await browser.storage.local.get(STORAGE_KEY);

  return (result[STORAGE_KEY] as SavedNote[]) || [];
};

export const saveNote = async (
  content: string
): Promise<SavedNote> => {
  const notes = await getSavedNotes();

  const titleMatch = content.match(/^#\s+(.+)$/m);

  const title =
    titleMatch?.[1]?.trim() || 'AI Generated Notes';

  const now = Date.now();

  const note: SavedNote = {
    id: crypto.randomUUID(),
    title,
    content,
    createdAt: now,
    updatedAt: now,
  };

  await browser.storage.local.set({
    [STORAGE_KEY]: [note, ...notes],
  });

  return note;
};

export const updateNote = async (
  id: string,
  content: string
): Promise<void> => {
  const notes = await getSavedNotes();

  const updatedNotes = notes.map((note) => {
    if (note.id !== id) {
      return note;
    }

    const titleMatch = content.match(/^#\s+(.+)$/m);

    return {
      ...note,
      title:
        titleMatch?.[1]?.trim() || 'AI Generated Notes',
      content,
      updatedAt: Date.now(),
    };
  });

  await browser.storage.local.set({
    [STORAGE_KEY]: updatedNotes,
  });
};

export const deleteNote = async (
  id: string
): Promise<void> => {
  const notes = await getSavedNotes();

  const remainingNotes = notes.filter(
    (note) => note.id !== id
  );

  await browser.storage.local.set({
    [STORAGE_KEY]: remainingNotes,
  });
};